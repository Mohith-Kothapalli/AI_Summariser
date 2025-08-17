import React, { useState } from 'react';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setTranscript(e.target.result);
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    setLoading(true);
    setSummary('');
    try {
      const res = await fetch('http://localhost:3001/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, prompt })
      });
      const data = await res.json();
      setSummary(data.summary || data.error || '');
    } catch (err) {
      setSummary('Failed to summarize.');
    }
    setLoading(false);
  };

  const handleEdit = e => setSummary(e.target.value);

  const handleSendEmail = async () => {
    setEmailStatus('');
    try {
      const res = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, emails })
      });
      const data = await res.json();
      setEmailStatus(data.success ? 'Email sent!' : data.error);
    } catch (err) {
      setEmailStatus('Failed to send email');
    }
  };

  return (
    <div className="app-container">
      <h2>AI Meeting Notes Summarizer</h2>
      <label>
        Transcript:
        <input type="file" accept=".txt" onChange={handleFileUpload} />
      </label>
      <textarea
        rows={6}
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        placeholder="Or paste your transcript here..."
      />
      <label>
        Instruction / Prompt:
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="E.g., Summarize in bullet points for executives"
        />
      </label>
      <button
        onClick={handleSummarize}
        disabled={loading || !transcript || !prompt}
      >
        {loading ? 'Summarizing...' : 'Generate Summary'}
      </button>

      <h4 style={{ marginTop: '1.5rem' }}>Summary</h4>
      <textarea
        rows={8}
        value={summary}
        onChange={handleEdit}
        placeholder="Generated summary will appear here..."
      />

      <label>
        Recipient Emails:
        <input
          type="text"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder="Comma separated emails"
        />
      </label>
      <button
        onClick={handleSendEmail}
        disabled={!summary || !emails}
        style={{ marginBottom: '1rem' }}
      >
        Send Summary via Email
      </button>
      {emailStatus && (
        <div style={{ marginTop: 12, fontWeight: 500 }}>{emailStatus}</div>
      )}
    </div>
  );
}

export default App;
