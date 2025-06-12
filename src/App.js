
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [responseAudio, setResponseAudio] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/mp3' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'input.mp3');

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat-audio', formData);
      const data = response.data;

      // تحويل النص الصوتي (base64) إلى Blob
      const audioBytes = atob(data.audio);
      const byteArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        byteArray[i] = audioBytes.charCodeAt(i);
      }
      const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
      const audioURL = URL.createObjectURL(audioBlob);

      setResponseAudio(audioURL);
      setResponseText(data.text);
    } catch (err) {
      console.error('حدث خطأ:', err);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: 'auto',
      background: '#fff',
      padding: 30,
      borderRadius: 8,
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      direction: 'rtl'
    }}>
      <h1 style={{ color: '#444' }}>مساعد AIDr5 الصوتي</h1>
      <p>اضغط على زر التسجيل، تحدث، ثم استمع واقرأ رد الذكاء الاصطناعي.</p>

      <button onClick={handleRecord} style={{ margin: 10, padding: '10px 20px' }}>
        🎙️ تسجيل 5 ثوانٍ
      </button>
      <button onClick={handleSend} disabled={!audioBlob} style={{ margin: 10, padding: '10px 20px' }}>
        🚀 إرسال
      </button>

      {loading && <p>⏳ جاري المعالجة...</p>}

      {responseText && (
        <div style={{ marginTop: 20 }}>
          <p>🧠 الرد النصي من AIDr5:</p>
          <div style={{
            background: '#f9f9f9',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}>
            {responseText}
          </div>
        </div>
      )}

      {responseAudio && (
        <div style={{ marginTop: 20 }}>
          <p>🎧 الرد الصوتي من AIDr5:</p>
          <audio controls src={responseAudio} autoPlay />
        </div>
      )}
    </div>
  );
}

export default App;

