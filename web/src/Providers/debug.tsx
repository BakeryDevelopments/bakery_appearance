import { FC, useState, useEffect } from 'react';
import { Button, TextInput, Checkbox, Slider, Stack, Box, Text, Paper } from '@mantine/core';
import { DebugImage } from '../Components/DebugImage';
import { InitialiseDebugSenders, InitialiseDebugReceivers } from '../Utils/debug/init';
import SendDebuggers from '../Utils/debug/senders';
import { DebugAction } from '../types/debug';
import { App } from '../Components/App';

export const DebugProvider: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionValues, setActionValues] = useState<Record<string, any>>({});

  useEffect(() => {
    InitialiseDebugSenders();
    InitialiseDebugReceivers();

    const initialValues: Record<string, any> = {};
    SendDebuggers.forEach((section, sectionIndex) => {
      console.log('Section:', section.label);
      section.actions.forEach((action, actionIndex) => {
        const key = `${sectionIndex}-${actionIndex}`;
        initialValues[key] = action.value ?? '';
      });
    });
    setActionValues(initialValues);
  }, []);

  // // Initialize action values
  // useEffect(() => {

  // }, []);

  const handleActionValue = (key: string, value: any) => {
    setActionValues(prev => ({ ...prev, [key]: value }));
  };

  const renderAction = (action: DebugAction, sectionIndex: number, actionIndex: number) => {
    const key = `${sectionIndex}-${actionIndex}`;
    const value = actionValues[key];

    if (action.type === 'text') {
      return (
        <Paper key={key} p="sm" withBorder>
          <Stack spacing="xs">
            <Text size="sm">{action.label}</Text>
            <TextInput
              value={value || ''}
              onChange={(e) => handleActionValue(key, e.currentTarget.value)}
            />
            <Button
              size="xs"
              onClick={() => action.action(value)}
            >
              Apply
            </Button>
          </Stack>
        </Paper>
      );
    }

    if (action.type === 'checkbox') {
      return (
        <Paper key={key} p="sm" withBorder>
          <Checkbox
            label={action.label}
            checked={value || false}
            onChange={(e) => {
              const newValue = e.currentTarget.checked;
              handleActionValue(key, newValue);
              action.action(newValue);
            }}
          />
        </Paper>
      );
    }

    if (action.type === 'slider') {
      return (
        <Paper key={key} p="sm" withBorder>
          <Stack spacing="xs">
            <Text size="sm">{action.label}</Text>
            <Slider
              value={value || action.min || 0}
              min={action.min || 0}
              max={action.max || 100}
              step={action.step || 1}
              onChange={(newValue) => {
                handleActionValue(key, newValue);
                action.action(newValue);
              }}
            />
          </Stack>
        </Paper>
      );
    }

    // Default: button
    return (
      <Button
        key={key}
        fullWidth
        onClick={() => action.action()}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Box style={{ width: 'fit-content', height: 'fit-content', zIndex: 9999999 }}>
      <Button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ zIndex: 9999999 }}
      >
        Debug
      </Button>

      {menuOpen && (
        <Paper
          p="sm"
          shadow="md"
          style={{
            maxWidth: '25vw',
            height: '100%',
            zIndex: 9999999,
          }}
        >
          <Stack spacing="md">
            {SendDebuggers.map((section, sectionIndex) => (
              <Box
                key={sectionIndex}
                style={{
                  borderLeft: '2px solid var(--mantine-color-blue-6)',
                  paddingLeft: 'var(--mantine-spacing-sm)',
                  zIndex: 9999999
                }}
              >
                <Text fw={500} mb="xs">
                  {section.label}
                </Text>

                <Stack spacing="xs">
                  {section.actions.map((action, actionIndex) =>
                    renderAction(action, sectionIndex, actionIndex)
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      <Box
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
        }}
        className="dev-image"
      >
        <DebugImage />
      </Box>

      {/* Render the actual App */}
      <App />
    </Box>
  );
};
