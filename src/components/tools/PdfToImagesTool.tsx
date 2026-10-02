import { useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar, ProgressBar } from '../DropZone'
import { PdfFileList } from '../FileList'
import { downloadZip, loadPdf, pdfToImages } from '../../lib/pdf'
import type { LoadedPdf } from '../../types'

export function PdfToImagesTool() {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(incoming: File[]) {
    setError(null)
    try {
      setFile(await loadPdf(incoming[0]))
    } catch {
      setError('Could not read that PDF.')
    }
  }

  async function run() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      const images = await pdfToImages(file, setProgress)
      await downloadZip(images, file.name.replace(/\.pdf$/i, '') + '-pages.zip')
    } catch {
      setError('Could not export pages. Try another PDF.')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="tool-panel">
      {!file ? (
        <DropZone
          accept="application/pdf,.pdf"
          multiple={false}
          label="Drop a PDF to export as images"
          onFiles={addFiles}
        />
      ) : (
        <PdfFileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <ProgressBar value={progress} />
      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={!file} onClick={run}>
          Export PNGs (ZIP)
        </BusyButton>
      </ActionBar>
    </div>
  )
}
