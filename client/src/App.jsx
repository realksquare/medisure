import React, { useState, useEffect } from 'react';
import UploadComponent from './components/UploadComponent';
import GenerateQR from './components/GenerateQR';
import BulkUpload from './components/BulkUpload';
import { ShieldCheck, FileCheck } from 'lucide-react';
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
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '12px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}>
                <ShieldCheck size={32} color="white" strokeWidth={2.5} />
              </div>
              <h1 style={{ margin: 0 }}>CertiSure</h1>
            </div>
            <h2 style={{ color: 'var(--text-main)' }}>Certificate Authentication System</h2>
            <p>Please select your role to continue.</p>
            <div className="role-buttons">
              <button onClick={() => setUserRole('institution')}>I am an Institution</button>
              <button onClick={() => setUserRole('verifier')}>I am a Verifier</button>
            </div>
          </div>

          <div className="welcome-container" style={{ width: '100%', textAlign: 'left', animationDelay: '0.2s', padding: '30px' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              Why CertiSure?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ The Problem with Traditional Credentials</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Physical degrees are easily forged, and database APIs have high latency. Employers waste weeks verifying academic histories manually.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ How CertiSure Solves It?</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  We don't store bulky PDFs. We use <strong>client-side hashing (SHA-256)</strong> to encrypt certificate metadata directly inside a QR code. The database only stores the cryptographic hash, ensuring zero data manipulation.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>⦿ What makes CertiSure better?</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Unlike centralized verification portals that charge per API call, CertiSure allows <strong>Instant Certificate Verification</strong> and infinite scalability through our Bulk CSV Certificate Uploader. It is fast, safe, efficient, and decentralized logic applied to Web2 infrastructure - also works on any browser-supported platform.
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
                <button onClick={() => setUserRole('institution-upload')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Single Upload
                </button>
                <button onClick={() => setUserRole('institution-bulk')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Bulk CSV Upload
                </button>
                <button onClick={() => setUserRole('institution-qr')} style={{ width: 'auto', padding: '10px 20px', fontSize: '1rem' }}>
                  Generate QR
                </button>
              </div>
              <UploadComponent
                title="Create Certificate Record"
                userType="institution"
              />
            </div>
          )}


          {userRole === 'institution-upload' && (
            <UploadComponent
              title="Create Certificate Record"
              userType="institution"
            />
          )}

          {userRole === 'institution-qr' && (
            <GenerateQR />
          )}

          {userRole === 'institution-bulk' && (
            <BulkUpload />
          )}

          {userRole === 'verifier' && (
            <UploadComponent
              title="Verify Certificate"
              userType="verifier"
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;