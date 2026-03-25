import React, { useState } from 'react';
import QRCode from 'qrcode';

export default function CreateCertificateForm() {
  const [formData, setFormData] = useState({
    patientName: '', gender: '', age: '', dob: '',
    registerNumber: '', bloodGroup: '', existingConditions: '',
    contactNumber: '', address: '', recordType: '',
    diagnosis: '', doctorName: '', issueDate: '', issuerName: ''
  });

  const [qrCode, setQrCode] = useState(null);
  const [response, setResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setResponse(null);
    setQrCode(null);
    setIsProcessing(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordData: formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create record');

      const qr = await QRCode.toDataURL(`${import.meta.env.VITE_APP_URL}/verify/${data.dataHash}`);
      setQrCode(qr);
      setResponse(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${formData.patientName.trim().replace(/\s+/g, '_').toLowerCase() || 'patient'}_medisure_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="form-container">
      <h2>Create Medical Record</h2>
      <form onSubmit={handleSubmit}>

        <p className="record-section-label">Patient Information</p>
        <input
          type="text" name="patientName" placeholder="Patient Name"
          value={formData.patientName} onChange={handleChange}
          pattern="[A-Za-z\s]+" title="Name should contain letters only"
          minLength={2} required
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="" disabled>Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number" name="age" placeholder="Age"
            value={formData.age} onChange={handleChange}
            min={0} max={150} required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="" disabled>Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <input
          type="text" name="registerNumber" placeholder="Patient ID / Register Number"
          value={formData.registerNumber} onChange={handleChange}
          minLength={3} required
        />
        <input
          type="tel" name="contactNumber" placeholder="Contact Number"
          value={formData.contactNumber} onChange={handleChange}
          pattern="[0-9]{7,15}" title="Enter a valid contact number (digits only)"
          required
        />
        <input
          type="text" name="address" placeholder="Address"
          value={formData.address} onChange={handleChange}
          minLength={5} required
        />
        <input
          type="text" name="existingConditions" placeholder="Existing Conditions (or 'None')"
          value={formData.existingConditions} onChange={handleChange}
          required
        />

        <p className="record-section-label" style={{ marginTop: '8px' }}>Medical Details</p>
        <select name="recordType" value={formData.recordType} onChange={handleChange} required>
          <option value="" disabled>Select Record Type</option>
          <option value="Lab Report">Lab Report</option>
          <option value="Prescription">Prescription</option>
          <option value="Discharge Summary">Discharge Summary</option>
          <option value="Vaccination Record">Vaccination Record</option>
          <option value="Radiology Report">Radiology Report</option>
        </select>
        <input
          type="text" name="diagnosis" placeholder="Diagnosis"
          value={formData.diagnosis} onChange={handleChange}
          minLength={2} required
        />
        <input
          type="text" name="doctorName" placeholder="Attending Doctor"
          value={formData.doctorName} onChange={handleChange}
          pattern="[A-Za-z\s\.]+" title="Doctor name should contain letters only"
          minLength={2} required
        />

        <p className="record-section-label" style={{ marginTop: '8px' }}>Issuance Details</p>
        <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
        <input
          type="text" name="issuerName" placeholder="Hospital / Issuer Name"
          value={formData.issuerName} onChange={handleChange}
          minLength={2} required
        />

        <button type="submit" disabled={isProcessing} style={{ marginTop: '20px' }}>
          {isProcessing ? 'Generating Record...' : 'Create Record'}
        </button>
      </form>

      {errorMessage && (
        <div className="result-box error-box" style={{ marginTop: '24px' }}>
          <p className="result-title">❌ {errorMessage}</p>
        </div>
      )}

      {response && qrCode && (
        <div className="result-box success-box" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p className="result-title">✅ Record Generated Successfully!</p>
          <img src={qrCode} alt="Medical Record QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', marginBottom: '16px' }} />
          <br />
          <button className="secondary-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={downloadQR}>
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}