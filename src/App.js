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
      setResponseAudio(response.data.audio_url); // URL to TTS audio file
    } catch (err) {
      console.error('حدث خطأ أثناء الاتصال بالخادم:', err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 30 }}>
      <h1>🧠 AIDr5 - محادثة صوتية ذكية</h1>
      <p>ابدأ الحديث متى شئت، ثم أوقف التسجيل للاستماع إلى رد AIDr5.</p>

      <button onClick={handleStartRecording} disabled={recording}>
        🎙️ ابدأ التسجيل
      </button>
      <button onClick={handleStopRecording} disabled={!recording}>
        ⏹️ أوقف التسجيل
      </button>
      <button onClick={handleSend} disabled={!audioBlob || loading}>
        🚀 إرسال الصوت
      </button>

      {loading && <p>⏳ جاري تحليل الحديث والرد...</p>}

      {responseText && (
        <div style={{ marginTop: 20 }}>
          📝 <strong>النص:</strong>
          <div>{responseText}</div>
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
