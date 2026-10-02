import { useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar } from '../DropZone'
import { PdfFileList } from '../FileList'
import { downloadBytes, loadPdf, mergePdfs } from '../../lib/pdf'
import type { LoadedPdf } from '../../types'

export function MergeTool() {
  const [files, setFiles] = useState<LoadedPdf[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(incoming: File[]) {
    setError(null)
    try {
      const pdfs = await Promise.all(
        incoming.filter((f) => /\.pdf$/i.test(f.name)).map(loadPdf),
      )
      if (!pdfs.length) {
        setError('Please drop PDF files.')
        return
      }
      setFiles((prev) => [...prev, ...pdfs])
    } catch {
      setError('Could not read one of the PDFs. Try another file.')
    }
  }

  function move(id: string, dir: -1 | 1) {
    setFiles((prev) => {
      const i = prev.findIndex((f) => f.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function run() {
    if (files.length < 2) {
      setError('Add at least two PDFs to merge.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const bytes = await mergePdfs(files)
      downloadBytes(bytes, 'offgrid-merged.pdf')
    } catch {
      setError('Merge failed. One file may be corrupted or password-protected.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-panel">
      <DropZone
        accept="application/pdf,.pdf"
        label="Drop PDFs to merge"
        onFiles={addFiles}
      />
      <PdfFileList
        files={files}
        onRemove={(id) => setFiles((p) => p.filter((f) => f.id !== id))}
        onMove={move}
        reorderable
      />
      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={files.length < 2} onClick={run}>
          Merge & download
        </BusyButton>
        {files.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setFiles([])}>
            Clear
          </button>
        )}
      </ActionBar>
    </div>
  )
}
