import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function VerifyCertificateForm() {
  const [mode, setMode] = useState('basic');
  const [hashInput, setHashInput] = useState('');
  const [file, setFile] = useState(null);
  const [record, setRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => { }); };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        setHashInput(decodedText);
        scanner.stop().then(() => setScanning(false));
      },
      () => { }
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) scannerRef.current.stop().then(() => setScanning(false));
  };

  const handleBasicVerify = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecord(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataHash: hashInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');
      setRecord(data.record);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMintVerify = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecord(null);
    if (!file) return setErrorMessage('Please upload a file.');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-file`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');
      setRecord(data.record);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Verify Medical Record</h2>

      <div>
        <button onClick={() => { setMode('basic'); setRecord(null); setErrorMessage(null); }}
          style={{ fontWeight: mode === 'basic' ? 'bold' : 'normal' }}>
          Basic (QR / Hash)
        </button>
        <button onClick={() => { setMode('mint'); setRecord(null); setErrorMessage(null); }}
          style={{ fontWeight: mode === 'mint' ? 'bold' : 'normal' }}>
          Mint (File Upload)
        </button>
      </div>

      {mode === 'basic' && (
        <form onSubmit={handleBasicVerify}>
          <input
            type="text"
            placeholder="Paste hash or scan QR below"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            required
          />
          {!scanning
            ? <button type="button" onClick={startScanner}>📷 Scan QR Code</button>
            : <button type="button" onClick={stopScanner}>✋ Stop Scanner</button>
          }
          <div id="qr-reader" style={{ width: '300px', marginTop: '10px' }} />
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Record'}</button>
        </form>
      )}

      {mode === 'mint' && (
        <form onSubmit={handleMintVerify}>
          <p style={{ color: 'orange' }}>⚠️ Caution: Upload the exact original file. Even minor edits will flag it as tampered.</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify File'}</button>
        </form>
      )}

      {errorMessage && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid red', borderRadius: '8px' }}>
          <h3 style={{ color: 'red' }}>❌ {errorMessage}</h3>
        </div>
      )}

      {record && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid green', borderRadius: '8px' }}>
          <h3 style={{ color: 'green' }}>✅ Record Verified!</h3>

          <h4>Patient Information</h4>
          <p><strong>Name:</strong> {record.patientName}</p>
          <p><strong>Gender:</strong> {record.gender}</p>
          <p><strong>Age:</strong> {record.age}</p>
          <p><strong>Date of Birth:</strong> {record.dob}</p>
          <p><strong>Register Number:</strong> {record.registerNumber}</p>
          <p><strong>Blood Group:</strong> {record.bloodGroup}</p>
          <p><strong>Contact:</strong> {record.contactNumber}</p>
          <p><strong>Address:</strong> {record.address}</p>
          <p><strong>Existing Conditions:</strong> {record.existingConditions}</p>

          <h4>Medical Details</h4>
          <p><strong>Record Type:</strong> {record.recordType}</p>
          <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
          <p><strong>Doctor:</strong> {record.doctorName}</p>

          <h4>Issuance Details</h4>
          <p><strong>Issue Date:</strong> {record.issueDate}</p>
          <p><strong>Issued By:</strong> {record.issuerName}</p>
        </div>
      )}
    </div>
  );
}
