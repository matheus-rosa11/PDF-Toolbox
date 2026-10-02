import { useRef, useState } from 'react'

type Props = { onFile: (file: File) => void; busy?: boolean }

const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)

export function DropZone({ onFile, busy }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')

  const handle = (f?: File) => {
    if (!f) return
    if (!isPdf(f)) return setError('Selecione um arquivo PDF.')
    setError('')
    onFile(f)
  }

  return (
    <div
      className={`dropzone${over ? ' over' : ''}`}
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]) }}
    >
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => { handle(e.target.files?.[0]); e.target.value = '' }}
      />
      <p className="drop-title">{busy ? 'Carregando PDF…' : 'Arraste um PDF aqui'}</p>
      <p className="muted">ou clique para escolher um arquivo</p>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
