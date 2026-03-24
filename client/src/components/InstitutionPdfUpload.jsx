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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create-record-file`, {
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

  return (
    <div>
      <h2>Create Mint Medical Record</h2>
      <p style={{ color: 'orange' }}>⚠️ Mint mode hashes the exact file. Any future modification — even one pixel — will flag it as tampered.</p>

      <form onSubmit={handleSubmit}>
        <h4>Upload Medical Document</h4>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
        {file && <p>Selected: <strong>{file.name}</strong></p>}

        <h4>Patient Information</h4>
        <input type="text" name="patientName" placeholder="Patient Name" value={formData.patientName} onChange={handleChange} required />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        <input type="text" name="registerNumber" placeholder="Register Number" value={formData.registerNumber} onChange={handleChange} required />
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
        <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="existingConditions" placeholder="Existing Health Conditions (or 'None')" value={formData.existingConditions} onChange={handleChange} required />

        <h4>Medical Details</h4>
        <select name="recordType" value={formData.recordType} onChange={handleChange} required>
          <option value="">Select Record Type</option>
          <option value="Lab Report">Lab Report</option>
          <option value="Prescription">Prescription</option>
          <option value="Discharge Summary">Discharge Summary</option>
          <option value="Vaccination Record">Vaccination Record</option>
          <option value="Radiology Report">Radiology Report</option>
        </select>
        <input type="text" name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleChange} required />
        <input type="text" name="doctorName" placeholder="Doctor Name" value={formData.doctorName} onChange={handleChange} required />

        <h4>Issuance Details</h4>
        <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
        <input type="text" name="issuerName" placeholder="Issuer Name / Hospital" value={formData.issuerName} onChange={handleChange} required />

        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Create Mint Record'}
        </button>
      </form>

      {errorMessage && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid red', borderRadius: '8px' }}>
          <p style={{ color: 'red' }}>❌ {errorMessage}</p>
        </div>
      )}

      {response && qrCode && (
        <div style={{ marginTop: '20px', padding: '15px', border: '2px solid green', borderRadius: '8px' }}>
          <h3 style={{ color: 'green' }}>✅ Mint Record Created!</h3>
          <p>Scan this QR to verify the exact original file:</p>
          <img src={qrCode} alt="Mint Record QR Code" />
        </div>
      )}
    </div>
  );
}