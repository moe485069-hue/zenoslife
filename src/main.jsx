import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './i18n/index.js';

// Auto-recover from Vite chunk preload errors when deploying new updates
window.addEventListener('vite:preloadError', (event) => {
  console.warn('New app version detected or preload error, refreshing...', event);
  window.location.reload();
});

// If running on localhost in dev, ensure stale service worker caches don't intercept dev server
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (let reg of regs) {
        reg.unregister();
      }
    }).catch(() => {});
  }
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
    const msg = error?.message || error?.toString() || '';
    if (msg.includes('dynamically imported module') || msg.includes('module script failed')) {
      const lastReload = sessionStorage.getItem('lifeos_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('lifeos_chunk_reload', now.toString());
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            for (let reg of regs) reg.update();
          });
        }
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #030014 60%, #000000 100%)',
          color: '#ffffff',
          fontFamily: 'Vazirmatn, system-ui, sans-serif',
          textAlign: 'center',
          direction: 'rtl'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '32px',
            padding: '32px 24px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(168, 85, 247, 0.15)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 0 12px rgba(234, 179, 8, 0.4))' }}>🪐</div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              خطا در بارگذاری مؤلفه
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px', lineHeight: '1.7' }}>
              مشکلی موقت در اجرای این بخش رخ داد. با دکمه‌های زیر می‌توانید صفحه را بازیابی کنید یا به صفحه اصلی بازگردید.
            </p>
            
            <pre style={{
              fontSize: '11px',
              color: '#fca5a5',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '12px 14px',
              borderRadius: '16px',
              maxWidth: '100%',
              overflowX: 'auto',
              marginBottom: '24px',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              {this.state.error?.toString()}
            </pre>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={async () => {
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (let r of regs) await r.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      for (let k of keys) await caches.delete(k);
                    }
                  } catch (_) {}
                  sessionStorage.clear();
                  window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now() + window.location.hash;
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 پاکسازی کش و بارگذاری نسخه جدید
              </button>

              <button
                onClick={async () => {
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (let r of regs) await r.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      for (let k of keys) await caches.delete(k);
                    }
                  } catch (_) {}
                  sessionStorage.clear();
                  window.location.href = window.location.origin + window.location.pathname + '?home=' + Date.now() + '#/';
                }}
                style={{
                  padding: '11px 20px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🏠 بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);
