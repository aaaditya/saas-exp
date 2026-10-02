import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TOOLS, type ToolId } from './types'
import { Workspace } from './components/Workspace'

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="10" fill="currentColor" className="logo-bg" />
      <path
        d="M10 28V12h5.4c3.6 0 5.8 1.8 5.8 4.8 0 3.1-2.3 5-5.9 5H14.4V28H10zm4.4-6.2h.9c1.5 0 2.4-.7 2.4-2s-.9-1.9-2.4-1.9h-.9v3.9z"
        fill="#3ECF8E"
      />
      <path
        d="M23.2 28l5.6-13h4.1L38.6 28h-4.4l-.9-2.3h-5l-.9 2.3h-4.2zm6.1-5.4h3.2l-1.6-4.2-1.6 4.2z"
        fill="#E6F0F4"
      />
    </svg>
  )
}

function ProductStage() {
  return (
    <div className="product-stage" aria-hidden>
      <div className="stage-glow" />
      <div className="stage-window">
        <div className="stage-chrome">
          <span />
          <span />
          <span />
          <em>offgrid.app — private session</em>
        </div>
        <div className="stage-body">
          <div className="stage-sidebar">
            {TOOLS.map((t, i) => (
              <div key={t.id} className={`stage-tool ${i === 0 ? 'is-on' : ''}`}>
                <i style={{ background: t.accent }} />
                {t.name}
              </div>
            ))}
          </div>
          <div className="stage-canvas">
            <div className="stage-drop">
              <div className="stage-upload-icon" />
              <strong>Drop PDFs here</strong>
              <span>Never uploaded · Never stored</span>
            </div>
            <div className="stage-files">
              <div className="stage-file">
                <b>contract-final.pdf</b>
                <span>12 pages</span>
              </div>
              <div className="stage-file">
                <b>appendix-b.pdf</b>
                <span>4 pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<'home' | 'tools'>('home')
  const [tool, setTool] = useState<ToolId>('merge')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ToolId | 'tools' | ''
    if (TOOLS.some((t) => t.id === hash)) {
      setTool(hash as ToolId)
      setView('tools')
    } else if (hash === 'tools') {
      setView('tools')
    }
  }, [])

  function openTool(id: ToolId) {
    setTool(id)
    setView('tools')
    window.history.replaceState(null, '', `#${id}`)
    requestAnimationFrame(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function goHome() {
    setView('home')
    window.history.replaceState(null, '', ' ')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (view === 'tools') {
    return (
      <div className="app">
        <Workspace toolId={tool} onSelect={openTool} onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="grid-fade" />
      </div>

      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); goHome() }}>
          <LogoMark />
          <span>Offgrid</span>
        </a>
        <nav>
          <a href="#why">Why Offgrid</a>
          <button type="button" className="btn btn-small" onClick={() => openTool('merge')}>
            Open tools
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="brand-lockup">Offgrid</p>
            <h1>PDF tools that never leave your device.</h1>
            <p className="hero-support">
              Merge, split, compress, and convert documents in the browser — no
              uploads, no accounts, no watermarks.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-primary" onClick={() => openTool('merge')}>
                Start free — merge PDFs
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => openTool('compress')}>
                Compress a file
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductStage />
          </motion.div>
        </section>

        <section className="tools-teaser" id="why">
          <motion.div
            className="section-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <h2>Six tools. Zero cloud.</h2>
            <p>Everything competitors charge for — without sending your files anywhere.</p>
          </motion.div>

          <div className="tool-mosaic">
            {TOOLS.map((t, i) => (
              <motion.button
                key={t.id}
                type="button"
                className="tool-tile"
                style={{ ['--tool-accent' as string]: t.accent }}
                onClick={() => openTool(t.id)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <span className="tool-tile-accent" />
                <strong>{t.name}</strong>
                <span>{t.blurb}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="privacy">
          <div className="privacy-inner">
            <h2>Your docs stay on your machine.</h2>
            <p>
              Popular PDF sites upload every file to their servers, hit you with
              wait timers, then upsell. Offgrid processes pages with WebAssembly
              inside your browser tab. Close the tab — the files are gone.
            </p>
            <ul className="privacy-points">
              <li>
                <strong>No upload</strong>
                <span>Bytes never leave the device</span>
              </li>
              <li>
                <strong>No signup</strong>
                <span>Open it and work</span>
              </li>
              <li>
                <strong>No watermark</strong>
                <span>Download the real file</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="final-cta">
          <h2>Host it on your site. Give people a tool they actually need.</h2>
          <p>Static deploy — Vercel, Netlify, Cloudflare Pages, or any CDN.</p>
          <button type="button" className="btn btn-primary" onClick={() => openTool('merge')}>
            Launch Offgrid
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand">
          <LogoMark />
          <span>Offgrid</span>
        </div>
        <p>Privacy-first PDF toolkit · Processing happens locally in your browser.</p>
      </footer>
    </div>
  )
}
