import React, { useState } from 'react';
import QRCode from 'qrcode';

export default function InstitutionPdfUpload() {
  const [formData, setFormData] = useState({
    patientName: '', gender: '', age: '', dob: '',
    registerNumber: '', bloodGroup: '', existingConditions: '',
    contactNumber: '', address: '', recordType: '',
    diagnosis: '', doctorName: '', issueDate: '', issuerName: ''
  });
  const [file, setFile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [response, setResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setResponse(null);
    setErrorMessage(null);
    setQrCode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setErrorMessage('Please select a file.');
    setIsProcessing(true);
    setErrorMessage(null);
    setResponse(null);
    setQrCode(null);

    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('recordData', JSON.stringify(formData));

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-record-file`, {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create mint record.');

      const qr = await QRCode.toDataURL(`${import.meta.env.VITE_APP_URL}/verify/${data.dataHash}`);
      setQrCode(qr);
      setResponse(data);
      setFile(null);
      setFormData({
        patientName: '', gender: '', age: '', dob: '',
        registerNumber: '', bloodGroup: '', existingConditions: '',
        contactNumber: '', address: '', recordType: '',
        diagnosis: '', doctorName: '', issueDate: '', issuerName: ''
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${formData.patientName || 'patient'}_medisure_qr.png`;
    link.click();
  };

  return (
    <div className="form-container">
      <h2>Create Mint Medical Record</h2>

      <div className="caution-banner">
        <span>⚠️</span>
        <p>Mint mode hashes the exact file. Any future modification - even one pixel - will flag it as tampered.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <p className="record-section-label">Upload Medical Document</p>
        <div className="file-upload-wrapper">
          <input
            type="file"
            id="mint-file-input"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
          />
          <label htmlFor="mint-file-input" className={`file-upload-label ${file ? 'has-file' : ''}`}>
            <span className="file-upload-icon">{file ? '📄' : '📁'}</span>
            <span>{file ? file.name : 'Choose file — PDF, JPG, or PNG'}</span>
          </label>
        </div>

        <p className="record-section-label" style={{ marginTop: '8px' }}>Patient Information</p>
        <input type="text" name="patientName" placeholder="Patient Name" value={formData.patientName} onChange={handleChange} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <input type="text" name="registerNumber" placeholder="Patient ID / Register Number" value={formData.registerNumber} onChange={handleChange} required />
        <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="existingConditions" placeholder="Existing Conditions (or 'None')" value={formData.existingConditions} onChange={handleChange} required />

        <p className="record-section-label" style={{ marginTop: '8px' }}>Medical Details</p>
        <select name="recordType" value={formData.recordType} onChange={handleChange} required>
          <option value="">Select Record Type</option>
          <option value="Lab Report">Lab Report</option>
          <option value="Prescription">Prescription</option>
          <option value="Discharge Summary">Discharge Summary</option>
          <option value="Vaccination Record">Vaccination Record</option>
          <option value="Radiology Report">Radiology Report</option>
        </select>
        <input type="text" name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleChange} required />
        <input type="text" name="doctorName" placeholder="Attending Doctor" value={formData.doctorName} onChange={handleChange} required />

        <p className="record-section-label" style={{ marginTop: '8px' }}>Issuance Details</p>
        <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
        <input type="text" name="issuerName" placeholder="Hospital / Issuer Name" value={formData.issuerName} onChange={handleChange} required />

        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Create Mint Record'}
        </button>
      </form>

      {errorMessage && (
        <div className="result-box error-box" style={{ marginTop: '24px' }}>
          <p className="result-title">❌ {errorMessage}</p>
        </div>
      )}

      {response && qrCode && (
        <div className="result-box success-box" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p className="result-title">✅ Mint Record Created!</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>Scan this QR to verify the exact original file:</p>
          <img src={qrCode} alt="Mint Record QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px', marginBottom: '16px' }} />
          <br />
          <button className="secondary-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={downloadQR}>
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}