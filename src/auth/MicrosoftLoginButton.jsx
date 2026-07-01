import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

export const MicrosoftLoginButton = ({ onError }) => {
  const { instance, inProgress } = useMsal();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (inProgress !== "none" || loading) return;
    setLoading(true);
    if (onError) onError('');

    try {
      // Clear any stuck MSAL interaction states from previous failed logins
      const storageKeys = [...Object.keys(sessionStorage), ...Object.keys(localStorage)];
      storageKeys.forEach(key => {
        if (key.startsWith('msal.')) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      });

      // Save portal context to determine where we started from
      const portalType = window.location.pathname.includes('/admin') ? 'admin' : 'employee';
      localStorage.setItem('sso_portal_type', portalType);

      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.error("Microsoft login error:", err);
      setLoading(false);
      if (onError) onError(err.message || 'Microsoft login failed. Please try again.');
    }
  };

  const isInteracting = inProgress !== "none" || loading;

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isInteracting}
      className="auth-sso-btn"
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        color: '#334155',
        fontSize: '14.5px',
        fontWeight: '700',
        cursor: isInteracting ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
        transition: 'all 0.2s',
        marginBottom: '24px',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
      {isInteracting ? "Connecting to Microsoft..." : "Continue with Microsoft"}
    </button>
  );
};

export default MicrosoftLoginButton;
