import { useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar, ProgressBar } from '../DropZone'
import { PdfFileList } from '../FileList'
import {
  compressPdf,
  downloadBytes,
  formatBytes,
  loadPdf,
  type CompressLevel,
} from '../../lib/pdf'
import type { LoadedPdf } from '../../types'

const LEVELS: { id: CompressLevel; label: string; note: string }[] = [
  { id: 'light', label: 'Light', note: 'Best quality' },
  { id: 'balanced', label: 'Balanced', note: 'Recommended' },
  { id: 'strong', label: 'Strong', note: 'Smallest size' },
]

export function CompressTool() {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [level, setLevel] = useState<CompressLevel>('balanced')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [resultSize, setResultSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(incoming: File[]) {
    setError(null)
    setResultSize(null)
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
    setResultSize(null)
    try {
      const bytes = await compressPdf(file, level, setProgress)
      setResultSize(bytes.byteLength)
      downloadBytes(bytes, file.name.replace(/\.pdf$/i, '') + '-compressed.pdf')
    } catch {
      setError('Compression failed. Try a different file or level.')
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
          label="Drop a PDF to compress"
          onFiles={addFiles}
        />
      ) : (
        <PdfFileList
          files={[file]}
          onRemove={() => {
            setFile(null)
            setResultSize(null)
          }}
        />
      )}

      {file && (
        <div className="option-grid level-grid">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`level-card ${level === l.id ? 'is-active' : ''}`}
              onClick={() => setLevel(l.id)}
            >
              <strong>{l.label}</strong>
              <span>{l.note}</span>
            </button>
          ))}
        </div>
      )}

      <ProgressBar value={progress} />
      {resultSize !== null && file && (
        <p className="result-note">
          {formatBytes(file.bytes.byteLength)} → {formatBytes(resultSize)} (
          {Math.max(0, Math.round((1 - resultSize / file.bytes.byteLength) * 100))}% smaller)
        </p>
      )}
      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={!file} onClick={run}>
          Compress & download
        </BusyButton>
      </ActionBar>
    </div>
  )
}
