import { useCallback, useRef, useState, type ReactNode } from 'react'

interface DropZoneProps {
  accept: string
  multiple?: boolean
  label: string
  hint?: string
  onFiles: (files: File[]) => void
  compact?: boolean
}

export function DropZone({
  accept,
  multiple = true,
  label,
  hint = 'Processed locally in your browser',
  onFiles,
  compact = false,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const take = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      onFiles(Array.from(list))
    },
    [onFiles],
  )

  return (
    <div
      className={`dropzone ${over ? 'is-over' : ''} ${compact ? 'is-compact' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        take(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
      <span className="dropzone-mark" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="dropzone-label">{label}</p>
      <p className="dropzone-hint">{hint}</p>
    </div>
  )
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="action-bar">{children}</div>
}

export function BusyButton({
  busy,
  disabled,
  onClick,
  children,
}: {
  busy?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={disabled || busy}
      onClick={onClick}
    >
      {busy ? 'Working…' : children}
    </button>
  )
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return <p className="error-note">{message}</p>
}

export function ProgressBar({ value }: { value: number | null }) {
  if (value === null) return null
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
      <span className="progress-label">{value}%</span>
    </div>
  )
}
