import { FC } from 'react';
import { Stack, Text, ColorPicker, Select, Button, Box, Loader } from '@mantine/core';
import { CameraShape } from '../micro/CameraShape';

interface ThemeConfig {
  primaryColor: string;
  inactiveColor: string;
  shape?: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
}

interface ThemeTabProps {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  onSave: () => void;
  isLoading: boolean;
  isReady: boolean;
}

export const ThemeTab: FC<ThemeTabProps> = ({ theme, setTheme, onSave, isLoading, isReady }) => {

  return (
    <Stack spacing="xl">
      <div>
        <Text c="white" fw={600} mb="md" size="sm">
          Theme Colors
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <Text c="dimmed" size="xs" mb="xs">
              Active Tab
            </Text>
            <ColorPicker
              value={theme.primaryColor}
              onChange={(color) => setTheme({ ...theme, primaryColor: color })}
              format="hex"
              fullWidth
              swatchesPerRow={10}
              swatches={[
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                '#ec4899', '#f43f5e',
              ]}
            />
          </div>
          <div>
            <Text c="dimmed" size="xs" mb="xs">
              Inactive Tab
            </Text>
            <ColorPicker
              value={theme.inactiveColor}
              onChange={(color) => setTheme({ ...theme, inactiveColor: color })}
              format="hex"
              fullWidth
              swatchesPerRow={10}
              swatches={['#171717', '#262626', '#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff']}
            />
          </div>
        </div>
      </div>

      <div>
        <Text c="white" fw={600} mb="md" size="sm">
          Camera Shape
        </Text>
        <Select
          value={theme.shape || 'hexagon'}
          onChange={(value) => {
            if (value === 'hexagon' || value === 'circle' || value === 'square' || value === 'diamond' || value === 'pentagon') {
              setTheme({ ...theme, shape: value });
            }
          }}
          data={[
            { value: 'hexagon', label: 'Hexagon' },
            { value: 'circle', label: 'Circle' },
            { value: 'square', label: 'Square' },
            { value: 'diamond', label: 'Diamond' },
            { value: 'pentagon', label: 'Pentagon' },
          ]}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <Text c="dimmed" size="xs" mb="xs" ta="center">
              Active Preview
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
              <div style={{ width: 80, height: 80 }}>
                <CameraShape
                  type={theme.shape || 'hexagon'}
                  stroke={theme.primaryColor}
                  fill={`${theme.primaryColor}33`}
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
          <div>
            <Text c="dimmed" size="xs" mb="xs" ta="center">
              Inactive Preview
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
              <div style={{ width: 80, height: 80 }}>
                <CameraShape
                  type={theme.shape || 'hexagon'}
                  stroke={theme.inactiveColor}
                  fill={`${theme.inactiveColor}33`}
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onSave}
        fullWidth
        size="md"
        styles={{
          root: {
            backgroundColor: theme.primaryColor,
            '&:hover': {
              opacity: 0.9,
              backgroundColor: theme.primaryColor,
            },
          },
        }}
      >
        Save Theme & Shape Settings
      </Button>
    </Stack>
  );
};
