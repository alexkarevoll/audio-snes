import { useState } from 'react';

interface AudioFile {
  name: string;
  url: string;
}

interface AudioUploadProps {
  onFileChange: (file: AudioFile | null) => void;
}

export default function AudioUpload({ onFileChange }: AudioUploadProps) {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      const newAudioFile = {
        name: file.name,
        url: url
      };
      setAudioFile(newAudioFile);
      onFileChange(newAudioFile);
    } else {
      alert('Please upload an audio file');
    }
  };

  const handleRemoveAudio = () => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.url); // Clean up the URL
    }
    setAudioFile(null);
    onFileChange(null);
  };

  return (
    <div className="audio-upload">
      {!audioFile ? (
        <div className="upload-section">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            id="audio-upload"
            className="hidden-input"
          />
          <label htmlFor="audio-upload" className="upload-button">
            Choose Audio File
          </label>
        </div>
      ) : (
        <div className="audio-player">
          <div className="file-info">
            <p className="file-name">{audioFile.name}</p>
            <button 
              className="remove-audio-button"
              onClick={handleRemoveAudio}
              title="Remove audio"
            >
              ×
            </button>
          </div>
          <audio
            controls
            src={audioFile.url}
            style={{ width: '100%', maxWidth: '250px' }}
          />
        </div>
      )}
    </div>
  );
} 