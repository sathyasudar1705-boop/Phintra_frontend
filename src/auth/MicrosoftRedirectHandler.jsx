import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginWithMicrosoft } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { loginRequest } from './msalConfig';

export const MicrosoftRedirectHandler = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const { adminAuth, employeeAuth, microsoftLogin } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Completing Microsoft Sign-in...');

  // Detect if the URL indicates we are in the middle of a Microsoft authentication callback
  const hasMsalParams = 
    window.location.hash.includes("code=") || 
    window.location.hash.includes("id_token=") || 
    window.location.hash.includes("access_token=") || 
    window.location.search.includes("code=") || 
    window.location.search.includes("state=") ||
    window.location.search.includes("error=");

  useEffect(() => {
    const processRedirect = async () => {
      try {
        setIsProcessing(true);
        const redirectResult = await instance.handleRedirectPromise();
        
        let account = redirectResult?.account;
        if (!account && accounts.length > 0) {
          account = accounts[0];
        }

        if (account) {
          instance.setActiveAccount(account);
          
          const email = account.username || account.idTokenClaims?.email || account.idTokenClaims?.preferred_username;
          if (!email) {
            throw new Error("Could not extract email address from Microsoft account claims.");
          }

          setStatusMessage('Verifying account with Phintra...');

          // Acquire access token silently
          const tokenResult = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
          });
          
          const msalToken = tokenResult.accessToken;
          const portalType = localStorage.getItem('sso_portal_type') || (window.location.pathname.includes('/admin') ? 'admin' : 'employee');
          localStorage.removeItem('sso_portal_type');

          // Call backend verification
          const backendResponse = await loginWithMicrosoft(email, msalToken);
          
          // Complete login state update in context
          const res = await microsoftLogin(msalToken, portalType);
          
          if (res.success && backendResponse.redirect_path) {
            window.location.href = backendResponse.redirect_path;
          } else {
            throw new Error(res.message || 'Verification failed');
          }
        } else {
          // No account found and no redirect result, but we have MSAL params (could be an authentication error from MS)
          const params = new URLSearchParams(window.location.search);
          const errorMsg = params.get('error_description') || params.get('error') || 'Microsoft login was cancelled or failed.';
          if (hasMsalParams) {
            throw new Error(errorMsg);
          }
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("MSAL redirect processing failed:", err);
        instance.setActiveAccount(null);
        
        // Clear all session storage MSAL cache keys to resolve any stuck interaction states
        const storageKeys = [...Object.keys(sessionStorage), ...Object.keys(localStorage)];
        storageKeys.forEach(key => {
          if (key.startsWith('msal.')) {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
          }
        });

        const portalType = localStorage.getItem('sso_portal_type') || 'employee';
        localStorage.removeItem('sso_portal_type');

        const errorMsg = err.response?.data?.detail || err.message || 'Microsoft login failed.';
        const redirectUrl = portalType === 'admin' ? '/admin/login' : '/user/login';
        
        window.location.href = `${redirectUrl}?error=${encodeURIComponent(errorMsg)}`;
      }
    };

    // Trigger callback processing if MSAL params are present in URL OR if MSAL is actively processing a redirect
    if ((hasMsalParams || inProgress === 'handleRedirect') && !adminAuth && !employeeAuth) {
      if (inProgress === 'none') {
        processRedirect();
      }
    } else {
      setIsProcessing(false);
    }
  }, [inProgress, accounts, instance, adminAuth, employeeAuth]);

  const showLoading = isProcessing || inProgress === 'handleRedirect' || (hasMsalParams && !adminAuth && !employeeAuth);

  if (showLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0F172A', marginBottom: '8px' }}>{statusMessage}</h2>
          <p style={{ color: '#64748B', margin: 0 }}>Please wait while we establish your secure session.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default MicrosoftRedirectHandler;
