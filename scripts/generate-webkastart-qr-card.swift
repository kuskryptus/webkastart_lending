import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation

let canvasSize = CGSize(width: 1080, height: 1080)
let destination = URL(fileURLWithPath: CommandLine.arguments.dropFirst().first ?? "public/webkastart-qr-card.png")
let logoURL = URL(fileURLWithPath: "public/logo-mark.svg")
let websiteURL = "https://webkastart.sk/"

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(srgbRed: red / 255, green: green / 255, blue: blue / 255, alpha: alpha)
}

func drawCenteredText(
  _ text: String,
  y: CGFloat,
  height: CGFloat,
  font: NSFont,
  textColor: NSColor,
  tracking: CGFloat = 0
) {
  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center
  paragraph.lineBreakMode = .byClipping

  text.draw(
    in: CGRect(x: 90, y: y, width: canvasSize.width - 180, height: height),
    withAttributes: [
      .font: font,
      .foregroundColor: textColor,
      .paragraphStyle: paragraph,
      .kern: tracking,
    ]
  )
}

func makeQRCode(_ value: String, maximumSize: CGFloat) throws -> CGImage {
  let filter = CIFilter.qrCodeGenerator()
  filter.message = Data(value.utf8)
  filter.correctionLevel = "H"

  guard let output = filter.outputImage else {
    throw NSError(domain: "WebkaStartQR", code: 1, userInfo: [NSLocalizedDescriptionKey: "QR kód sa nepodarilo vytvoriť."])
  }

  let moduleCount = output.extent.width
  let integerScale = max(1, floor(maximumSize / moduleCount))
  let scaled = output.transformed(by: CGAffineTransform(scaleX: integerScale, y: integerScale))
  let context = CIContext(options: [.useSoftwareRenderer: false])

  guard let image = context.createCGImage(scaled, from: scaled.extent) else {
    throw NSError(domain: "WebkaStartQR", code: 2, userInfo: [NSLocalizedDescriptionKey: "QR obrázok sa nepodarilo vyrenderovať."])
  }

  return image
}

guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: Int(canvasSize.width),
  pixelsHigh: Int(canvasSize.height),
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
), let bitmapContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
  throw NSError(domain: "WebkaStartQR", code: 3, userInfo: [NSLocalizedDescriptionKey: "Bitmapu sa nepodarilo vytvoriť."])
}

let drawingContext = NSGraphicsContext(cgContext: bitmapContext.cgContext, flipped: true)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = drawingContext
defer { NSGraphicsContext.restoreGraphicsState() }

let background = color(239, 237, 234)
let cardColor = color(250, 250, 249)
let foreground = color(24, 23, 22)
let muted = color(111, 107, 103)
let border = color(225, 222, 218)
let brand = color(95, 82, 232)

background.setFill()
NSBezierPath(rect: CGRect(origin: .zero, size: canvasSize)).fill()

let cardRect = CGRect(x: 42, y: 42, width: 996, height: 996)
let cardPath = NSBezierPath(roundedRect: cardRect, xRadius: 64, yRadius: 64)

NSGraphicsContext.saveGraphicsState()
let shadow = NSShadow()
shadow.shadowColor = color(24, 23, 22, 0.12)
shadow.shadowBlurRadius = 30
shadow.shadowOffset = CGSize(width: 0, height: 10)
shadow.set()
cardColor.setFill()
cardPath.fill()
NSGraphicsContext.restoreGraphicsState()

border.setStroke()
cardPath.lineWidth = 2
cardPath.stroke()

if let logo = NSImage(contentsOf: logoURL) {
  logo.draw(
    in: CGRect(x: 494, y: 98, width: 92, height: 58),
    from: .zero,
    operation: .sourceOver,
    fraction: 1,
    respectFlipped: true,
    hints: [.interpolation: NSImageInterpolation.high]
  )
}

drawCenteredText(
  "WEBKASTART",
  y: 174,
  height: 44,
  font: .systemFont(ofSize: 32, weight: .bold),
  textColor: foreground,
  tracking: 6
)

drawCenteredText(
  "WEBY  ·  APLIKÁCIE  ·  AUTOMATIZÁCIE",
  y: 226,
  height: 28,
  font: .systemFont(ofSize: 15, weight: .medium),
  textColor: muted,
  tracking: 1.8
)

let qrContainer = CGRect(x: 247, y: 290, width: 586, height: 586)
let qrContainerPath = NSBezierPath(roundedRect: qrContainer, xRadius: 38, yRadius: 38)
NSColor.white.setFill()
qrContainerPath.fill()
color(232, 230, 227).setStroke()
qrContainerPath.lineWidth = 2
qrContainerPath.stroke()

let qrImage = try makeQRCode(websiteURL, maximumSize: 458)
let qrSide = CGFloat(qrImage.width)
let qrRect = CGRect(
  x: floor((canvasSize.width - qrSide) / 2),
  y: qrContainer.minY + floor((qrContainer.height - qrSide) / 2),
  width: qrSide,
  height: qrSide
)

if let context = NSGraphicsContext.current?.cgContext {
  context.saveGState()
  context.interpolationQuality = .none
  context.translateBy(x: 0, y: canvasSize.height)
  context.scaleBy(x: 1, y: -1)
  context.draw(qrImage, in: CGRect(x: qrRect.minX, y: canvasSize.height - qrRect.maxY, width: qrRect.width, height: qrRect.height))
  context.restoreGState()
}

drawCenteredText(
  "Naskenujte a pozrite si moje projekty",
  y: 908,
  height: 32,
  font: .systemFont(ofSize: 21, weight: .semibold),
  textColor: foreground
)

drawCenteredText(
  "webkastart.sk",
  y: 952,
  height: 30,
  font: .systemFont(ofSize: 18, weight: .semibold),
  textColor: brand,
  tracking: 0.5
)

guard let pixels = bitmap.bitmapData else {
  throw NSError(domain: "WebkaStartQR", code: 4, userInfo: [NSLocalizedDescriptionKey: "Bitmapové dáta nie sú dostupné."])
}

let width = bitmap.pixelsWide
let height = bitmap.pixelsHigh
let bytesPerPixel = bitmap.bitsPerPixel / 8
let bytesPerRow = bitmap.bytesPerRow

for y in 0..<(height / 2) {
  for x in 0..<width {
    let oppositeY = height - 1 - y
    let firstOffset = y * bytesPerRow + x * bytesPerPixel
    let secondOffset = oppositeY * bytesPerRow + x * bytesPerPixel

    for byteIndex in 0..<bytesPerPixel {
      let value = pixels[firstOffset + byteIndex]
      pixels[firstOffset + byteIndex] = pixels[secondOffset + byteIndex]
      pixels[secondOffset + byteIndex] = value
    }
  }
}

guard let png = bitmap.representation(using: .png, properties: [.compressionFactor: 1]) else {
  throw NSError(domain: "WebkaStartQR", code: 5, userInfo: [NSLocalizedDescriptionKey: "PNG sa nepodarilo uložiť."])
}

try FileManager.default.createDirectory(at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
try png.write(to: destination, options: .atomic)
print(destination.path)
