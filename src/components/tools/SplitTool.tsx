import { useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar } from '../DropZone'
import { PdfFileList } from '../FileList'
import { downloadBytes, downloadZip, loadPdf, splitPdf, type SplitMode } from '../../lib/pdf'
import type { LoadedPdf } from '../../types'

export function SplitTool() {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [mode, setMode] = useState<SplitMode>('each')
  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(incoming: File[]) {
    setError(null)
    try {
      const pdf = await loadPdf(incoming[0])
      setFile(pdf)
      setStart(1)
      setEnd(pdf.pageCount)
    } catch {
      setError('Could not read that PDF.')
    }
  }

  async function run() {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const parts = await splitPdf(file, mode, start, end)
      if (parts.length === 1) {
        downloadBytes(parts[0].bytes, parts[0].name)
      } else {
        await downloadZip(parts, file.name.replace(/\.pdf$/i, '') + '-split.zip')
      }
    } catch {
      setError('Split failed. Check the page range and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-panel">
      {!file ? (
        <DropZone
          accept="application/pdf,.pdf"
          multiple={false}
          label="Drop a PDF to split"
          onFiles={addFiles}
        />
      ) : (
        <PdfFileList files={[file]} onRemove={() => setFile(null)} />
      )}

      {file && (
        <div className="option-grid">
          <label className={`option-chip ${mode === 'each' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="split-mode"
              checked={mode === 'each'}
              onChange={() => setMode('each')}
            />
            Every page as its own PDF
          </label>
          <label className={`option-chip ${mode === 'range' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="split-mode"
              checked={mode === 'range'}
              onChange={() => setMode('range')}
            />
            Extract a page range
          </label>
          {mode === 'range' && (
            <div className="range-row">
              <label>
                From
                <input
                  type="number"
                  min={1}
                  max={file.pageCount}
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                />
              </label>
              <label>
                To
                <input
                  type="number"
                  min={1}
                  max={file.pageCount}
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </div>
      )}

      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={!file} onClick={run}>
          Split & download
        </BusyButton>
      </ActionBar>
    </div>
  )
}
