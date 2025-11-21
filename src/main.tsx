import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './custom.scss';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Para os ícones

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)