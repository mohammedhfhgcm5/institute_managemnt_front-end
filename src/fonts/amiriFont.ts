import { jsPDF } from "jspdf"

export async function loadAmiriFont(doc: jsPDF) {
  const response = await fetch("/src/fonts/amiri/Amiri-Regular.ttf")
  const font = await response.arrayBuffer()

  const base64 = btoa(
    new Uint8Array(font).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  )

  doc.addFileToVFS("Amiri-Regular.ttf", base64)
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal")
}
