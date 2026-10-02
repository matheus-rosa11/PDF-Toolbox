import { useState } from 'react'
import { tools } from './tools/registry'

export default function App() {
  const [active, setActive] = useState(tools[0].id)
  const Active = tools.find((t) => t.id === active)!.component

  return (
    <div className="app">
      <header className="topbar">
        <strong>PDF Toolbox</strong>
        <nav>
          {tools.map((t) => (
            <button
              key={t.id}
              className={`tab${t.id === active ? ' active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.name}
            </button>
          ))}
        </nav>
      </header>
      <main className="main">
        <Active key={active} />
      </main>
    </div>
  )
}
