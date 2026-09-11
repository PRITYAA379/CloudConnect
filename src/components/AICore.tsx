import React from 'react';
import './AICore.css';

type CoreState = 'idle' | 'thinking' | 'voice' | 'coding' | 'error';

interface AICoreProps {
  state?: CoreState;
  onClick?: () => void;
}

const labels: Record<CoreState, string> = {
  idle: 'READY',
  thinking: 'THINKING',
  voice: 'LISTENING',
  coding: 'BUILDING',
  error: 'ERROR',
};

export function AICore({ state = 'idle', onClick }: AICoreProps) {
  return (
    <button
      type="button"
      className={`cc-ai-core cc-ai-core--${state}`}
      onClick={onClick}
      aria-label={`CloudConnect AI Core ${labels[state]}`}
    >
      <span className="cc-ai-core__orbit cc-ai-core__orbit--one" />
      <span className="cc-ai-core__orbit cc-ai-core__orbit--two" />
      <span className="cc-ai-core__orbit cc-ai-core__orbit--three" />
      <span className="cc-ai-core__halo" />
      <span className="cc-ai-core__sphere">
        <span className="cc-ai-core__pulse" />
        <span className="cc-ai-core__dot" />
      </span>
      <span className="cc-ai-core__label">CLOUDCONNECT</span>
      <span className="cc-ai-core__state">{labels[state]}</span>
    </button>
  );
}

export default AICore;
