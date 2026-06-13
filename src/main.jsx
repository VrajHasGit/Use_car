import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Boot: apply saved theme + font before first render (no FOUC) ──
let savedTheme = localStorage.getItem('cc_theme') || 'black-darkblue';
const validThemes = ['black-darkblue', 'navy-white', 'black-gold', 'darkblue-orange', 'white-green', 'grey-blue', 'maroon-cream'];
if (!validThemes.includes(savedTheme)) savedTheme = 'black-darkblue';

const savedFont  = localStorage.getItem('cc_font')  || 'inter';
document.body.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-font', savedFont);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

