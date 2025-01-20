import { useState, useEffect } from 'react';
import EffectSlot from './EffectSlot';
import EffectSelector, { EffectType } from './EffectSelector';

interface AudioManipulatorProps {
  sourceAudioUrl: string | null;
  onProcessedAudio: (url: string | null) => void;
}

export default function AudioManipulator({ sourceAudioUrl, onProcessedAudio }: AudioManipulatorProps) {
  // Effect slots state
  const [activeEffects, setActiveEffects] = useState<(EffectType | null)[]>([null, null, null, null]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  // Effect values
  const [pitchValue, setPitchValue] = useState(0);
  const [bpmRatio, setBpmRatio] = useState(1);
  const [isReverbEnabled, setIsReverbEnabled] = useState(false);
  const [isDistortionEnabled, setIsDistortionEnabled] = useState(false);
  const [filterFreq, setFilterFreq] = useState(20000);
  const [delayTime, setDelayTime] = useState(0);
  const [bitDepth, setBitDepth] = useState(16);
  const [chorusMix, setChorusMix] = useState(0);
  
  // Audio processing state
  const [originalBpm, setOriginalBpm] = useState<number | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create impulse response for reverb
  const createReverb = (context: AudioContext): AudioBuffer => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = context.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);

    // Generate reverb impulse response
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-3 * t); // Decay factor
      leftChannel[i] = (Math.random() * 2 - 1) * decay;
      rightChannel[i] = (Math.random() * 2 - 1) * decay;
    }

    return impulse;
  };

  // Create distortion curve
  const createDistortionCurve = (amount = 50) => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  };

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContext) {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
  }, []);

  // Detect BPM from audio data
  const detectBpm = async (audioBuffer: AudioBuffer): Promise<number> => {
    const data = audioBuffer.getChannelData(0); // Get first channel
    const sampleRate = audioBuffer.sampleRate;
    
    // Convert audio data to energy over time
    const chunkSize = Math.floor(sampleRate / 10); // 100ms chunks
    const energies: number[] = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
      let energy = 0;
      for (let j = 0; j < chunkSize && i + j < data.length; j++) {
        energy += Math.abs(data[i + j]);
      }
      energies.push(energy);
    }

    // Find peaks in energy (beats)
    const threshold = Math.max(...energies) * 0.5;
    const peaks: number[] = [];
    
    for (let i = 1; i < energies.length - 1; i++) {
      if (energies[i] > threshold && 
          energies[i] > energies[i-1] && 
          energies[i] > energies[i+1]) {
        peaks.push(i);
      }
    }

    // Calculate average time between peaks
    let totalTime = 0;
    for (let i = 1; i < peaks.length; i++) {
      totalTime += (peaks[i] - peaks[i-1]) * 0.1; // 0.1 seconds per chunk
    }
    
    const averageTime = totalTime / (peaks.length - 1);
    const bpm = Math.round(60 / averageTime);

    // Return a reasonable BPM between 60 and 200
    return Math.max(60, Math.min(200, bpm));
  };

  // Create chorus effect
  const createChorus = (context: BaseAudioContext, mix: number) => {
    const delayNode = context.createDelay();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    delayNode.delayTime.value = 0.03; // 30ms base delay
    oscillator.frequency.value = 0.1; // 0.1 Hz modulation
    gainNode.gain.value = 0.002; // Modulation depth
    
    oscillator.connect(gainNode);
    gainNode.connect(delayNode.delayTime);
    oscillator.start();
    
    return {
      input: delayNode,
      output: delayNode,
      mix: mix / 100 // Convert percentage to 0-1
    };
  };

  // Create bitcrusher effect
  const createBitcrusher = (context: BaseAudioContext, bits: number) => {
    const scriptNode = context.createScriptProcessor(4096, 1, 1);
    const step = Math.pow(0.5, bits);
    
    scriptNode.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);
      
      for (let i = 0; i < input.length; i++) {
        output[i] = Math.round(input[i] / step) * step;
      }
    };
    
    return scriptNode;
  };

  useEffect(() => {
    if (!sourceAudioUrl || !audioContext) return;

    const processAudio = async () => {
      setIsProcessing(true);
      try {
        const response = await fetch(sourceAudioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (!originalBpm) {
          const detectedBpm = await detectBpm(audioBuffer);
          setOriginalBpm(detectedBpm);
        }

        const offlineContext = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          Math.floor(audioBuffer.length / bpmRatio),
          audioBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.detune.value = pitchValue * 100;
        source.playbackRate.value = bpmRatio;

        let audioNode: AudioNode = source;
        let lastNode: AudioNode = source;

        // Process active effects in order
        activeEffects.forEach(effect => {
          if (!effect) return;

          switch (effect) {
            case 'filter': {
              const filter = offlineContext.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.value = filterFreq;
              lastNode.connect(filter);
              lastNode = filter;
              audioNode = filter;
              break;
            }
            case 'delay': {
              if (delayTime > 0) {
                const delay = offlineContext.createDelay(2.0);
                const feedback = offlineContext.createGain();
                const dry = offlineContext.createGain();
                const wet = offlineContext.createGain();
                
                delay.delayTime.value = delayTime / 1000;
                feedback.gain.value = 0.4;
                dry.gain.value = 0.6;
                wet.gain.value = 0.4;

                lastNode.connect(dry);
                lastNode.connect(delay);
                delay.connect(feedback);
                feedback.connect(delay);
                delay.connect(wet);

                const merger = offlineContext.createGain();
                dry.connect(merger);
                wet.connect(merger);

                lastNode = merger;
                audioNode = merger;
              }
              break;
            }
            case 'bitcrush': {
              const bitcrusher = createBitcrusher(offlineContext, bitDepth);
              lastNode.connect(bitcrusher);
              lastNode = bitcrusher;
              audioNode = bitcrusher;
              break;
            }
            case 'chorus': {
              if (chorusMix > 0) {
                const chorus = createChorus(offlineContext, chorusMix);
                const dry = offlineContext.createGain();
                const wet = offlineContext.createGain();
                
                dry.gain.value = 1 - chorus.mix;
                wet.gain.value = chorus.mix;

                lastNode.connect(dry);
                lastNode.connect(chorus.input);
                chorus.output.connect(wet);

                const merger = offlineContext.createGain();
                dry.connect(merger);
                wet.connect(merger);

                lastNode = merger;
                audioNode = merger;
              }
              break;
            }
            case 'distortion': {
              if (isDistortionEnabled) {
                const distortion = offlineContext.createWaveShaper();
                distortion.curve = createDistortionCurve();
                distortion.oversample = '4x';
                lastNode.connect(distortion);
                lastNode = distortion;
                audioNode = distortion;
              }
              break;
            }
            case 'reverb': {
              if (isReverbEnabled) {
                const convolver = offlineContext.createConvolver();
                const reverbBuffer = offlineContext.createBuffer(
                  2,
                  offlineContext.sampleRate * 2,
                  offlineContext.sampleRate
                );
                
                for (let channel = 0; channel < 2; channel++) {
                  const channelData = reverbBuffer.getChannelData(channel);
                  for (let i = 0; i < channelData.length; i++) {
                    const t = i / offlineContext.sampleRate;
                    channelData[i] = (Math.random() * 2 - 1) * Math.exp(-3 * t);
                  }
                }
                
                convolver.buffer = reverbBuffer;
                
                const dryGain = offlineContext.createGain();
                const wetGain = offlineContext.createGain();
                
                dryGain.gain.value = 0.5;
                wetGain.gain.value = 0.5;

                lastNode.connect(dryGain);
                lastNode.connect(convolver);
                convolver.connect(wetGain);
                
                const merger = offlineContext.createGain();
                dryGain.connect(merger);
                wetGain.connect(merger);
                
                lastNode = merger;
                audioNode = merger;
              }
              break;
            }
          }
        });

        lastNode.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();
        const wavBlob = await bufferToWav(renderedBuffer);
        const processedUrl = URL.createObjectURL(wavBlob);
        onProcessedAudio(processedUrl);
      } catch (error) {
        console.error('Error processing audio:', error);
        onProcessedAudio(null);
      }
      setIsProcessing(false);
    };

    processAudio();
  }, [sourceAudioUrl, pitchValue, bpmRatio, isReverbEnabled, isDistortionEnabled, 
      filterFreq, delayTime, bitDepth, chorusMix, activeEffects, audioContext]);

  // Helper function to convert AudioBuffer to WAV blob
  function bufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const outputBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(outputBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numberOfChannels, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    offset = 44;
    while (pos < buffer.length) {
      for (let i = 0; i < numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return new Promise((resolve) => {
      resolve(new Blob([outputBuffer], { type: 'audio/wav' }));
    });
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  const handleAddEffect = (slot: number) => {
    setSelectedSlot(slot);
  };

  const handleSelectEffect = (effect: EffectType) => {
    if (selectedSlot !== null) {
      const newEffects = [...activeEffects];
      newEffects[selectedSlot] = effect;
      setActiveEffects(newEffects);
      setSelectedSlot(null);
    }
  };

  const handleRemoveEffect = (slot: number) => {
    const newEffects = [...activeEffects];
    newEffects[slot] = null;
    setActiveEffects(newEffects);
  };

  // Convert BPM ratio to percentage display
  const getBpmPercentage = (ratio: number) => {
    return Math.round((ratio - 1) * 100);
  };

  // Convert percentage back to ratio
  const handleBpmChange = (percentage: number) => {
    const newRatio = 1 + (percentage / 100);
    setBpmRatio(newRatio);
  };

  return (
    <div className="audio-manipulator">
      <div className="effect-slots">
        {activeEffects.map((effect, index) => (
          <EffectSlot
            key={index}
            effect={effect}
            onAdd={() => handleAddEffect(index)}
            onRemove={() => handleRemoveEffect(index)}
            values={{
              pitch: pitchValue,
              tempo: getBpmPercentage(bpmRatio),
              reverb: isReverbEnabled,
              distortion: isDistortionEnabled,
              filter: filterFreq,
              delay: delayTime,
              bitcrush: bitDepth,
              chorus: chorusMix
            }}
            onChange={{
              pitch: setPitchValue,
              tempo: handleBpmChange,
              reverb: setIsReverbEnabled,
              distortion: setIsDistortionEnabled,
              filter: setFilterFreq,
              delay: setDelayTime,
              bitcrush: setBitDepth,
              chorus: setChorusMix
            }}
          />
        ))}
      </div>

      {selectedSlot !== null && (
        <EffectSelector
          onSelect={handleSelectEffect}
          onClose={() => setSelectedSlot(null)}
          usedEffects={activeEffects.filter((effect): effect is EffectType => effect !== null)}
        />
      )}

      {originalBpm && (
        <p className="bpm-display">
          {Math.round(originalBpm * bpmRatio)} BPM
          <span className="original-bpm">(Original: {originalBpm} BPM)</span>
        </p>
      )}

      {isProcessing && <p className="processing-message">Processing audio...</p>}
    </div>
  );
} 