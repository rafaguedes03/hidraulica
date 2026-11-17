import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Register PWA Service Worker for offline support and installation prompt
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do HidroCalc disponível.');
  },
  onOfflineReady() {
    console.log('HidroCalc pronto para uso 100% offline.');
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
