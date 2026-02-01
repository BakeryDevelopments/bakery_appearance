import { FC, useCallback, memo, lazy, Suspense, useState, useEffect } from 'react';
import { Stack, Group, Checkbox, Divider, NumberInput, Box, Text, Button, Loader } from '@mantine/core';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

const InitialClothesTab = lazy(() => import('./InitialClothesTab').then(mod => ({ default: mod.InitialClothesTab })));

interface ClothingConfig {
  model: string;
  components: Array<{ drawable: number; texture: number }>;
  props: Array<{ drawable: number; texture: number }>;
  hair: { color: number; highlight: number; style: number; texture: number };
}

interface AppearanceSettings {
  useTarget: boolean;
  enablePedsForShops: boolean;
  useRadialMenu: boolean;
  chargePerTattoo: boolean;
  blips: Record<string, { sprite?: number; color?: number; scale?: number; name?: string }>;
  prices: {
    clothing?: number;
    barber?: number;
    tattoo?: number;
    surgeon?: number;
  };
}

// Memoized component for blip configuration
const BlipConfigBox = memo(({ 
  blipKey, 
  blip, 
  onBlipChange 
}: { 
  blipKey: string; 
  blip: any; 
  onBlipChange: (key: string, field: string, value: any) => void;
}) => {
  const handleSpriteChange = useCallback((val: number) => {
    onBlipChange(blipKey, 'sprite', val);
  }, [blipKey, onBlipChange]);

  const handleColorChange = useCallback((val: number) => {
    onBlipChange(blipKey, 'color', val);
  }, [blipKey, onBlipChange]);

  const handleScaleChange = useCallback((val: number) => {
    onBlipChange(blipKey, 'scale', val);
  }, [blipKey, onBlipChange]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onBlipChange(blipKey, 'name', e.target.value);
  }, [blipKey, onBlipChange]);

  return (
    <Box
      p="xs"
      style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, flex: 1, minWidth: 160 }}
    >
      <Text c="white" size="xs" fw={600} tt="capitalize" mb="xs">
        {blipKey}
      </Text>
      <Stack spacing={4}>
        <NumberInput
          label="Sprite"
          value={blip.sprite ?? 0}
          onChange={handleSpriteChange}
          size="xs"
          hideControls
        />
        <NumberInput
          label="Color"
          value={blip.color ?? 0}
          onChange={handleColorChange}
          size="xs"
          hideControls
        />
        <NumberInput
          label="Scale"
          value={blip.scale ?? 0.7}
          step={0.1}
          precision={1}
          min={0}
          max={2}
          onChange={handleScaleChange}
          size="xs"
          hideControls
        />
        <input
          type="text"
          placeholder="Name"
          value={blip.name || ''}
          onChange={handleNameChange}
          style={{
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: 'white',
            fontSize: '12px',
          }}
        />
      </Stack>
    </Box>
  );
});

BlipConfigBox.displayName = 'BlipConfigBox';

interface SettingsTabProps {
  appearanceSettings: AppearanceSettings;
  setAppearanceSettings: (settings: AppearanceSettings) => void;
  initialClothes: {
    male: ClothingConfig;
    female: ClothingConfig;
  };
  setInitialClothes: (clothes: { male: ClothingConfig; female: ClothingConfig }) => void;
  locale: Record<string, string>;
  isLoading?: boolean;
}

