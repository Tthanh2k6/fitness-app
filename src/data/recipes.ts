/** Công thức nấu 1 người cho các món tự nấu được (FOODS có home: true trong logic/meals.ts). Giá ước tính ở chợ. */
export interface Recipe {
  minutes: number
  cost: number
  ingredients: [string, string][]
  steps: string[]
}

export const RECIPES: Record<string, Recipe> = {
  'canh-chua-gao-lut': {
    minutes: 25,
    cost: 45000,
    ingredients: [['Cá basa phi lê', '150 g'], ['Cà chua', '1 quả'], ['Dứa', '50 g'], ['Dọc mùng, giá đỗ', '80 g'], ['Me chua', '1 thìa'], ['Gạo lứt (khô)', '70 g'], ['Rau om, ngò gai', '1 nắm']],
    steps: [
      'Nấu cơm gạo lứt với tỉ lệ 1 gạo, 2 nước.',
      'Ướp cá với chút muối, tiêu trong 10 phút.',
      'Phi thơm hành, xào cà chua, thêm 500 ml nước và me.',
      'Nước sôi thì cho cá và dứa, nấu 5 phút.',
      'Cho dọc mùng, giá, nêm vừa ăn rồi tắt bếp, rắc rau om.',
    ],
  },
  'salad-uc-ga': {
    minutes: 15,
    cost: 40000,
    ingredients: [['Ức gà', '150 g'], ['Xà lách, rau mầm', '100 g'], ['Cà chua bi', '6 quả'], ['Dưa leo', '1/2 quả'], ['Sốt mè rang', '2 thìa'], ['Mè rang', '1 thìa']],
    steps: [
      'Luộc ức gà với chút muối và gừng 12 phút, để nguội rồi xé sợi.',
      'Rửa sạch rau, để ráo; cà chua bi cắt đôi, dưa leo thái lát.',
      'Trộn rau với gà, rưới sốt mè rang ngay trước khi ăn.',
      'Rắc mè rang lên trên.',
    ],
  },
  'dau-hu-sot-ca': {
    minutes: 20,
    cost: 30000,
    ingredients: [['Đậu hũ non', '2 bìa'], ['Cà chua', '2 quả'], ['Hành lá', '2 cây'], ['Gạo lứt (khô)', '70 g'], ['Dầu ăn', '1 thìa'], ['Nước mắm', '1 thìa']],
    steps: [
      'Nấu cơm gạo lứt với tỉ lệ 1 gạo, 2 nước.',
      'Đậu hũ cắt miếng vuông, áp chảo ít dầu cho vàng hai mặt.',
      'Phi hành, xào cà chua băm nhuyễn đến khi sệt, nêm nước mắm.',
      'Cho đậu vào rim nhỏ lửa 5 phút, rắc hành lá.',
    ],
  },
  'com-gao-lut-uc-ga': {
    minutes: 20,
    cost: 45000,
    ingredients: [['Ức gà', '200 g'], ['Gạo lứt (khô)', '80 g'], ['Bông cải xanh', '100 g'], ['Dầu ô liu', '1 thìa'], ['Tỏi, tiêu, muối', 'vừa đủ']],
    steps: [
      'Nấu cơm gạo lứt với tỉ lệ 1 gạo, 2 nước.',
      'Đập dẹt ức gà, ướp tỏi băm, tiêu, muối 10 phút.',
      'Áp chảo ít dầu mỗi mặt 5–6 phút đến khi chín vàng, để nghỉ 2 phút rồi thái lát.',
      'Luộc bông cải 3 phút, ăn kèm cơm và gà.',
    ],
  },
  'trung-banh-mi': {
    minutes: 12,
    cost: 15000,
    ingredients: [['Trứng gà', '2 quả'], ['Bánh mì', '1 ổ nhỏ'], ['Dưa leo', '1/2 quả'], ['Muối tiêu', 'vừa đủ']],
    steps: [
      'Cho trứng vào nồi nước lạnh, đun sôi rồi luộc thêm 8 phút.',
      'Ngâm trứng vào nước lạnh, bóc vỏ, cắt đôi.',
      'Ăn kèm bánh mì và dưa leo, chấm muối tiêu.',
    ],
  },
  'sua-chua-chuoi': {
    minutes: 5,
    cost: 20000,
    ingredients: [['Sữa chua Hy Lạp không đường', '150 g'], ['Chuối', '1 quả'], ['Hạt chia hoặc yến mạch', '1 thìa']],
    steps: [
      'Cho sữa chua ra bát.',
      'Thái chuối lát mỏng xếp lên trên.',
      'Rắc hạt chia hoặc yến mạch, ăn ngay.',
    ],
  },
  'com-ga-luoc': {
    minutes: 35,
    cost: 35000,
    ingredients: [['Đùi gà bỏ da', '1 cái (200 g)'], ['Gạo trắng (khô)', '80 g'], ['Gừng, hành', '1 nhánh'], ['Dưa leo', '1/2 quả'], ['Rau răm', '1 nắm']],
    steps: [
      'Luộc gà với gừng, hành và chút muối 20 phút, tắt bếp ngâm thêm 5 phút.',
      'Dùng nước luộc gà để nấu cơm cho thơm.',
      'Gà để nguội, chặt miếng hoặc xé sợi, bỏ da.',
      'Ăn với cơm, dưa leo và rau răm, chấm muối tiêu chanh.',
    ],
  },
  'yen-mach': {
    minutes: 10,
    cost: 20000,
    ingredients: [['Yến mạch cán', '50 g'], ['Sữa tươi không đường', '200 ml'], ['Trứng gà', '1 quả'], ['Chuối', '1 quả']],
    steps: [
      'Nấu yến mạch với sữa trên lửa nhỏ 4–5 phút, khuấy đều.',
      'Luộc hoặc ốp la trứng.',
      'Cho yến mạch ra bát, xếp chuối thái lát và trứng lên trên.',
    ],
  },
  'bo-xao-com': {
    minutes: 20,
    cost: 45000,
    ingredients: [['Thịt bò thăn', '120 g'], ['Cải ngọt hoặc bông cải', '150 g'], ['Gạo trắng (khô)', '80 g'], ['Tỏi', '2 tép'], ['Dầu ăn', '1 thìa'], ['Dầu hào', '1 thìa']],
    steps: [
      'Nấu cơm. Bò thái mỏng ngược thớ, ướp tỏi, tiêu, dầu hào 10 phút.',
      'Xào rau với tỏi trên lửa lớn 2 phút, trút ra đĩa.',
      'Xào bò lửa lớn 1–2 phút đến khi vừa tái.',
      'Cho rau vào đảo nhanh, nêm lại vừa ăn, ăn nóng với cơm.',
    ],
  },
  'sinh-to-bo': {
    minutes: 5,
    cost: 25000,
    ingredients: [['Bơ chín', '1/2 quả'], ['Chuối', '1 quả'], ['Sữa tươi không đường', '150 ml'], ['Đá', 'vài viên']],
    steps: [
      'Lấy thịt bơ, chuối bóc vỏ cắt khúc.',
      'Xay bơ, chuối, sữa và đá đến khi mịn.',
      'Uống ngay, không cần thêm sữa đặc.',
    ],
  },
  'khoai-lang-sua': {
    minutes: 25,
    cost: 18000,
    ingredients: [['Khoai lang', '2 củ nhỏ (250 g)'], ['Sữa tươi không đường', '1 hộp 180 ml']],
    steps: [
      'Rửa sạch khoai, để nguyên vỏ.',
      'Luộc hoặc hấp 20 phút đến khi xiên đũa thấy mềm.',
      'Ăn kèm một hộp sữa tươi không đường.',
    ],
  },
  'mi-y-bo-bam': {
    minutes: 30,
    cost: 45000,
    ingredients: [['Mì Ý (khô)', '90 g'], ['Thịt bò xay', '100 g'], ['Cà chua', '2 quả'], ['Hành tây', '1/2 củ'], ['Tỏi', '2 tép'], ['Dầu ô liu', '1 thìa']],
    steps: [
      'Luộc mì trong nước có muối 9–10 phút, vớt ra để ráo.',
      'Phi tỏi và hành tây băm với dầu ô liu đến khi thơm.',
      'Cho bò xay vào xào săn, thêm cà chua băm, nấu nhỏ lửa 10 phút đến khi sệt.',
      'Nêm vừa ăn, trộn sốt với mì.',
    ],
  },
}
