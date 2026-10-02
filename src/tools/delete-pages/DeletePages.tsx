import { useEffect, useMemo, useRef, useState } from 'react'
import { DropZone } from '../../components/DropZone'
import { PdfPage } from '../../components/PdfPage'
import { loadPdf, removePages, savePdf } from '../../lib/pdf'
import type { LoadedPdf } from '../../lib/pdf'

const THUMB_W = 130
const PAGE_W = 720

export function DeletePages() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null)
  const [removed, setRemoved] = useState<Set<number>>(new Set())
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const pageRefs = useRef<(HTMLElement | null)[]>([])
  const thumbRefs = useRef<(HTMLElement | null)[]>([])
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => () => { pdf?.doc.loadingTask.destroy() }, [pdf])

  const open = async (file: File) => {
    setBusy(true)
    setMessage('')
    try {
      const loaded = await loadPdf(file)
      setPdf(loaded)
      setRemoved(new Set())
      setCurrent(0)
    } catch {
      setMessage('Não foi possível abrir este PDF (corrompido ou protegido por senha).')
    } finally {
      setBusy(false)
    }
  }

  // Destaca a página que está no meio da área de leitura.
  useEffect(() => {
    const root = scrollRef.current
    if (!pdf || !root) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i))
        }
      },
      { root, rootMargin: '-40% 0px -55% 0px' },
    )
    pageRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [pdf])

  useEffect(() => {
    thumbRefs.current[current]?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const remaining = pdf ? pdf.doc.numPages - removed.size : 0
  const sortedRemoved = useMemo(() => [...removed].sort((a, b) => a - b), [removed])

  const toggle = (i: number) => {
    const isRemoved = removed.has(i)
    if (!isRemoved && !window.confirm(`Excluir a página ${i + 1}?`)) return
    setRemoved((prev) => {
      const next = new Set(prev)
      if (isRemoved) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const goTo = (i: number) =>
    pageRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const save = async () => {
    if (!pdf) return
    if (remaining === 0) return setMessage('Não é possível salvar um PDF sem páginas.')
    setBusy(true)
    setMessage('')
    try {
      const data = await removePages(pdf.bytes, removed)
      const name = pdf.name.replace(/\.pdf$/i, '') + '-editado.pdf'
      const ok = await savePdf(data, name)
      if (ok) setMessage('PDF salvo com sucesso.')
    } catch (e) {
      setMessage(`Erro ao salvar: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  if (!pdf) {
    return (
      <div className="center">
        <DropZone onFile={open} busy={busy} />
        {message && <p className="error">{message}</p>}
      </div>
    )
  }

  return (
    <div className="editor">
      <aside className="sidebar">
        {pdf.sizes.map((_, i) => (
          <button
            key={i}
            ref={(el) => { thumbRefs.current[i] = el }}
            className={`thumb${i === current ? ' active' : ''}${removed.has(i) ? ' removed' : ''}`}
            onClick={() => goTo(i)}
          >
            <PdfPage pdf={pdf} index={i} width={THUMB_W} rootMargin="300px" />
            <span>{i + 1}</span>
          </button>
        ))}
      </aside>

      <section className="viewer" ref={scrollRef}>
        {pdf.sizes.map((_, i) => (
          <div
            key={i}
            data-i={i}
            ref={(el) => { pageRefs.current[i] = el }}
            className={`page-card${removed.has(i) ? ' removed' : ''}`}
          >
            <div className="page-bar">
              <span>Página {i + 1} de {pdf.doc.numPages}</span>
              <button
                className={removed.has(i) ? 'btn' : 'btn danger'}
                title={removed.has(i) ? 'Restaurar página' : 'Excluir página'}
                onClick={() => toggle(i)}
              >
                {removed.has(i) ? '↩ Restaurar' : '🗑️'}
              </button>
            </div>
            <div className="page-wrap">
              <PdfPage pdf={pdf} index={i} width={PAGE_W} />
              {removed.has(i) && <div className="overlay">Será excluída</div>}
            </div>
          </div>
        ))}
      </section>

      <footer className="footer">
        <span className="muted">
          {pdf.name} — {remaining} de {pdf.doc.numPages} páginas
          {sortedRemoved.length > 0 && ` (excluídas: ${sortedRemoved.map((i) => i + 1).join(', ')})`}
        </span>
        {message && <span className="msg">{message}</span>}
        <span className="spacer" />
        <button className="btn" disabled={busy} onClick={() => setPdf(null)}>Trocar arquivo</button>
        <button className="btn primary" disabled={busy} onClick={save}>
          {busy ? 'Aguarde…' : 'Save and Done'}
        </button>
      </footer>
    </div>
  )
}
