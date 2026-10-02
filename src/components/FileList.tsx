import { formatBytes } from '../lib/pdf'
import type { LoadedPdf } from '../types'

interface FileListProps {
  files: LoadedPdf[]
  onRemove: (id: string) => void
  onMove?: (id: string, dir: -1 | 1) => void
  reorderable?: boolean
}

export function PdfFileList({ files, onRemove, onMove, reorderable }: FileListProps) {
  if (!files.length) return null

  return (
    <ul className="file-list">
      {files.map((f, i) => (
        <li key={f.id} className="file-row">
          <div className="file-meta">
            <span className="file-name">{f.name}</span>
            <span className="file-sub">
              {f.pageCount} page{f.pageCount === 1 ? '' : 's'} · {formatBytes(f.bytes.byteLength)}
            </span>
          </div>
          <div className="file-actions">
            {reorderable && onMove && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => onMove(f.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Move down"
                  disabled={i === files.length - 1}
                  onClick={() => onMove(f.id, 1)}
                >
                  ↓
                </button>
              </>
            )}
            <button
              type="button"
              className="icon-btn danger"
              aria-label={`Remove ${f.name}`}
              onClick={() => onRemove(f.id)}
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

interface ImageListProps {
  files: File[]
  onRemove: (index: number) => void
  onMove: (index: number, dir: -1 | 1) => void
}

export function ImageFileList({ files, onRemove, onMove }: ImageListProps) {
  if (!files.length) return null

  return (
    <ul className="file-list">
      {files.map((f, i) => (
        <li key={`${f.name}-${i}`} className="file-row">
          <div className="file-meta">
            <span className="file-name">{f.name}</span>
            <span className="file-sub">{formatBytes(f.size)}</span>
          </div>
          <div className="file-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => onMove(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Move down"
              disabled={i === files.length - 1}
              onClick={() => onMove(i, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className="icon-btn danger"
              aria-label={`Remove ${f.name}`}
              onClick={() => onRemove(i)}
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
