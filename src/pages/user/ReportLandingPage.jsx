import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const ReportLandingPage = () => {
  const { track_id } = useParams();

  // Component States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch campaign details on mount
  useEffect(() => {
    const fetchTrackInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/campaigns/track/${track_id}`);
        setRecipientInfo(response.data);
      } catch (err) {
        console.error("Failed to load tracking info:", err);
        setError(err.response?.data?.detail || "This phishing simulation tracking code is invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    if (track_id) {
      fetchTrackInfo();
    } else {
      setError("No tracking code provided.");
      setLoading(false);
    }
  }, [track_id]);

  const handleAction = async (actionType) => {
    if (!recipientInfo) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await api.post('/report', {
        employee_id: recipientInfo.employee_id,
        campaign_id: recipientInfo.campaign_id,
        action: actionType
      });

      if (actionType === 'report') {
        setSuccessMessage('Thank you! This email has been flagged as suspicious. The IT security team has been notified and this simulation has been recorded.');
      } else {
        setSuccessMessage('Thank you for your response! This email has been marked as safe in our logs.');
      }
    } catch (err) {
      console.error(`Failed to submit action ${actionType}:`, err);
      setError(err.response?.data?.detail || `Failed to record action. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-subtle)', fontSize: '16px' }}>
          Loading security session analysis...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 16px' }}>
      
      {/* Awareness Warning Header */}
      <div className="saas-card" style={{ padding: '32px', textAlign: 'center', borderTop: '4px solid var(--color-danger)' }}>
        <div style={{
          backgroundColor: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <AlertTriangle size={30} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Suspicious Email Detected
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '540px', margin: '0 auto 16px auto' }}>
          This was a safe, educational security simulation conducted by Phintra. Don't worry—your credentials were not stolen and your device is completely secure. In a real scenario, clicking unexpected links could compromise the network.
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger-light)',
            color: 'var(--color-danger)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            margin: '16px 0',
            textAlign: 'left'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--color-success-light)',
            border: '1px solid var(--color-success-light)',
            color: 'var(--color-success-hover)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            margin: '20px 0',
            textAlign: 'left',
            lineHeight: '1.5',
            fontWeight: '550'
          }}>
            <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        {!successMessage && recipientInfo && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <Button
              onClick={() => handleAction('report')}
              variant="danger"
              loading={actionLoading}
              disabled={actionLoading}
              icon={ShieldAlert}
              style={{ minWidth: '160px' }}
            >
              Report Email
            </Button>
            <Button
              onClick={() => handleAction('safe')}
              variant="outline"
              loading={actionLoading}
              disabled={actionLoading}
              icon={ShieldCheck}
              style={{ minWidth: '160px' }}
            >
              Mark as Safe
            </Button>
          </div>
        )}
      </div>

      {/* Simulated Email Details Box */}
      {recipientInfo && (
        <div className="saas-card" style={{ marginTop: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: 'var(--color-primary)' }} />
            Review Simulation Details
          </h3>
          
          <div style={{
            border: '1px solid var(--border-hover)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderBottom: '1px solid var(--border-hover)',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Recipient:</span> <strong>{recipientInfo.employee_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Subject:</span> <strong style={{ color: 'var(--text-main)' }}>{recipientInfo.email_subject}</strong>
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              fontSize: '13px',
              color: 'var(--text-main)',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              minHeight: '140px',
              fontFamily: 'monospace'
            }}>
              {recipientInfo.email_body}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportLandingPage;
