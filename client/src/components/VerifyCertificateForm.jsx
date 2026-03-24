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

  const switchMode = (newMode) => {
    setMode(newMode);
    setRecord(null);
    setErrorMessage(null);
    if (scanning) stopScanner();
  };

  const handleBasicVerify = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecord(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-record`, {
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-file`, {
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
    <div className="form-container">
      <h2>Verify Medical Record</h2>

      <div className="tab-group">
        <button className={`tab-btn ${mode === 'basic' ? 'active' : ''}`} onClick={() => switchMode('basic')}>
          Basic — QR / Hash
        </button>
        <button className={`tab-btn ${mode === 'mint' ? 'active' : ''}`} onClick={() => switchMode('mint')}>
          Mint — File Upload
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
          <button type="button" className="secondary-btn" onClick={scanning ? stopScanner : startScanner}>
            {scanning ? '✋ Stop Scanner' : '📷 Scan QR Code'}
          </button>
          <div id="qr-reader" style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }} />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Record'}
          </button>
        </form>
      )}

      {mode === 'mint' && (
        <form onSubmit={handleMintVerify}>
          <p className="caution-text">⚠️ Upload the exact original file. Even one pixel change will flag it as tampered.</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify File'}
          </button>
        </form>
      )}

      {errorMessage && (
        <div className="result-box error-box">
          <p className="result-title">❌ {errorMessage}</p>
        </div>
      )}

      {record && (
        <div className="result-box success-box">
          <p className="result-title">✅ Record Verified!</p>

          <div className="record-section">
            <p className="record-section-label">Patient Information</p>
            <div className="record-grid">
              <span>Name</span><span>{record.patientName}</span>
              <span>Gender</span><span>{record.gender}</span>
              <span>Age</span><span>{record.age}</span>
              <span>Date of Birth</span><span>{record.dob}</span>
              <span>Register Number</span><span>{record.registerNumber}</span>
              <span>Blood Group</span><span>{record.bloodGroup}</span>
              <span>Contact</span><span>{record.contactNumber}</span>
              <span>Address</span><span>{record.address}</span>
              <span>Existing Conditions</span><span>{record.existingConditions}</span>
            </div>
          </div>

          <div className="record-section">
            <p className="record-section-label">Medical Details</p>
            <div className="record-grid">
              <span>Record Type</span><span>{record.recordType}</span>
              <span>Diagnosis</span><span>{record.diagnosis}</span>
              <span>Doctor</span><span>{record.doctorName}</span>
            </div>
          </div>

          <div className="record-section">
            <p className="record-section-label">Issuance Details</p>
            <div className="record-grid">
              <span>Issue Date</span><span>{record.issueDate}</span>
              <span>Issued By</span><span>{record.issuerName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}