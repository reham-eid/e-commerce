import QRCode from "qrcode";

export async function QRgeneration(data) {
  const qr = await QRCode.toDataURL(data, { errorCorrectionLevel: "H" });
  return qr;
}
