import { useState } from 'react'
import { DropZone, BusyButton, ErrorNote, ActionBar } from '../DropZone'
import { ImageFileList } from '../FileList'
import { downloadBytes, imagesToPdf } from '../../lib/pdf'

const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png'

export function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addFiles(incoming: File[]) {
    setError(null)
    const ok = incoming.filter((f) => /image\/(jpeg|jpg|png)/i.test(f.type) || /\.(jpe?g|png)$/i.test(f.name))
    if (!ok.length) {
      setError('Use JPG or PNG images.')
      return
    }
    setFiles((prev) => [...prev, ...ok])
  }

  function move(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  async function run() {
    if (!files.length) return
    setBusy(true)
    setError(null)
    try {
      const bytes = await imagesToPdf(files)
      downloadBytes(bytes, 'offgrid-images.pdf')
    } catch {
      setError('Could not build the PDF. Use standard JPG/PNG files.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-panel">
      <DropZone
        accept={IMAGE_ACCEPT}
        label="Drop JPG or PNG images"
        onFiles={addFiles}
      />
      <ImageFileList
        files={files}
        onRemove={(i) => setFiles((p) => p.filter((_, idx) => idx !== i))}
        onMove={move}
      />
      <ErrorNote message={error} />
      <ActionBar>
        <BusyButton busy={busy} disabled={!files.length} onClick={run}>
          Build PDF & download
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
