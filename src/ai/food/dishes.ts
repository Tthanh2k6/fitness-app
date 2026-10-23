// Bảng dinh dưỡng 28 món (khẩu phần vừa: m; nhỏ/lớn = ×0,75/×1,35). Nguồn và độ tin cậy: docs/food-research.md
// estimated = số liệu ước tính, chưa có trong bảng tổng hợp
export interface Dish {
  id: string
  name: string
  /** Tên lớp trong bộ ảnh 30VNFoods, khớp với nhãn của model */
  datasetClass: string
  kcal: { s: number; m: number; l: number }
  proteinG: number
  carbG: number
  fatG: number
  priceVnd: [number, number]
  estimated: boolean
}

export const DISHES: Dish[] = [
  { id: 'banh-beo', name: 'Bánh bèo', datasetClass: 'Banh beo', kcal: { s: 270, m: 358, l: 480 }, proteinG: 13.3, carbG: 44.9, fatG: 13.9, priceVnd: [25000, 40000], estimated: false },
  { id: 'banh-bot-loc', name: 'Bánh bột lọc', datasetClass: 'Banh bot loc', kcal: { s: 360, m: 485, l: 660 }, proteinG: 13.2, carbG: 62.7, fatG: 20.2, priceVnd: [25000, 45000], estimated: false },
  { id: 'banh-can', name: 'Bánh căn', datasetClass: 'Banh can', kcal: { s: 260, m: 350, l: 470 }, proteinG: 12, carbG: 55, fatG: 9, priceVnd: [30000, 50000], estimated: true },
  { id: 'banh-canh', name: 'Bánh canh', datasetClass: 'Banh canh', kcal: { s: 280, m: 378, l: 510 }, proteinG: 21.4, carbG: 54.3, fatG: 8.4, priceVnd: [35000, 60000], estimated: false },
  { id: 'banh-chung', name: 'Bánh chưng', datasetClass: 'Banh chung', kcal: { s: 310, m: 408, l: 550 }, proteinG: 14.9, carbG: 74.7, fatG: 5.5, priceVnd: [20000, 40000], estimated: false },
  { id: 'banh-cuon', name: 'Bánh cuốn', datasetClass: 'Banh cuon', kcal: { s: 440, m: 590, l: 800 }, proteinG: 25.7, carbG: 64.3, fatG: 25.6, priceVnd: [30000, 50000], estimated: false },
  { id: 'banh-gio', name: 'Bánh giò', datasetClass: 'Banh gio', kcal: { s: 160, m: 215, l: 290 }, proteinG: 9.3, carbG: 28.5, fatG: 7.1, priceVnd: [15000, 30000], estimated: false },
  { id: 'banh-khot', name: 'Bánh khọt', datasetClass: 'Banh khot', kcal: { s: 230, m: 308, l: 420 }, proteinG: 11.6, carbG: 33.6, fatG: 14.2, priceVnd: [35000, 60000], estimated: true },
  { id: 'banh-mi', name: 'Bánh mì thịt', datasetClass: 'Banh mi', kcal: { s: 350, m: 461, l: 620 }, proteinG: 17.8, carbG: 55.3, fatG: 18.7, priceVnd: [20000, 35000], estimated: false },
  { id: 'banh-tet', name: 'Bánh tét', datasetClass: 'Banh tet', kcal: { s: 310, m: 408, l: 550 }, proteinG: 14.9, carbG: 74.7, fatG: 5.5, priceVnd: [20000, 40000], estimated: false },
  { id: 'banh-trang-nuong', name: 'Bánh tráng nướng', datasetClass: 'Banh trang nuong', kcal: { s: 190, m: 250, l: 340 }, proteinG: 9, carbG: 30, fatG: 11, priceVnd: [15000, 30000], estimated: true },
  { id: 'banh-xeo', name: 'Bánh xèo', datasetClass: 'Banh xeo', kcal: { s: 390, m: 517, l: 700 }, proteinG: 15, carbG: 70.9, fatG: 19.3, priceVnd: [30000, 60000], estimated: false },
  { id: 'bun-bo-hue', name: 'Bún bò Huế', datasetClass: 'Bun bo Hue', kcal: { s: 360, m: 479, l: 650 }, proteinG: 18.4, carbG: 65.3, fatG: 16, priceVnd: [40000, 65000], estimated: false },
  { id: 'bun-dau-mam-tom', name: 'Bún đậu mắm tôm', datasetClass: 'Bun dau mam tom', kcal: { s: 570, m: 760, l: 1030 }, proteinG: 58.3, carbG: 48.9, fatG: 44.5, priceVnd: [40000, 75000], estimated: false },
  { id: 'bun-mam', name: 'Bún mắm', datasetClass: 'Bun mam', kcal: { s: 360, m: 480, l: 650 }, proteinG: 28.2, carbG: 56.8, fatG: 15.5, priceVnd: [45000, 70000], estimated: false },
  { id: 'bun-rieu', name: 'Bún riêu', datasetClass: 'Bun rieu', kcal: { s: 360, m: 481, l: 650 }, proteinG: 16.5, carbG: 66, fatG: 16.8, priceVnd: [35000, 60000], estimated: false },
  { id: 'bun-thit-nuong', name: 'Bún thịt nướng', datasetClass: 'Bun thit nuong', kcal: { s: 340, m: 451, l: 610 }, proteinG: 14.7, carbG: 67.3, fatG: 13.7, priceVnd: [35000, 55000], estimated: false },
  { id: 'ca-kho-to', name: 'Cá kho tộ', datasetClass: 'Ca kho to', kcal: { s: 200, m: 264, l: 360 }, proteinG: 31.4, carbG: 17.4, fatG: 7.6, priceVnd: [35000, 60000], estimated: false },
  { id: 'canh-chua', name: 'Canh chua cá', datasetClass: 'Canh chua', kcal: { s: 110, m: 150, l: 200 }, proteinG: 15, carbG: 8, fatG: 6, priceVnd: [25000, 50000], estimated: true },
  { id: 'cao-lau', name: 'Cao lầu', datasetClass: 'Cao lau', kcal: { s: 380, m: 500, l: 680 }, proteinG: 22, carbG: 65, fatG: 16, priceVnd: [40000, 65000], estimated: true },
  { id: 'chao-long', name: 'Cháo lòng', datasetClass: 'Chao long', kcal: { s: 310, m: 412, l: 560 }, proteinG: 30.8, carbG: 41.7, fatG: 13.5, priceVnd: [30000, 50000], estimated: false },
  { id: 'com-tam', name: 'Cơm tấm sườn', datasetClass: 'Com tam', kcal: { s: 400, m: 529, l: 710 }, proteinG: 20.7, carbG: 81.6, fatG: 13.3, priceVnd: [35000, 70000], estimated: false },
  { id: 'goi-cuon', name: 'Gỏi cuốn', datasetClass: 'Goi cuon', kcal: { s: 110, m: 147, l: 200 }, proteinG: 7.7, carbG: 17.8, fatG: 5, priceVnd: [15000, 30000], estimated: false },
  { id: 'hu-tieu', name: 'Hủ tiếu Nam Vang', datasetClass: 'Hu tieu', kcal: { s: 300, m: 400, l: 540 }, proteinG: 24.3, carbG: 42.5, fatG: 14.8, priceVnd: [40000, 70000], estimated: false },
  { id: 'mi-quang', name: 'Mì Quảng', datasetClass: 'Mi quang', kcal: { s: 410, m: 541, l: 730 }, proteinG: 22.4, carbG: 67.4, fatG: 20.2, priceVnd: [35000, 60000], estimated: false },
  { id: 'nem-chua', name: 'Nem chua', datasetClass: 'Nem chua', kcal: { s: 100, m: 137, l: 180 }, proteinG: 21.7, carbG: 4.3, fatG: 3.7, priceVnd: [20000, 40000], estimated: true },
  { id: 'pho', name: 'Phở bò', datasetClass: 'Pho', kcal: { s: 310, m: 414, l: 560 }, proteinG: 17.9, carbG: 59.3, fatG: 11.7, priceVnd: [45000, 80000], estimated: false },
  { id: 'xoi-xeo', name: 'Xôi xéo', datasetClass: 'Xoi xeo', kcal: { s: 400, m: 534, l: 720 }, proteinG: 15.4, carbG: 92.8, fatG: 11.2, priceVnd: [15000, 30000], estimated: true },
]

export const dishByClass = (cls: string) => DISHES.find((d) => d.datasetClass === cls)
