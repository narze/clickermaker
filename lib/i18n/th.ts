export const th = {
  page: {
    title: "ออกแบบคลิกเกอร์ของคุณ",
    description:
      "พิมพ์คำที่อยากได้ เลือกสี เลือกฟอนต์ แล้วดูตัวอย่างก่อนบันทึกภาพเพื่อสั่งผลิตกับ GeekCraft",
    by: "GeekCraft",
  },
  metadata: {
    title: "ออกแบบคลิกเกอร์กับ GeekCraft",
    description:
      "ออกแบบคลิกเกอร์ของคุณเอง เลือกตัวอักษร สี และฟอนต์ แล้วบันทึกภาพตัวอย่างไปสั่งผลิตกับ GeekCraft",
    shortDescription: "ออกแบบคลิกเกอร์พิมพ์ 3 มิติในแบบของคุณ",
  },
  designer: {
    hint: "ลากเพื่อหมุน · คลิกที่ปุ่มเพื่อปรับสี",
    disclaimer: "ภาพนี้เป็นภาพจำลอง สีและรูปร่างของสินค้าจริงอาจต่างจากในภาพ",
  },
  controls: {
    yourText: "ข้อความบนปุ่ม",
    typeWord: "พิมพ์คำที่ต้องการ",
    keycapCount: (n: number) => `${n} ปุ่ม`,
    removeKeycap: "ลดจำนวนปุ่ม",
    addKeycap: "เพิ่มจำนวนปุ่ม",
    font: "ฟอนต์",
    keyLayout: "ทิศทางปุ่ม",
    keyLayoutHorizontal: "ซ้าย → ขวา",
    keyLayoutVertical: "บน → ล่าง",
    baseColor: "สีฐาน",
    base: "ฐาน",
    defaultColorsTitle: "สีเริ่มต้นของปุ่มและตัวอักษร",
    defaultColorsSubtitle:
      "สีนี้จะใช้กับปุ่มใหม่ ถ้าอยากเปลี่ยนทั้งชุด กด “ใช้กับทุกปุ่ม”",
    defaultKeycapColor: "สีปุ่ม",
    defaultLetterColor: "สีตัวอักษร",
    keycap: "ปุ่ม",
    letter: "ตัวอักษร",
    randomColors: "สุ่มสี",
    applyToAll: "ใช้กับทุกปุ่ม",
    perKeycap: "ปรับทีละปุ่ม",
    reset: "เริ่มใหม่",
    saveImage: "บันทึกรูปภาพ",
  },
  keycapRow: {
    keycapCharacter: (index: number) => `ตัวอักษรปุ่มที่ ${index + 1}`,
    resetKeycap: (index: number) =>
      `รีเซ็ตปุ่มที่ ${index + 1} เป็นค่าเริ่มต้น`,
  },
  colorPicker: {
    colorValue: (value: string) => `สี ${value}`,
  },
  colorLimit: {
    hint: (max: number) => `เลือกสีบนปุ่มได้สูงสุด ${max} สี (ไม่นับสีฐาน)`,
    used: (used: number, max: number) => `ใช้สีไปแล้ว ${used}/${max} สี`,
    swatchDisabled: (max: number) =>
      `เลือกสีนี้ไม่ได้ เพราะจะเกิน ${max} สีบนปุ่ม`,
  },
  palette: {
    pastelPink: "ชมพูพาสเทล",
    yellow: "เหลือง",
    cyan: "ฟ้า",
    white: "ขาว",
    mint: "เขียวมิ้นต์",
    lavender: "ม่วงลาเวนเดอร์",
    black: "ดำ",
    hotPink: "ชมพูบานเย็น",
    cobalt: "น้ำเงินโคบอลต์",
    forest: "เขียวเข้ม",
    tangerine: "ส้มสด",
    plum: "พลัม",
    notInSwatches: "สีนอกชุดตัวอย่าง",
  },
  exportImage: {
    fontPrefix: "ฟอนต์",
    colorsPrefix: "สี",
  },
} as const
