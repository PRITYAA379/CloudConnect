import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import WorldIntelligence from './components/WorldIntelligence';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <WorldIntelligence />
  </StrictMode>,
);
