import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Service worker: guarda o app no aparelho para abrir sem internet e atualiza sozinho.
registerSW({
  immediate: true,
  onOfflineReady() {
    window.dispatchEvent(new Event('hidrocalc:offline-ready'))
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
