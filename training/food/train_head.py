"""Huấn luyện lớp phân loại món ăn Việt trên vector đặc trưng MobileNetV3.

Cách làm (học chuyển giao): MobileNetV3 đã học sẵn cách "nhìn" ảnh. Ta cho từng ảnh món ăn
đi qua MobileNetV3 (MediaPipe ImageEmbedder) để lấy vector đặc trưng, rồi tự huấn luyện một
lớp phân loại (hồi quy logistic nhiều lớp) trên các vector đó. App chạy đúng model trích đặc
trưng này trong trình duyệt nên kết quả khớp với lúc huấn luyện.

Chạy:
    python train_head.py --data D:/datasets/30VNFoods --model models/mobilenet_v3_large.tflite

Kết quả:
    public/models/food-head.json   lớp phân loại cho app
    training/food/report.json      độ chính xác từng món, các cặp món hay nhầm
"""

import argparse
import hashlib
import json
import random
import time
from collections import Counter
from pathlib import Path

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import ImageEmbedder, ImageEmbedderOptions
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

HERE = Path(__file__).resolve().parent
APP = HERE.parent.parent
# Hai lớp bỏ khỏi app: "Banh duc" nhãn nhiễu, "Banh pia" thiếu số liệu dinh dưỡng (xem docs/food-research.md)
EXCLUDE = {"Banh duc", "Banh pia"}
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SPLIT_NAMES = {"train": ("train", "Train"), "val": ("validation", "val", "valid", "Validate"), "test": ("test", "Test")}


def find_splits(root: Path) -> dict[str, Path]:
    """Hỗ trợ cả dạng root/<split>/<lớp>/ảnh và root/<lớp>/ảnh."""
    found = {}
    for split, names in SPLIT_NAMES.items():
        for name in names:
            if (root / name).is_dir():
                found[split] = root / name
                break
    return found or {"all": root}


def list_images(folder: Path, per_class: int, rng: random.Random) -> list[tuple[Path, str]]:
    items = []
    for cls_dir in sorted(p for p in folder.iterdir() if p.is_dir()):
        if cls_dir.name in EXCLUDE:
            continue
        files = sorted(f for f in cls_dir.rglob("*") if f.suffix.lower() in EXTS)
        rng.shuffle(files)
        items += [(f, cls_dir.name) for f in files[:per_class]]
    return items


def embed_all(embedder: ImageEmbedder, items: list[tuple[Path, str]], tag: str, flip: bool = False):
    """flip=True thêm bản lật ngang của mỗi ảnh (tăng cường dữ liệu: món ăn lật vẫn là món đó)."""
    vectors, labels, skipped = [], [], 0
    start = time.time()
    for i, (path, cls) in enumerate(items, 1):
        try:
            image = mp.Image.create_from_file(str(path))
            vectors.append(embedder.embed(image).embeddings[0].embedding)
            labels.append(cls)
            if flip:
                mirrored = np.ascontiguousarray(image.numpy_view()[:, ::-1])
                vectors.append(embedder.embed(mp.Image(image_format=image.image_format, data=mirrored)).embeddings[0].embedding)
                labels.append(cls)
        except Exception:  # ảnh hỏng hoặc định dạng lạ: bỏ qua
            skipped += 1
        if i % 500 == 0 or i == len(items):
            print(f"  [{tag}] {i}/{len(items)} ảnh, {time.time() - start:.0f}s")
    return np.asarray(vectors, dtype=np.float32), np.asarray(labels), skipped


def cached(name: str, items: list[tuple[Path, str]], compute):
    """Lưu vector đặc trưng ra cache/ để lần huấn luyện sau (đổi tham số) khỏi trích lại.
    Tên file gồm dấu vân tay của danh sách ảnh: thêm/bớt ảnh hay món thì tự trích lại."""
    digest = hashlib.sha1("\n".join(f"{p}|{c}" for p, c in items).encode()).hexdigest()[:10]
    path = HERE / "cache" / f"{name}-{digest}.npz"
    if path.exists():
        d = np.load(path)
        print(f"  [{name}] dùng lại {len(d['y'])} vector đã lưu")
        return d["X"], d["y"], 0
    X, y, skipped = compute()
    path.parent.mkdir(exist_ok=True)
    np.savez_compressed(path, X=X, y=y)
    return X, y, skipped


