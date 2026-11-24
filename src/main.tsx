import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/chakra-petch/latin-500.css'
import '@fontsource/chakra-petch/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/im-fell-english/latin-400.css'
import '@fontsource/im-fell-english/latin-400-italic.css'
import '@fontsource/im-fell-english-sc/latin-400.css'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-500.css'
import './styles/index.css'
import { configureAmplify } from './amplify'
import App from './App'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Missing root element')
}

const authConfigured = configureAmplify()

createRoot(root).render(
  <StrictMode>
    <App authConfigured={authConfigured} />
  </StrictMode>,
)
