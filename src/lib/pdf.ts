import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument } from 'pdf-lib'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export type PageSize = { width: number; height: number }

export type LoadedPdf = {
  name: string
  bytes: Uint8Array
  doc: pdfjs.PDFDocumentProxy
  sizes: PageSize[]
}

export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  // pdf.js transfere o buffer para o worker, então passamos uma cópia
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise
  const sizes: PageSize[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const v = page.getViewport({ scale: 1 })
    sizes.push({ width: v.width, height: v.height })
    page.cleanup()
  }
  return { name: file.name, bytes, doc, sizes }
}

export async function renderPage(
  doc: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number,
): Promise<void> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const dpr = window.devicePixelRatio || 1
  const viewport = page.getViewport({ scale: (targetWidth / base.width) * dpr })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const task = page.render({ canvas, viewport })
  try {
    await task.promise
  } finally {
    page.cleanup()
  }
}

export async function removePages(
  bytes: Uint8Array,
  removed: Set<number>,
): Promise<Uint8Array> {
  const out = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const indexes = [...removed].sort((a, b) => b - a)
  for (const i of indexes) out.removePage(i)
  return out.save()
}

type SaveWindow = Window & {
  showSaveFilePicker?: (opts: unknown) => Promise<{
    createWritable: () => Promise<{
      write: (d: BlobPart) => Promise<void>
      close: () => Promise<void>
    }>
  }>
}

// Retorna false se o usuário cancelou o diálogo.
export async function savePdf(
  data: Uint8Array,
  suggestedName: string,
): Promise<boolean> {
  const w = window as SaveWindow
  if (w.showSaveFilePicker) {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(data as BlobPart)
      await writable.close()
      return true
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false
      throw e
    }
  }
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName
  a.click()
  URL.revokeObjectURL(url)
  return true
}
