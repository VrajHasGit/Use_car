import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Boot: apply saved theme + font before first render (no FOUC) ──
const savedTheme = localStorage.getItem('cc_theme') || 'obsidian';
const savedFont  = localStorage.getItem('cc_font')  || 'inter';
document.body.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-font', savedFont);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

