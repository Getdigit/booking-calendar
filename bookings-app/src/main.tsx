import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bundled locally: code apps may block external font hosts via their content security policy.
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
