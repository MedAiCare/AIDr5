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
    <div style={{
      maxWidth: 480,
      margin: 'auto',
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h2>🧠 مساعد AIDr5 الصوتي</h2>
      <p>ابدأ الحديث ثم أوقف التسجيل للاستماع إلى الرد.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
        <button onClick={handleStartRecording} disabled={recording}>🎙️ ابدأ التسجيل</button>
        <button onClick={handleStopRecording} disabled={!recording}>⏹️ إيقاف</button>
        <button onClick={handleSend} disabled={!audioBlob || loading}>🚀 إرسال</button>
      </div>

      {loading && <p style={{ marginTop: 20 }}>⏳ جاري التحليل...</p>}

      {responseText && (
        <div style={{ marginTop: 30, textAlign: 'right' }}>
          <strong>📝 النص:</strong>
          <div>{responseText}</div>
        </div>
      )}

      {responseAudio && (
        <div style={{ marginTop: 20 }}>
          <p>🎧 الرد الصوتي:</p>
          <audio controls src={responseAudio} autoPlay />
        </div>
      )}
    </div>
  );
}

export default App;
