import { useState } from 'react'
import './App.css'
import AudioUpload from './components/AudioUpload'
import AudioManipulator from './components/AudioManipulator'

function App() {
  const [sourceAudioUrl, setSourceAudioUrl] = useState<string | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);

  const handleFileUpload = (file: { name: string, url: string } | null) => {
    setSourceAudioUrl(file?.url || null);
    setProcessedAudioUrl(null); // Reset processed audio when new file is uploaded
  };

  return (
    <div className="App">
      <div className="audio-workspace">
        <div className="audio-box">
          <h2>Upload Audio</h2>
          <AudioUpload onFileChange={handleFileUpload} />
        </div>
        
        <div className="audio-box">
          <h2>Manipulate Audio</h2>
          <AudioManipulator 
            sourceAudioUrl={sourceAudioUrl}
            onProcessedAudio={setProcessedAudioUrl}
          />
        </div>
        
        <div className="audio-box">
          <h2>Playback</h2>
          {processedAudioUrl ? (
            <audio 
              controls 
              src={processedAudioUrl}
              style={{ width: '100%', maxWidth: '250px' }}
            />
          ) : (
            <p>Processed audio will appear here</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
