import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

const MAX_BYTES = 10 * 1024 * 1024;

export default function Upload() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const { setCvInfo } = useApp();
  const navigate = useNavigate();

  async function handleFile(file) {
    if (!file) return;
    setError('');

    const isAllowed = file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isAllowed) {
      setError('Only PDF and DOCX files are accepted.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is larger than 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await cvApi.upload(file);
      setResult(res);
      const info = await cvApi.info();
      setCvInfo(info);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    await cvApi.delete().catch(() => {});
    setResult(null);
    setCvInfo(null);
  }

  return (
    <div className="page">
      <h1>Upload your CV</h1>

      {result ? (
        <div className="card">
          <p>Uploaded successfully — {result.charCount.toLocaleString()} characters parsed.</p>
          <div className="row">
            <button onClick={() => navigate('/search')} className="btn">Search jobs</button>
            <button onClick={handleDelete} className="btn-outline">Delete CV</button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            hidden
            onChange={e => handleFile(e.target.files?.[0])}
          />
          {uploading ? <p>Uploading…</p> : <p>Drag and drop your CV here, or click to browse (PDF or DOCX, max 10 MB)</p>}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
