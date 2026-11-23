import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/instrument-serif/latin-400.css'
import App from './App'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Missing root element')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
