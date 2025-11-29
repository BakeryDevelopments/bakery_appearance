import { SendNuiMessage } from '../Utils/SendNuiMessage';
import { FC, useState, useEffect } from 'react';
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
    if (!visible) {
      setPlayerInformation(null);
    }
  });

  return (
    <>
      <AppearanceMenu />
      <AppearanceNav />
    </>
  );
};