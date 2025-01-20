import { useEffect } from 'react';

export type EffectType = 'pitch' | 'tempo' | 'reverb' | 'distortion' | 'filter' | 'delay' | 'bitcrush' | 'chorus';

interface EffectOption {
  id: EffectType;
  name: string;
  description: string;
}

const EFFECTS: EffectOption[] = [
  {
    id: 'pitch',
    name: 'Pitch Shift',
    description: 'Adjust the pitch up or down'
  },
  {
    id: 'tempo',
    name: 'Tempo',
    description: 'Change the speed without affecting pitch'
  },
  {
    id: 'reverb',
    name: 'Reverb',
    description: 'Add space and depth'
  },
  {
    id: 'distortion',
    name: 'Distortion',
    description: 'Add warmth and grit'
  },
  {
    id: 'filter',
    name: 'Filter',
    description: 'Shape the frequency spectrum'
  },
  {
    id: 'delay',
    name: 'Delay',
    description: 'Create echoes and rhythmic patterns'
  },
  {
    id: 'bitcrush',
    name: 'Bit Crusher',
    description: 'Add retro-style digital distortion'
  },
  {
    id: 'chorus',
    name: 'Chorus',
    description: 'Create a rich, shimmering effect'
  }
];

interface EffectSelectorProps {
  onSelect: (effect: EffectType) => void;
  onClose: () => void;
  usedEffects: EffectType[];
}

export default function EffectSelector({ onSelect, onClose, usedEffects }: EffectSelectorProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add Effect</h3>
        <div className="effect-grid">
          {EFFECTS.map(effect => (
            <button
              key={effect.id}
              className="effect-option"
              onClick={() => {
                onSelect(effect.id);
                onClose();
              }}
              disabled={usedEffects.includes(effect.id)}
            >
              <h4>{effect.name}</h4>
              <p>{effect.description}</p>
            </button>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 