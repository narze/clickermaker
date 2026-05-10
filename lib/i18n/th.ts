export const th = {
  page: {
    title: "เครื่องมือออกแบบคลิกเกอร์",
    description:
      "ออกแบบของเล่นคลิกเกอร์แบบกำหนดเองของคุณ พิมพ์ข้อความ เลือกสี บันทึกรูปภาพ แล้วสั่งพิมพ์ 3 มิติได้เลย",
    by: "โดย GeekCraft",
  },
  metadata: {
    title: "GeekCraft เครื่องมือออกแบบคลิกเกอร์",
    description:
      "ออกแบบของเล่นคลิกเกอร์แบบกำหนดเอง เลือกตัวอักษร สี และฟอนต์ จากนั้นบันทึกภาพตัวอย่างและสั่งซื้อจาก GeekCraft",
    shortDescription: "ออกแบบของเล่นคลิกเกอร์พิมพ์ 3 มิติในสไตล์ของคุณ",
  },
  designer: {
    hint: "ลากเพื่อหมุน · คลิกปุ่มเพื่อแก้ไข",
  },
  controls: {
    yourText: "ข้อความของคุณ",
    typeWord: "พิมพ์คำของคุณ",
    keycapCount: (n: number) => `จำนวนปุ่ม ${n} ปุ่ม`,
    removeKeycap: "ลบปุ่ม",
    addKeycap: "เพิ่มปุ่ม",
    font: "ฟอนต์",
    baseColor: "สีฐาน",
    base: "ฐาน",
    defaultColorsTitle: "สีเริ่มต้นของปุ่มและตัวอักษร",
    defaultColorsSubtitle: "ใช้กับปุ่มใหม่ กด 'ใช้กับทั้งหมด' เพื่อแทนที่สีของแต่ละปุ่ม",
    defaultKeycapColor: "สีปุ่มเริ่มต้น",
    defaultLetterColor: "สีตัวอักษรเริ่มต้น",
    keycap: "ปุ่ม",
    letter: "ตัวอักษร",
    applyToAll: "ใช้กับทั้งหมด",
    perKeycap: "แต่ละปุ่ม",
    reset: "รีเซ็ต",
    saveImage: "บันทึกรูปภาพ",
  },
  keycapRow: {
    keycapCharacter: (index: number) => `ตัวอักษรของปุ่มที่ ${index + 1}`,
    resetKeycap: (index: number) => `รีเซ็ตปุ่มที่ ${index + 1} เป็นค่าเริ่มต้น`,
  },
  colorPicker: {
    colorValue: (value: string) => `สี ${value}`,
  },
  palette: {
    pastelPink: "ชมพูพาสเทล",
    yellow: "เหลือง",
    cyan: "ฟ้า",
    white: "ขาว",
    mint: "มิ้นต์",
    lavender: "ลาเวนเดอร์",
    charcoal: "เทาเข้ม",
    hotPink: "ชมพูสด",
    cobalt: "โคบอลต์",
    forest: "เขียวป่า",
    tangerine: "ส้มแทนเจอรีน",
    plum: "พลัม",
    sun: "เหลืองอาทิตย์",
  },
} as const;
