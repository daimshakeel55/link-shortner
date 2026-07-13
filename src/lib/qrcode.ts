import QRCode from "qrcode";

export async function generateQRCodeDataUrl(
  url: string,
  size = 256
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: "#09090B",
      light: "#FAFAFA",
    },
  });
}

export async function generateQRCodeBuffer(
  url: string,
  size = 512
): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: {
      dark: "#09090B",
      light: "#FAFAFA",
    },
  });
}
