import React, { useState, useEffect } from 'react';
import CreateCertificateForm from './components/CreateCertificateForm';
import InstitutionPdfUpload from './components/InstitutionPdfUpload';
import VerifyCertificateForm from './components/VerifyCertificateForm';
import BulkUpload from './components/BulkUpload';
import { ShieldCheck } from 'lucide-react';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  return (
    <>
      <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {!userRole ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <div className="welcome-container" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                padding: '12px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
              }}>
                <ShieldCheck size={32} color="white" strokeWidth={2.5} />
              </div>
              <h1 style={{ margin: 0 }}>MediSure</h1>
            </div>
            <h2 style={{ color: 'var(--text-main)' }}>Medical Record Authentication System</h2>
            <p>Please select your role to continue.</p>
            <div className="role-buttons">
              <button onClick={() => setUserRole('institution')}>I am a Hospital / Institution</button>
              <button onClick={() => setUserRole('verifier')}>I am a Verifier</button>
            </div>
          </div>

          <div className="welcome-container" style={{ width: '100%', textAlign: 'left', animationDelay: '0.2s', padding: '30px' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              Why MediSure?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ The Problem with Medical Records Today</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Forged prescriptions, tampered lab reports, and fabricated discharge summaries are a growing threat. Manual verification is slow, error-prone, and exploitable - putting patient lives at risk.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ How MediSure Solves It</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  MediSure uses <strong>server-side SHA-256 cryptographic hashing</strong> to create a tamper-proof fingerprint of every medical record. The server, not the client - is always the source of truth, eliminating any possibility of hash manipulation before storage.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ Two Modes, Complete Coverage</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Basic Mode</strong> - QR code verification renders the official server-side record instantly, making physical paper irrelevant. <strong>Mint Mode</strong> - SHA-256 hashes the entire file byte-for-byte. Even a single pixel change is automatically flagged as tampered, with zero human review needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <button className="back-button" onClick={() => setUserRole(null)}>
            &larr; Back to Role Selection
          </button>

          {userRole === 'institution' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }} className="role-buttons">
                <button onClick={() => setUserRole('institution-basic')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Basic Record (Form)
                </button>
                <button onClick={() => setUserRole('institution-mint')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Mint Record (File Upload)
                </button>
                <button onClick={() => setUserRole('institution-bulk')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Bulk Upload 🚧
                </button>
              </div>
            </div>
          )}

          {userRole === 'institution-basic' && <CreateCertificateForm />}
          {userRole === 'institution-mint' && <InstitutionPdfUpload />}
          {userRole === 'institution-bulk' && (
            <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--glass-border)', borderRadius: '12px', marginTop: '20px' }}>
              <h3 style={{ color: 'var(--text-main)' }}>🚧 Bulk Upload - Coming Soon</h3>
              <p style={{ color: 'var(--text-muted)' }}>Batch issue and hash hundreds of medical records simultaneously with a single Excel/CSV upload.</p>
            </div>
          )}

          {userRole === 'verifier' && <VerifyCertificateForm />}
        </div>
      )}
    </>
  );
}

export default App;
