# PDF Toolbox

Aplicativo web que roda **100% local** para manipular arquivos PDF. Nada é enviado para servidores: todo o processamento acontece no seu navegador.

## Funcionalidades

### Excluir páginas
- Importe um PDF arrastando para a tela ou pelo diálogo de arquivos do sistema operacional.
- Menu lateral com miniaturas para navegar entre as páginas.
- Cada página tem um 🗑️ para excluí-la (com confirmação) e um botão **Restaurar** para desfazer, até o momento de salvar.
- **Save and Done** abre o diálogo "Salvar como" do sistema para você escolher onde salvar a nova versão.
- Suporta PDFs grandes (até ~1000 páginas): só as páginas visíveis são renderizadas.

> Limitações: PDFs protegidos por senha não são suportados. Não é possível salvar um PDF sem páginas.

## Pré-requisitos

| Item | Versão |
|------|--------|
| [Node.js](https://nodejs.org) | **20.19+** ou **22.12+** (recomendado: LTS atual) |
| npm | Já vem com o Node.js |
| Navegador | **Chrome, Edge ou Opera** (recomendado) |
| Git | Opcional |

> **Sobre o navegador:** a escolha do local de salvamento (diálogo "Salvar como") usa a File System Access API, disponível apenas em navegadores baseados em Chromium. No Firefox e Safari o app funciona, mas o arquivo é baixado direto para a pasta de Downloads.

Verifique suas versões:

```bash
node -v
npm -v
```

## Instalação do Node.js por sistema operacional

### Windows
1. Baixe o instalador LTS em https://nodejs.org e execute-o, ou use o winget (PowerShell):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
2. Feche e reabra o terminal e confirme com `node -v`.

### macOS
```bash
# Homebrew
brew install node
# ou com nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install --lts
```

### Linux
Use o nvm (funciona em qualquer distribuição e garante uma versão recente):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# reabra o terminal
nvm install --lts
```
Alternativamente, use o gerenciador de pacotes da distro, desde que a versão atenda ao requisito acima (ex.: NodeSource no Debian/Ubuntu, `dnf install nodejs` no Fedora recente).

## Como rodar

Os comandos são os mesmos em Windows (PowerShell/CMD), macOS e Linux.

```bash
# 1. entre na pasta do projeto
cd pdf-toolbox

# 2. instale as dependências (apenas na primeira vez)
npm install

# 3. inicie o servidor de desenvolvimento
npm run dev
```

Abra no navegador: **http://localhost:5173**

Para parar o servidor, pressione `Ctrl + C` no terminal.

### Usando outra porta
```bash
npm run dev -- --port 3000
```

### Versão de produção (opcional)
```bash
npm run build     # gera a pasta dist/
npm run preview   # serve a build em http://localhost:4173
```

## Como usar

1. Na tela inicial, arraste um PDF ou clique na área para escolher o arquivo.
2. Navegue pelas páginas usando as miniaturas à esquerda ou rolando a visualização.
3. Clique no 🗑️ da página que deseja remover e confirme. Use **Restaurar** se mudar de ideia.
4. Clique em **Save and Done** e escolha o local e o nome do novo arquivo (sugestão: `<nome>-editado.pdf`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verifica tipos e gera a build de produção |
| `npm run preview` | Serve a build de produção localmente |
| `npm run lint` | Roda o linter (oxlint) |

## Stack

- [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript
- [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`): renderização das páginas
- [pdf-lib](https://pdf-lib.js.org): remoção de páginas e geração do novo PDF

## Estrutura do projeto

```
src/
├── App.tsx                      # Layout e navegação entre ferramentas
├── components/
│   ├── DropZone.tsx             # Importação (drag & drop + diálogo)
│   └── PdfPage.tsx              # Página renderizada sob demanda (canvas)
├── lib/pdf.ts                   # Carregar, renderizar, remover páginas e salvar
└── tools/
    ├── registry.ts              # Lista de ferramentas disponíveis
    └── delete-pages/            # Ferramenta "Excluir páginas"
```

### Adicionando uma nova ferramenta
1. Crie uma pasta em `src/tools/<nome-da-ferramenta>/` com o componente React.
2. Registre-a em `src/tools/registry.ts`. Ela aparecerá automaticamente na barra superior.

## Solução de problemas

| Problema | Solução |
|----------|---------|
| `npm: command not found` / `node: command not found` | Instale o Node.js e reabra o terminal. |
| Erro de versão do Node ao instalar/rodar | Atualize para Node 20.19+ ou 22.12+. |
| `Port 5173 is already in use` | Use outra porta: `npm run dev -- --port 3000`. |
| "Não foi possível abrir este PDF" | O arquivo está corrompido ou protegido por senha. |
| Não aparece o diálogo "Salvar como" | Use Chrome/Edge; em outros navegadores o arquivo é baixado direto. |
| Erros estranhos após atualizar dependências | Apague `node_modules` e rode `npm install` novamente. |

## Privacidade

Os arquivos nunca saem do seu computador. O app não tem backend, login nem telemetria.