export const SettingsTab: FC<SettingsTabProps> = ({
  appearanceSettings,
  setAppearanceSettings,
  initialClothes,
  setInitialClothes,
  locale,
  isLoading = false,
}) => {
  // Local state to batch updates
  const [localSettings, setLocalSettings] = useState(appearanceSettings);
  const [localClothes, setLocalClothes] = useState(initialClothes);

  // Sync with parent when props change externally
  useEffect(() => {
    setLocalSettings(appearanceSettings);
  }, [appearanceSettings]);

  useEffect(() => {
    setLocalClothes(initialClothes);
  }, [initialClothes]);

  const handleSaveSettings = useCallback(() => {
    // Update parent state
    setAppearanceSettings(localSettings);
    setInitialClothes(localClothes);

    // Send to backend
    TriggerNuiCallback('saveAppearanceSettings', {
      ...localSettings,
      initialClothes: localClothes,
    }).then(() => {
      // Optional: Show success message or handle response
    }).catch((error) => {
      console.error('Failed to save appearance settings:', error);
    });
  }, [localSettings, localClothes, setAppearanceSettings, setInitialClothes]);

  const handleUseTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings({ ...localSettings, useTarget: e.currentTarget.checked });
  }, [localSettings]);

  const handleEnablePedsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings({ ...localSettings, enablePedsForShops: e.currentTarget.checked });
  }, [localSettings]);

  const handleUseRadialMenuChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings({ ...localSettings, useRadialMenu: e.currentTarget.checked });
  }, [localSettings]);

  const handleChargePerTattooChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings({ ...localSettings, chargePerTattoo: e.currentTarget.checked });
  }, [localSettings]);

  const handlePriceChange = useCallback((key: 'clothing' | 'barber' | 'tattoo' | 'surgeon', val: number) => {
    setLocalSettings({
      ...localSettings,
      prices: {
        ...localSettings.prices,
        [key]: val,
      },
    });
  }, [localSettings]);

  const handleBlipChange = useCallback((key: string, field: string, value: any) => {
    setLocalSettings({
      ...localSettings,
      blips: {
        ...localSettings.blips,
        [key]: { 
          ...localSettings.blips?.[key], 
          [field]: value 
        },
      },
    });
  }, [localSettings]);

  return (
    <Stack spacing="md">
      <Group grow>
        <Checkbox
          label={locale.ADMIN_USE_TARGET || 'Use ox_target for peds'}
          checked={localSettings.useTarget}
          onChange={handleUseTargetChange}
        />
        <Checkbox
          label={locale.ADMIN_ENABLE_PEDS || 'Enable peds for shops'}
          checked={localSettings.enablePedsForShops}
          onChange={handleEnablePedsChange}
        />
        <Checkbox
          label={locale.ADMIN_USE_RADIAL_MENU || 'Use radial menu for zones'}
          checked={localSettings.useRadialMenu}
          onChange={handleUseRadialMenuChange}
        />
        <Checkbox
          label={locale.ADMIN_CHARGE_PER_TATTOO || 'Charge per tattoo'}
          checked={localSettings.chargePerTattoo}
          onChange={handleChargePerTattooChange}
        />
      </Group>

      <Divider label={locale.ADMIN_PRICES || 'Prices'} labelPosition="left" />
      <Group grow spacing="xs">
        {(['clothing', 'barber', 'tattoo', 'surgeon'] as const).map((key) => (
          <NumberInput
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={localSettings.prices?.[key] ?? 0}
            min={0}
            onChange={(val) => handlePriceChange(key, val as number)}
            size="xs"
          />
        ))}
      </Group>

      <Divider label={locale.ADMIN_BLIP_DEFAULTS || 'Blip Defaults'} labelPosition="left" />
      <Group spacing="xs" align="flex-start">
        {['clothing', 'barber', 'tattoo', 'surgeon', 'outfits'].map((key) => (
          <BlipConfigBox 
            key={key}
            blipKey={key}
            blip={localSettings.blips?.[key] || {}}
            onBlipChange={handleBlipChange}
          />
        ))}
      </Group>

      <Divider label={locale.ADMIN_INITIAL_CLOTHES_TITLE || 'Initial Player Clothes'} labelPosition="left" />
      <Suspense
        fallback={
          <Box style={{ padding: '2rem', textAlign: 'center' }}>
            <Loader size="sm" />
            <Text c="dimmed" mt="sm" size="xs">Loading initial clothes...</Text>
          </Box>
        }
      >
        <InitialClothesTab
          initialClothes={localClothes}
          setInitialClothes={setLocalClothes}
          locale={locale}
        />
      </Suspense>

      <Group position="right">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {locale.ADMIN_SAVE_SETTINGS || 'Save Settings'}
        </Button>
      </Group>
    </Stack>
  );
};
