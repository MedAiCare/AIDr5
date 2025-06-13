import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [responseAudio, setResponseAudio] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'input.webm');

    try {
      const response = await axios.post('https://your-backend-api.com/chat-audio', formData);
      setResponseText(response.data.text);
      setResponseAudio(response.data.audio_url);
    } catch (err) {
      console.error('حدث خطأ أثناء الاتصال بالخادم:', err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 AIDr5 - المساعد الصوتي</h1>
      <p style={styles.subtitle}>
        تحدث بحرية، واضغط على "إرسال" لسماع رد الذكاء الاصطناعي.
      </p>

      <div style={styles.buttonGroup}>
        <button onClick={handleStartRecording} disabled={recording} style={styles.button}>
          🎙️ ابدأ التسجيل
        </button>
        <button onClick={handleStopRecording} disabled={!recording} style={styles.button}>
          ⏹️ أوقف التسجيل
        </button>
        <button onClick={handleSend} disabled={!audioBlob || loading} style={styles.sendButton}>
          🚀 إرسال الصوت
        </button>
      </div>

      {loading && <p style={styles.loading}>⏳ جاري تحليل الحديث...</p>}

      {responseText && (
        <div style={styles.card}>
          <strong>📝 النص:</strong>
          <p>{responseText}</p>
        </div>
      )}

      {responseAudio && (
        <div style={styles.card}>
          <strong>🎧 الرد الصوتي:</strong>
          <audio controls src={responseAudio} autoPlay />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '15px',
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loading: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '15px 20px',
    marginTop: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    textAlign: 'left',
  },
};

export default App;
