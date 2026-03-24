import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function VerificationPage() {
  const { hash } = useParams();
  const [record, setRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hash) return;
    const fetchRecord = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataHash: hash }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed.');
        setRecord(data.record);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [hash]);

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      🔍 Verifying record...
    </div>
  );

  if (errorMessage) return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ padding: '20px', border: '2px solid red', borderRadius: '12px' }}>
        <h2 style={{ color: 'red' }}>❌ Verification Failed</h2>
        <p>{errorMessage}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This record may be tampered, unregistered, or the QR code is invalid.</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
      {record && (
        <div style={{ padding: '25px', border: '2px solid #0d9488', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #0d9488', paddingBottom: '15px' }}>
            <span style={{ fontSize: '2rem' }}>🏥</span>
            <div>
              <h2 style={{ color: '#0d9488', margin: 0 }}>✅ Verified Medical Record</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Authenticated by MediSure — Powered by SHA-256</p>
            </div>
          </div>

          <h4 style={{ color: '#0d9488', marginBottom: '10px' }}>Patient Information</h4>
          <p><strong>Name:</strong> {record.patientName}</p>
          <p><strong>Gender:</strong> {record.gender}</p>
          <p><strong>Age:</strong> {record.age}</p>
          <p><strong>Date of Birth:</strong> {record.dob}</p>
          <p><strong>Register Number:</strong> {record.registerNumber}</p>
          <p><strong>Blood Group:</strong> {record.bloodGroup}</p>
          <p><strong>Contact:</strong> {record.contactNumber}</p>
          <p><strong>Address:</strong> {record.address}</p>
          <p><strong>Existing Conditions:</strong> {record.existingConditions}</p>

          <h4 style={{ color: '#0d9488', margin: '15px 0 10px' }}>Medical Details</h4>
          <p><strong>Record Type:</strong> {record.recordType}</p>
          <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
          <p><strong>Doctor:</strong> {record.doctorName}</p>

          <h4 style={{ color: '#0d9488', margin: '15px 0 10px' }}>Issuance Details</h4>
          <p><strong>Issue Date:</strong> {record.issueDate}</p>
          <p><strong>Issued By:</strong> {record.issuerName}</p>
        </div>
      )}
    </div>
  );
}