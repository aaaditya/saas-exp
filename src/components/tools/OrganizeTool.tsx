import { useEffect, useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar } from '../DropZone'
import {
  downloadBytes,
  loadPdf,
  organizePdf,
  renderPageThumb,
  stampPageNumbers,
  type OrganizeOp,
} from '../../lib/pdf'
import type { LoadedPdf } from '../../types'

interface PageItem extends OrganizeOp {
  thumb?: string
}

export function OrganizeTool() {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingThumbs, setLoadingThumbs] = useState(false)

  async function addFiles(incoming: File[]) {
    setError(null)
    try {
      const pdf = await loadPdf(incoming[0])
      setFile(pdf)
      const ops: PageItem[] = Array.from({ length: pdf.pageCount }, (_, i) => ({
        sourceIndex: i,
        rotation: 0,
      }))
      setPages(ops)
      setLoadingThumbs(true)
      const thumbs = await Promise.all(
        ops.map((_, i) => renderPageThumb(pdf.bytes, i).catch(() => '')),
      )
      setPages((prev) => prev.map((p, i) => ({ ...p, thumb: thumbs[i] })))
      setLoadingThumbs(false)
    } catch {
      setError('Could not read that PDF.')
      setLoadingThumbs(false)
    }
  }

  useEffect(() => {
    return () => {
      setPages([])
    }
  }, [])

  function move(index: number, dir: -1 | 1) {
    setPages((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  function rotate(index: number) {
    setPages((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : p,
      ),
    )
  }

  function toggleDelete(index: number) {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, deleted: !p.deleted } : p)),
    )
  }

  async function run() {
    if (!file) return
    const kept = pages.filter((p) => !p.deleted)
    if (!kept.length) {
      setError('Keep at least one page.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const bytes = await organizePdf(file, pages)
      downloadBytes(bytes, file.name.replace(/\.pdf$/i, '') + '-organized.pdf')
    } catch {
      setError('Could not rebuild the PDF.')
    } finally {
      setBusy(false)
    }
  }

  async function addNumbers() {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const organized = await organizePdf(file, pages)
      const copy = new Uint8Array(organized.byteLength)
      copy.set(organized)
      const stamped = await stampPageNumbers({
        ...file,
        bytes: copy.buffer,
        pageCount: pages.filter((p) => !p.deleted).length,
      })
      downloadBytes(stamped, file.name.replace(/\.pdf$/i, '') + '-numbered.pdf')
    } catch {
      setError('Could not stamp page numbers.')
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
          label="Drop a PDF to organize"
          onFiles={addFiles}
        />
      ) : (
        <>
          <div className="org-header">
            <div>
              <strong>{file.name}</strong>
              <p className="muted">
                {loadingThumbs ? 'Rendering previews…' : 'Drag order with arrows · rotate · remove'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFile(null)
                setPages([])
              }}
            >
              Change file
            </button>
          </div>
          <div className="page-grid">
            {pages.map((p, i) => (
              <div
                key={`${p.sourceIndex}-${i}`}
                className={`page-card ${p.deleted ? 'is-deleted' : ''}`}
              >
                <div className="page-thumb-wrap">
                  {p.thumb ? (
                    <img
                      src={p.thumb}
                      alt={`Page ${p.sourceIndex + 1}`}
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    />
                  ) : (
                    <div className="page-thumb-skel" />
                  )}
                </div>
                <span className="page-num">p.{p.sourceIndex + 1}</span>
                <div className="page-controls">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0}>
                    ←
                  </button>
                  <button type="button" className="icon-btn" onClick={() => rotate(i)} title="Rotate">
                    ↻
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => toggleDelete(i)}
                    title={p.deleted ? 'Restore' : 'Remove'}
                  >
                    {p.deleted ? '↩' : '×'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => move(i, 1)}
                    disabled={i === pages.length - 1}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={!file} onClick={run}>
          Save organized PDF
        </BusyButton>
        {file && (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={addNumbers}>
            Save with page numbers
          </button>
        )}
      </ActionBar>
    </div>
  )
}
