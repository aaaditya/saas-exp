import { PDFDocument, degrees, rgb } from 'pdf-lib'
import * as pdfjs from 'pdfjs-dist'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import type { LoadedPdf } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  return {
    id: uid(),
    file,
    name: file.name,
    bytes,
    pageCount: doc.getPageCount(),
  }
}

export async function mergePdfs(files: LoadedPdf[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const f of files) {
    const src = await PDFDocument.load(f.bytes, { ignoreEncryption: true })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  return out.save({ useObjectStreams: true })
}

export type SplitMode = 'each' | 'range'

export async function splitPdf(
  file: LoadedPdf,
  mode: SplitMode,
  rangeStart = 1,
  rangeEnd?: number,
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
  const total = src.getPageCount()
  const end = Math.min(rangeEnd ?? total, total)
  const start = Math.max(1, Math.min(rangeStart, total))
  const base = file.name.replace(/\.pdf$/i, '')

  if (mode === 'each') {
    const results: { name: string; bytes: Uint8Array }[] = []
    for (let i = 0; i < total; i++) {
      const doc = await PDFDocument.create()
      const [page] = await doc.copyPages(src, [i])
      doc.addPage(page)
      results.push({
        name: `${base}-page-${i + 1}.pdf`,
        bytes: await doc.save({ useObjectStreams: true }),
      })
    }
    return results
  }

  const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, indices)
  pages.forEach((p) => doc.addPage(p))
  return [
    {
      name: `${base}-p${start}-${end}.pdf`,
      bytes: await doc.save({ useObjectStreams: true }),
    },
  ]
}

export type CompressLevel = 'light' | 'balanced' | 'strong'

const COMPRESS_SCALE: Record<CompressLevel, number> = {
  light: 1.5,
  balanced: 1.15,
  strong: 0.85,
}

const COMPRESS_QUALITY: Record<CompressLevel, number> = {
  light: 0.82,
  balanced: 0.72,
  strong: 0.55,
}

export async function compressPdf(
  file: LoadedPdf,
  level: CompressLevel,
  onProgress?: (pct: number) => void,
): Promise<Uint8Array> {
  const pdf = await pdfjs.getDocument({ data: file.bytes.slice(0) }).promise
  const out = await PDFDocument.create()
  const scale = COMPRESS_SCALE[level]
  const quality = COMPRESS_QUALITY[level]

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')

    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Encode failed'))),
        'image/jpeg',
        quality,
      )
    })
    const imgBytes = new Uint8Array(await blob.arrayBuffer())
    const jpg = await out.embedJpg(imgBytes)
    const p = out.addPage([jpg.width, jpg.height])
    p.drawImage(jpg, { x: 0, y: 0, width: jpg.width, height: jpg.height })
    onProgress?.(Math.round((i / pdf.numPages) * 100))
  }

  return out.save({ useObjectStreams: true })
}

export interface OrganizeOp {
  sourceIndex: number
  rotation: 0 | 90 | 180 | 270
  deleted?: boolean
}

export async function organizePdf(
  file: LoadedPdf,
  ops: OrganizeOp[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
  const out = await PDFDocument.create()
  const kept = ops.filter((o) => !o.deleted)

  for (const op of kept) {
    const [page] = await out.copyPages(src, [op.sourceIndex])
    if (op.rotation) page.setRotation(degrees(op.rotation))
    out.addPage(page)
  }

  return out.save({ useObjectStreams: true })
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name)
    const image = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes)
    const page = out.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }

  return out.save({ useObjectStreams: true })
}

export async function pdfToImages(
  file: LoadedPdf,
  onProgress?: (pct: number) => void,
): Promise<{ name: string; blob: Blob }[]> {
  const pdf = await pdfjs.getDocument({ data: file.bytes.slice(0) }).promise
  const base = file.name.replace(/\.pdf$/i, '')
  const results: { name: string; blob: Blob }[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Encode failed'))),
        'image/png',
      )
    })
    results.push({ name: `${base}-page-${i}.png`, blob })
    onProgress?.(Math.round((i / pdf.numPages) * 100))
  }

  return results
}

export async function renderPageThumb(
  bytes: ArrayBuffer,
  pageIndex: number,
  maxWidth = 140,
): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise
  const page = await pdf.getPage(pageIndex + 1)
  const base = page.getViewport({ scale: 1 })
  const scale = maxWidth / base.width
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  return canvas.toDataURL('image/jpeg', 0.75)
}

export function downloadBytes(bytes: Uint8Array, name: string) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  saveAs(new Blob([copy], { type: 'application/pdf' }), name)
}

export async function downloadZip(
  files: { name: string; bytes?: Uint8Array; blob?: Blob }[],
  zipName: string,
) {
  const zip = new JSZip()
  for (const f of files) {
    if (f.bytes) {
      const copy = new Uint8Array(f.bytes.byteLength)
      copy.set(f.bytes)
      zip.file(f.name, copy)
    } else if (f.blob) {
      zip.file(f.name, f.blob)
    }
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, zipName)
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

/** Optional page-number stamp utility used by organize advanced actions */
export async function stampPageNumbers(file: LoadedPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const { width } = page.getSize()
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: width / 2 - 18,
      y: 18,
      size: 10,
      color: rgb(0.35, 0.4, 0.45),
    })
  })
  return doc.save({ useObjectStreams: true })
}
