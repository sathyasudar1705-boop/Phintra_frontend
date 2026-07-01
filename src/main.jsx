import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './services/msal'

// Check if we are inside a Microsoft MSAL popup
const isMsalPopup = window.opener && window.opener !== window && (
  window.location.hash.includes("code=") || 
  window.location.hash.includes("id_token=") || 
  window.location.hash.includes("access_token=") || 
  window.location.search.includes("code=") || 
  window.location.search.includes("state=")
);

msalInstance.initialize().then(() => {
  // Handle redirect/popup responses and await the promise BEFORE rendering
  msalInstance.handleRedirectPromise().then((response) => {
    if (response && response.account) {
      msalInstance.setActiveAccount(response.account);
    }

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          {isMsalPopup ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#F8FAFC' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#0F172A', marginBottom: '8px' }}>Signing you in...</h2>
                <p style={{ color: '#64748B', margin: 0 }}>Please wait while we complete the connection.</p>
              </div>
            </div>
          ) : (
            <App />
          )}
        </MsalProvider>
      </StrictMode>,
    );
  }).catch((err) => {
    console.error("MSAL redirect promise handling failed:", err);
    // Render app anyway so user can try again or see standard screens
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </StrictMode>
    );
  });
});
