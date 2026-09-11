import React from 'react';

type CloudConnect3DCoreProps = {
  state?: 'idle' | 'thinking' | 'voice' | 'coding' | 'error';
};

const labels = {
  idle: 'READY',
  thinking: 'THINKING',
  voice: 'LISTENING',
  coding: 'BUILDING',
  error: 'SIGNAL ERROR',
} as const;

export default function CloudConnect3DCore({ state = 'idle' }: CloudConnect3DCoreProps) {
  return (
    <div className={`cc3d-stage cc3d-${state}`} aria-label={`CloudConnect ${labels[state]}`}>
      <div className="cc3d-grid" />
      <div className="cc3d-orbit cc3d-orbit-a" />
      <div className="cc3d-orbit cc3d-orbit-b" />
      <div className="cc3d-orbit cc3d-orbit-c" />
      <div className="cc3d-core">
        <div className="cc3d-core-inner">
          <span>CC</span>
        </div>
      </div>
      <div className="cc3d-node cc3d-node-1" />
      <div className="cc3d-node cc3d-node-2" />
      <div className="cc3d-node cc3d-node-3" />
      <div className="cc3d-node cc3d-node-4" />
      <div className="cc3d-status">{labels[state]}</div>
      <div className="cc3d-caption">WORLD INTELLIGENCE ENGINE</div>
    </div>
  );
}
