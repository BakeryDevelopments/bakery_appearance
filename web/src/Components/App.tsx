import { SendNuiMessage } from '../Utils/SendNuiMessage';
import { FC, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import classes from './App.module.css';
import { DEFAULT_THEME, Container, Box, List, Title, Button } from '@mantine/core';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import { useClipboard } from '@mantine/hooks';
import { useDebugDataReceiver } from '../Hooks/useDebugDataReceiver';
import { IsRunningInBrowser } from '../Utils/Misc';

import { AppearanceMenu } from './menu';
import { AppearanceNav } from './nav';

interface PlayerInformation { name: string, identifiers: string[] };

SendNuiMessage([{ action: 'setVisibleApp', data: true }]);

export const App: FC = () => {
  const [playerInformation, setPlayerInformation] = useState<PlayerInformation | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Camera overlay state (converted from Svelte)
  const levels = useMemo(() => ['whole', 'head', 'torso', 'legs', 'shoes'] as const, []);
  const [currentLevel, setCurrentLevel] = useState(0);
  const level = levels[currentLevel];
  const isMouseDownRef = useRef(false);

  // Listen for debug data
  useDebugDataReceiver();

  // Scroll wheel listener - only active when UI is visible
  useEffect(() => {
    if (!isVisible || IsRunningInBrowser()) return;

    const handleWheel = (event: WheelEvent) => {

      const target = event.target as HTMLElement;

      if (target.closest('.appearance-scroll')) {
        // Scroll was inside the UI → do NOT trigger NUI scroll callback
        return;
      }
      const direction = event.deltaY > 0 ? 'out' : 'in';

      TriggerNuiCallback<void>('scrollWheel', direction).catch(err => {
        console.error('Failed to trigger scroll wheel callback:', err);
      });
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isVisible]);

  HandleNuiMessage<boolean>('setVisibleApp', (visible) => {
    setIsVisible(visible);
    if (visible) {
      setAnimateIn(true);
      setTimeout(() => setAnimateIn(false), 500); // Match animation duration
    }
    if (!visible) {
      setPlayerInformation(null);
    }
  });

  // Mouse move handler for camera drag (only when mouse is down on overlay)
  useEffect(() => {
    if (!isVisible || IsRunningInBrowser()) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const moveX = e.movementX;
      const moveY = e.movementY;
      const x = moveX / 8;
      const y = moveY / 8;
      TriggerNuiCallback<void>('camMove', { x, y }).catch(() => {});
    };
    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isVisible]);

  const setLevel = useCallback((type: 'up' | 'down') => {
    setCurrentLevel(prev => {
      const next = type === 'down'
        ? (prev + 1) % levels.length
        : (prev - 1 + levels.length) % levels.length;
      const nextLevel = levels[next];
      TriggerNuiCallback<void>('camSection', nextLevel).catch(() => {});
      return next;
    });
  }, [levels]);

  return (
    <>
      <AppearanceMenu animateIn={animateIn} />
      <AppearanceNav animateIn={animateIn} />

      {/* Camera overlay converted from Svelte (simplified visuals) */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vh',
            height: '90vh',
            borderRadius: '50%',
            cursor: 'grab',
            zIndex: 0,
          }}
          onMouseDown={() => { isMouseDownRef.current = true; }}
        >
          {/* Level controls */}
          <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(-50%, -50%)', width: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1vh' }}>
            <button
              onClick={() => setLevel('up')}
              style={{ width: '100%', height: '4vh', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
            >
              ▲
            </button>
            {/* Hexagon with level icon */}
            <div style={{ width: '7vh', height: '7vh', position: 'relative', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <polygon points="25,4 75,4 96,50 75,96 25,96 4,50" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
              </svg>
              {/* Icon in the middle */}
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, padding: '12%', color: 'white' }}>
                {level === 'whole' && (
                  <g fill="currentColor">
                    <circle cx="50" cy="24" r="10" />
                    <rect x="38" y="36" width="24" height="24" rx="4" />
                    <rect x="40" y="62" width="8" height="22" rx="3" />
                    <rect x="52" y="62" width="8" height="22" rx="3" />
                  </g>
                )}
                {level === 'head' && (
                  <g fill="currentColor">
                    <circle cx="50" cy="50" r="20" />
                  </g>
                )}
                {level === 'torso' && (
                  <g fill="currentColor">
                    <rect x="30" y="30" width="40" height="40" rx="6" />
                  </g>
                )}
                {level === 'legs' && (
                  <g fill="currentColor">
                    <rect x="36" y="28" width="10" height="44" rx="4" />
                    <rect x="54" y="28" width="10" height="44" rx="4" />
                  </g>
                )}
                {level === 'shoes' && (
                  <g fill="currentColor">
                    <rect x="30" y="60" width="16" height="12" rx="2" />
                    <rect x="54" y="60" width="16" height="12" rx="2" />
                  </g>
                )}
              </svg>
            </div>
            <button
              onClick={() => setLevel('down')}
              style={{ width: '100%', height: '4vh', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
            >
              ▼
            </button>
          </div>
        </div>
      )}
    </>
  );
};