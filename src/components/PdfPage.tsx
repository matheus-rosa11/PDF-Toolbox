import { useEffect, useRef, useState } from 'react'
import type { LoadedPdf } from '../lib/pdf'
import { renderPage } from '../lib/pdf'

type Props = {
  pdf: LoadedPdf
  index: number
  width: number
  rootMargin?: string
}

// Renderiza só quando está perto da área visível e libera o canvas ao sair.
export function PdfPage({ pdf, index, width, rootMargin = '600px' }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)
  const size = pdf.sizes[index]
  const height = (size.height / size.width) * width

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!visible || !canvas) return
    renderPage(pdf.doc, index + 1, canvas, width).catch(() => {
      /* render falhou: mantém placeholder */
    })
    return () => {
      canvas.width = canvas.height = 0
    }
  }, [visible, pdf, index, width])

  return (
    <div ref={boxRef} className="pdf-page" style={{ width, height }}>
      <canvas ref={canvasRef} style={{ width, height }} />
    </div>
  )
}
