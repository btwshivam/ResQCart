import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import CSS as a side effect
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
