import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function VerifyCertificateForm() {
  const [mode, setMode] = useState('basic');
  const [inputMethod, setInputMethod] = useState('manual');
  const [hashInput, setHashInput] = useState('');
  const [file, setFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
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
        setHashInput(extractHash(decodedText));
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

  const switchInputMethod = (method) => {
    setInputMethod(method);
    setHashInput('');
    setQrFile(null);
    setErrorMessage(null);
    setRecord(null);
    if (scanning) stopScanner();
  };

  const extractHash = (text) => {
    try {
      const url = new URL(text);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1] || text;
    } catch {
      return text.trim();
    }
  };

  const extractQrFromImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        URL.revokeObjectURL(url);
        if (code?.data) resolve(extractHash(code.data));
        else reject(new Error('No QR code found in this image.'));
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = url;
    });
  };

  const extractQrFromPdf = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        try {
          const pdf = await pdfjsLib.getDocument(new Uint8Array(reader.result)).promise;
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            for (const scale of [2.0, 3.0, 4.0]) {
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
              const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
              if (code?.data) { resolve(extractHash(code.data)); return; }
            }
          }
          reject(new Error('No QR code found in this PDF.'));
        } catch {
          reject(new Error('Failed to process PDF.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
    });
  };

  const handleQrFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setQrFile(selected);
    setHashInput('');
    setErrorMessage(null);
    setRecord(null);
    setLoading(true);
    try {
      const isPdf = selected.type === 'application/pdf';
      const hash = isPdf
        ? await extractQrFromPdf(selected)
        : await extractQrFromImage(selected);
      setHashInput(hash);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
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
          Basic - QR / Hash
        </button>
        <button className={`tab-btn ${mode === 'mint' ? 'active' : ''}`} onClick={() => switchMode('mint')}>
          Mint - File Upload
        </button>
      </div>

      {mode === 'basic' && (
        <form onSubmit={handleBasicVerify}>
          <div className="input-method-toggle">
            <button type="button" className={`method-btn ${inputMethod === 'manual' ? 'active' : ''}`} onClick={() => switchInputMethod('manual')}>
              ✍️ Manual / Camera
            </button>
            <button type="button" className={`method-btn ${inputMethod === 'file' ? 'active' : ''}`} onClick={() => switchInputMethod('file')}>
              📂 From PDF / Image
            </button>
          </div>

          {inputMethod === 'manual' && (
            <>
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
            </>
          )}

          {inputMethod === 'file' && (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Upload a PDF or image containing the MediSure QR code — the hash will be extracted automatically.
              </p>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="qr-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleQrFileChange}
                />
                <label htmlFor="qr-file-input" className={`file-upload-label ${qrFile ? 'has-file' : ''}`}>
                  <span className="file-upload-icon">{qrFile ? '📄' : '📁'}</span>
                  <span>{qrFile ? qrFile.name : 'Choose PDF or image with QR code'}</span>
                </label>
              </div>
              {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🔍 Scanning for QR code...</p>}
              {hashInput && (
                <div className="hash-preview">
                  <span className="record-section-label">Hash extracted ✓</span>
                  <p>{hashInput}</p>
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={loading || !hashInput}>
            {loading && inputMethod === 'manual' ? 'Verifying...' : 'Verify Record'}
          </button>
        </form>
      )}

      {mode === 'mint' && (
        <form onSubmit={handleMintVerify}>
          <p className="caution-text">⚠️ Upload the exact original file. Even one pixel change will flag it as tampered.</p>
          <div className="file-upload-wrapper">
            <input type="file" id="mint-verify-input" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} required />
            <label htmlFor="mint-verify-input" className={`file-upload-label ${file ? 'has-file' : ''}`}>
              <span className="file-upload-icon">{file ? '📄' : '📁'}</span>
              <span>{file ? file.name : 'Choose file — PDF, JPG, or PNG'}</span>
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify File'}
          </button>
        </form>
      )}

      {errorMessage && (
        <div className="result-box error-box" style={{ marginTop: '24px' }}>
          <p className="result-title">❌ {errorMessage}</p>
        </div>
      )}

      {record && (
        <div className="result-box success-box" style={{ marginTop: '24px' }}>
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