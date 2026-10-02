export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'organize'
  | 'images-to-pdf'
  | 'pdf-to-images'

export interface ToolMeta {
  id: ToolId
  name: string
  blurb: string
  accent: string
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'merge',
    name: 'Merge',
    blurb: 'Combine multiple PDFs into one clean file.',
    accent: '#3ECF8E',
  },
  {
    id: 'split',
    name: 'Split',
    blurb: 'Extract page ranges into separate PDFs.',
    accent: '#5BB8FF',
  },
  {
    id: 'compress',
    name: 'Compress',
    blurb: 'Shrink file size for email and uploads.',
    accent: '#FF5C3A',
  },
  {
    id: 'organize',
    name: 'Organize',
    blurb: 'Reorder, rotate, or delete pages.',
    accent: '#F0C24B',
  },
  {
    id: 'images-to-pdf',
    name: 'Images → PDF',
    blurb: 'Turn photos and scans into a PDF.',
    accent: '#C084FC',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF → Images',
    blurb: 'Export every page as a PNG.',
    accent: '#2DD4BF',
  },
]

export interface LoadedPdf {
  id: string
  file: File
  name: string
  bytes: ArrayBuffer
  pageCount: number
}
