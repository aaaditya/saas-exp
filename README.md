# Offgrid

**Privacy-first PDF toolkit** — merge, split, compress, organize, and convert PDFs entirely in the browser. Files never leave the user's device.

## Why this product

Sites like ILovePDF and SmallPDF gate common PDF tasks behind uploads, wait timers, accounts, and watermarks. Offgrid does the same jobs client-side with no signup and no cloud processing — a high-demand utility people can use freely on your site.

## Tools

- **Merge** — combine multiple PDFs
- **Split** — every page or a page range
- **Compress** — shrink for email / uploads
- **Organize** — reorder, rotate, delete, page numbers
- **Images → PDF** — JPG/PNG to PDF
- **PDF → Images** — export pages as PNG (ZIP)

## Run locally

```bash
npm install
npm run dev
```

## Build & host

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, or your own server). No backend or API keys required.

### Vercel

```bash
npx vercel
```

## Stack

- React + TypeScript + Vite
- `pdf-lib` for PDF creation / editing
- `pdfjs-dist` for rendering & compression
- Framer Motion for UI motion

## Privacy model

All processing happens in the visitor's browser tab via WebAssembly / canvas. Closing the tab clears in-memory file data. Nothing is uploaded to a server by this app.
