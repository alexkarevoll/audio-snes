import { EffectType } from './EffectSelector';
import { Donut } from 'react-dial-knob';

interface EffectSlotProps {
  effect: EffectType | null;
  onAdd: () => void;
  onRemove: () => void;
  values: {
    pitch: number;
    tempo: number;
    reverb: boolean;
    distortion: boolean;
    filter: number;
    delay: number;
    bitcrush: number;
    chorus: number;
  };
  onChange: {
    pitch: (value: number) => void;
    tempo: (value: number) => void;
    reverb: (value: boolean) => void;
    distortion: (value: boolean) => void;
    filter: (value: number) => void;
    delay: (value: number) => void;
    bitcrush: (value: number) => void;
    chorus: (value: number) => void;
  };
}

export default function EffectSlot({ 
  effect, 
  onAdd, 
  onRemove,
  values,
  onChange 
}: EffectSlotProps) {
  if (!effect) {
    return (
      <div className="effect-slot empty">
        <button className="add-effect" onClick={onAdd}>
          <span>+</span>
          <p>Add Effect</p>
        </button>
      </div>
    );
  }

  const renderEffect = () => {
    switch (effect) {
      case 'pitch':
        return (
          <Donut
            diameter={80}
            min={-12}
            max={12}
            step={1}
            value={values.pitch}
            onValueChange={onChange.pitch}
          >
            <p className="knob-label">Pitch</p>
          </Donut>
        );
      case 'tempo':
        return (
          <Donut
            diameter={80}
            min={-50}
            max={100}
            step={5}
            value={values.tempo}
            onValueChange={onChange.tempo}
          >
            <p className="knob-label">Tempo</p>
          </Donut>
        );
      case 'reverb':
        return (
          <label className="effect-toggle">
            <input
              type="checkbox"
              checked={values.reverb}
              onChange={(e) => onChange.reverb(e.target.checked)}
            />
            <span className="toggle-label">Reverb</span>
          </label>
        );
      case 'distortion':
        return (
          <label className="effect-toggle">
            <input
              type="checkbox"
              checked={values.distortion}
              onChange={(e) => onChange.distortion(e.target.checked)}
            />
            <span className="toggle-label">Distortion</span>
          </label>
        );
      case 'filter':
        return (
          <Donut
            diameter={80}
            min={20}
            max={20000}
            step={1}
            value={values.filter}
            onValueChange={onChange.filter}
          >
            <p className="knob-label">Cutoff (Hz)</p>
          </Donut>
        );
      case 'delay':
        return (
          <Donut
            diameter={80}
            min={0}
            max={1000}
            step={10}
            value={values.delay}
            onValueChange={onChange.delay}
          >
            <p className="knob-label">Time (ms)</p>
          </Donut>
        );
      case 'bitcrush':
        return (
          <Donut
            diameter={80}
            min={1}
            max={16}
            step={1}
            value={values.bitcrush}
            onValueChange={onChange.bitcrush}
          >
            <p className="knob-label">Bit Depth</p>
          </Donut>
        );
      case 'chorus':
        return (
          <Donut
            diameter={80}
            min={0}
            max={100}
            step={1}
            value={values.chorus}
            onValueChange={onChange.chorus}
          >
            <p className="knob-label">Mix (%)</p>
          </Donut>
        );
    }
  };

  return (
    <div className="effect-slot">
      <button className="remove-effect" onClick={onRemove}>×</button>
      <div className="effect-content">
        {renderEffect()}
      </div>
    </div>
  );
} 