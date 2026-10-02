import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import type { ToolId, ToolMeta } from '../types'
import { TOOLS } from '../types'
import { MergeTool } from './tools/MergeTool'
import { SplitTool } from './tools/SplitTool'
import { CompressTool } from './tools/CompressTool'
import { OrganizeTool } from './tools/OrganizeTool'
import { ImagesToPdfTool } from './tools/ImagesToPdfTool'
import { PdfToImagesTool } from './tools/PdfToImagesTool'

const TOOL_MAP: Record<ToolId, ComponentType> = {
  merge: MergeTool,
  split: SplitTool,
  compress: CompressTool,
  organize: OrganizeTool,
  'images-to-pdf': ImagesToPdfTool,
  'pdf-to-images': PdfToImagesTool,
}

interface WorkspaceProps {
  toolId: ToolId
  onSelect: (id: ToolId) => void
  onBack: () => void
}

export function Workspace({ toolId, onSelect, onBack }: WorkspaceProps) {
  const meta = TOOLS.find((t) => t.id === toolId) as ToolMeta
  const Active = TOOL_MAP[toolId]

  return (
    <section className="workspace" id="tools">
      <div className="workspace-shell">
        <aside className="tool-nav">
          <button type="button" className="back-link" onClick={onBack}>
            ← Offgrid
          </button>
          <p className="tool-nav-label">Tools</p>
          <ul>
            {TOOLS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`tool-nav-item ${t.id === toolId ? 'is-active' : ''}`}
                  style={{ ['--tool-accent' as string]: t.accent }}
                  onClick={() => onSelect(t.id)}
                >
                  <span className="tool-dot" />
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <motion.div
          key={toolId}
          className="workspace-main"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="workspace-header">
            <p className="eyebrow" style={{ color: meta.accent }}>
              Runs on your device
            </p>
            <h2>{meta.name}</h2>
            <p className="lede">{meta.blurb}</p>
          </header>
          <Active />
        </motion.div>
      </div>
    </section>
  )
}
