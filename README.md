# Audio SNES

A modern web application for manipulating audio with retro-style effects, built with React and Web Audio API.

## Features

- Upload and play audio files
- Real-time audio manipulation with multiple effects:
  - Pitch shifting
  - Tempo/BPM adjustment
  - Reverb
  - Distortion
  - Filter
  - Delay
  - Bit Crusher
  - Chorus
- Modular effect slots with dynamic effect selection
- Interactive controls for fine-tuning effect parameters

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alexkarevoll/audio-snes.git
cd audio-snes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- React
- TypeScript
- Vite
- Web Audio API
- React Dial Knob

## Development

The project is structured with modular components:
- `AudioUpload`: Handles file upload and playback
- `AudioManipulator`: Manages audio processing and effects chain
- `EffectSlot`: Individual effect modules with controls
- `EffectSelector`: Modal for selecting and adding effects

## License

MIT License

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
