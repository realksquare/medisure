import React, { useState, useEffect } from 'react';
import CreateCertificateForm from './components/CreateCertificateForm';
import InstitutionPdfUpload from './components/InstitutionPdfUpload';
import VerifyCertificateForm from './components/VerifyCertificateForm';
import { ShieldCheck } from 'lucide-react';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [isDark]);

  return (
    <>
      <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="main-wrapper">
        {!userRole ? (
          <div className="content-holder" style={{ maxWidth: '720px' }}>
            <div className="welcome-container" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <ShieldCheck size={36} color="var(--primary-color)" />
                <h1>MediSure</h1>
              </div>
              <p style={{ marginBottom: '32px' }}>Secure Medical Record Authentication System</p>
              <div className="role-buttons">
                <button onClick={() => setUserRole('institution')}>I am a Hospital / Institution</button>
                <button onClick={() => setUserRole('verifier')}>I am a Verifier</button>
              </div>
            </div>

            <div className="welcome-container">
              <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Why MediSure?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px' }}>The Problem</h4>
                  <p style={{ fontSize: '0.95rem' }}>Forged prescriptions and tampered lab reports are a growing threat. Manual verification is slow and exploitable.</p>
                </div>
                <div>
                  <h4 style={{ marginBottom: '8px' }}>The Solution</h4>
                  <p style={{ fontSize: '0.95rem' }}>Server-side SHA-256 cryptographic hashing creates a tamper-proof fingerprint of every medical record. The server is always the source of truth.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="content-holder">
            <button className="back-button" onClick={() => setUserRole(null)}>
              &larr; Back
            </button>
            {userRole === 'institution' && (
              <div className="welcome-container" style={{ textAlign: 'center' }}>
                <h2>Institution Dashboard</h2>
                <div className="role-buttons" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                  <button style={{ flex: '1 1 calc(50% - 8px)', maxWidth: '300px' }} onClick={() => setUserRole('institution-basic')}>Basic Record Form</button>
                  <button style={{ flex: '1 1 calc(50% - 8px)', maxWidth: '300px' }} onClick={() => setUserRole('institution-mint')}>Mint File Upload</button>
                </div>
              </div>
            )}
            {userRole === 'institution-basic' && <CreateCertificateForm />}
            {userRole === 'institution-mint' && <InstitutionPdfUpload />}
            {userRole === 'verifier' && <VerifyCertificateForm />}
          </div>
        )}
      </div>
    </>
  );
}

export default App;