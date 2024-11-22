import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // volvemos a la ruta relativa pero con extensión
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
