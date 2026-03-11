import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CatalogProvider } from './context/CatalogProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </AuthProvider>
  </StrictMode>,
)
