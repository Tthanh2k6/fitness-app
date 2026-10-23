"""Tải bộ ảnh 30VNFoods từ bản công khai trên Hugging Face (không cần tài khoản) và giải nén.

    python download_30vnfoods.py --dest D:/datasets/30VNFoods

Tổng dung lượng ~4,5 GB: train.zip 3,1 GB, validation.zip 0,44 GB, test.zip 0,91 GB.
"""

import argparse
import zipfile
from pathlib import Path

from huggingface_hub import hf_hub_download

REPO = "vuongnhathien/30VNFoods"
FILES = ["train.zip", "validation.zip", "test.zip"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True, type=Path)
    ap.add_argument("--keep-zip", action="store_true", help="giữ file zip sau khi giải nén")
    args = ap.parse_args()
    args.dest.mkdir(parents=True, exist_ok=True)

    for name in FILES:
        print("Đang tải", name)
        path = Path(hf_hub_download(REPO, name, repo_type="dataset", local_dir=args.dest / "_zips"))
        print("Giải nén", path.name)
        with zipfile.ZipFile(path) as z:
            z.extractall(args.dest)
        if not args.keep_zip:
            path.unlink()
    print("Xong. Cấu trúc thư mục:")
    for p in sorted(args.dest.iterdir()):
        if p.is_dir() and p.name != "_zips":
            print(" ", p.name, f"({sum(1 for c in p.iterdir() if c.is_dir())} lớp)")


if __name__ == "__main__":
    main()