def topk_accuracy(proba: np.ndarray, classes: np.ndarray, truth: np.ndarray, k: int) -> float:
    top = classes[np.argsort(-proba, axis=1)[:, :k]]
    return float(np.mean([t in row for t, row in zip(truth, top)]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, type=Path, help="thư mục bộ ảnh 30VNFoods đã giải nén")
    ap.add_argument("--model", required=True, type=Path, help="mobilenet_v3_large.tflite (ImageEmbedder)")
    ap.add_argument("--per-class", type=int, default=400, help="số ảnh tối đa mỗi món cho tập huấn luyện")
    ap.add_argument("--test-per-class", type=int, default=100)
    ap.add_argument("--C", type=float, default=2.0, help="độ mạnh điều chuẩn, nhỏ hơn = điều chuẩn mạnh hơn")
    ap.add_argument("--out", type=Path, default=APP / "public" / "models" / "food-head.json")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--no-flip", action="store_true", help="không thêm ảnh lật ngang vào tập huấn luyện")
    args = ap.parse_args()

    splits = find_splits(args.data)
    print("Thư mục tìm thấy:", {k: str(v) for k, v in splits.items()})

    embedder = ImageEmbedder.create_from_options(
        ImageEmbedderOptions(base_options=BaseOptions(model_asset_path=str(args.model)), l2_normalize=True, quantize=False)
    )

    if "train" in splits:
        flip = not args.no_flip
        train_items = list_images(splits["train"], args.per_class, random.Random(f"{args.seed}-train"))
        X_train, y_train, s1 = cached(
            f"train-{'flip' if flip else 'plain'}", train_items, lambda: embed_all(embedder, train_items, "train", flip=flip)
        )
        test_dir = splits.get("test") or splits.get("val")
        test_items = list_images(test_dir, args.test_per_class, random.Random(f"{args.seed}-test"))
        X_test, y_test, s2 = cached("test", test_items, lambda: embed_all(embedder, test_items, "test"))
    else:
        X, y, s1 = embed_all(embedder, list_images(splits["all"], args.per_class + args.test_per_class, random.Random(args.seed)), "all")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=args.seed)
        s2 = 0
    print(f"Bỏ qua {s1 + s2} ảnh lỗi. Huấn luyện {len(X_train)} ảnh, kiểm tra {len(X_test)} ảnh, {X_train.shape[1]} chiều.")

    clf = LogisticRegression(C=args.C, max_iter=3000)
    clf.fit(X_train, y_train)

    proba = clf.predict_proba(X_test)
    top1 = topk_accuracy(proba, clf.classes_, y_test, 1)
    top3 = topk_accuracy(proba, clf.classes_, y_test, 3)
    print(f"Độ chính xác trên ảnh chưa thấy khi huấn luyện: top-1 {top1:.1%}, top-3 {top3:.1%}")

    pred = clf.classes_[np.argmax(proba, axis=1)]
    per_class = {c: float(np.mean(pred[y_test == c] == c)) for c in clf.classes_}
    confusions = Counter((t, p) for t, p in zip(y_test, pred) if t != p).most_common(10)

    head = {
        "version": 1,
        "embedder": args.model.stem,
        "labels": [str(c) for c in clf.classes_],
        "dim": int(X_train.shape[1]),
        "W": [round(float(v), 5) for v in clf.coef_.ravel()],
        "b": [round(float(v), 5) for v in clf.intercept_],
        "metrics": {"top1": round(top1, 4), "top3": round(top3, 4), "testImages": int(len(X_test))},
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(head, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    report = {
        "top1": top1,
        "top3": top3,
        "trainImages": int(len(X_train)),
        "testImages": int(len(X_test)),
        "perClassTop1": dict(sorted(per_class.items(), key=lambda kv: kv[1])),
        "mostConfused": [{"that": t, "predicted": p, "count": n} for (t, p), n in confusions],
    }
    (HERE / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Đã ghi", args.out, "và", HERE / "report.json")


if __name__ == "__main__":
    main()
