import { FC } from 'react';
import { Stack, Group, Text, Button, Checkbox, Box, NumberInput, TextInput } from '@mantine/core';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface ShopConfig {
  id?: number;
  type: 'clothing' | 'barber' | 'tattoo' | 'surgeon';
  blipShow: boolean;
  blipSprite: number;
  blipColor: number;
  blipScale: number;
  blipName: string;
  cost: number;
}

interface ShopSettings {
  enablePedsForClothingRooms: boolean;
  enablePedsForPlayerOutfitRooms: boolean;
}

interface ShopsTabProps {
  shopSettings: ShopSettings;
  setShopSettings: (settings: ShopSettings) => void;
  shopConfigs: ShopConfig[];
  setShopConfigs: (configs: ShopConfig[]) => void;
  onSave?: () => void;
  locale: { [key: string]: string };
}

export const ShopsTab: FC<ShopsTabProps> = ({
  shopSettings,
  setShopSettings,
  shopConfigs,
  setShopConfigs,
  onSave,
  locale,
}) => {
  const handleSave = () => {
    TriggerNuiCallback('saveShopSettings', { settings: shopSettings, configs: shopConfigs }).then(() => {
      if (onSave) onSave();
    });
  };
  return (
    <Stack spacing="xl">
      <div>
        <Text c="white" fw={600} mb="md" size="sm">
          Global Shop Settings
        </Text>
        <Stack spacing="md">
          <Checkbox
            label="Enable Peds for Shops"
            description="Allow NPCs to appear at shop locations"
            checked={shopSettings.enablePedsForShops}
            onChange={(e) => setShopSettings({ ...shopSettings, enablePedsForShops: e.currentTarget.checked })}
            styles={{
              label: { color: '#fff', fontSize: '0.9rem' },
              description: { color: '#888', fontSize: '0.8rem', marginTop: 4 }
            }}
          />
          <Checkbox
            label="Enable Peds for Clothing Rooms"
            description="Allow NPCs in clothing change rooms"
            checked={shopSettings.enablePedsForClothingRooms}
            onChange={(e) => setShopSettings({ ...shopSettings, enablePedsForClothingRooms: e.currentTarget.checked })}
            styles={{
              label: { color: '#fff', fontSize: '0.9rem' },
              description: { color: '#888', fontSize: '0.8rem', marginTop: 4 }
            }}
          />
          <Checkbox
            label="Enable Peds for Player Outfit Rooms"
            description="Allow NPCs where players access their saved outfits"
            checked={shopSettings.enablePedsForPlayerOutfitRooms}
            onChange={(e) => setShopSettings({ ...shopSettings, enablePedsForPlayerOutfitRooms: e.currentTarget.checked })}
            styles={{
              label: { color: '#fff', fontSize: '0.9rem' },
              description: { color: '#888', fontSize: '0.8rem', marginTop: 4 }
            }}
          />
        </Stack>
      </div>

      <div>
        <Group position="apart" mb="md">
          <Text c="white" fw={600} size="sm">
            Shop Configurations
          </Text>
          <Button 
            size="sm"
            onClick={handleSave}
          >
            Save All Shop Settings
          </Button>
        </Group>

        <Stack spacing="md">
          {shopConfigs.map((config, idx) => (
            <Box key={idx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Text c="white" fw={600} mb="sm" tt="capitalize">
                {config.type} Shop
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Checkbox
                  label="Show Blip"
                  checked={config.blipShow}
                  onChange={(e) => {
                    const updated = [...shopConfigs];
                    updated[idx].blipShow = e.currentTarget.checked;
                    setShopConfigs(updated);
                  }}
                  styles={{ label: { color: '#fff' } }}
                />
                <NumberInput
                  label="Cost"
                  value={config.cost}
                  onChange={(val) => {
                    const updated = [...shopConfigs];
                    updated[idx].cost = val as number;
                    setShopConfigs(updated);
                  }}
                  min={0}
                />
                <NumberInput
                  label="Blip Sprite"
                  value={config.blipSprite}
                  onChange={(val) => {
                    const updated = [...shopConfigs];
                    updated[idx].blipSprite = val as number;
                    setShopConfigs(updated);
                  }}
                  min={0}
                />
                <NumberInput
                  label="Blip Color"
                  value={config.blipColor}
                  onChange={(val) => {
                    const updated = [...shopConfigs];
                    updated[idx].blipColor = val as number;
                    setShopConfigs(updated);
                  }}
                  min={0}
                />
                <NumberInput
                  label="Blip Scale"
                  value={config.blipScale}
                  onChange={(val) => {
                    const updated = [...shopConfigs];
                    updated[idx].blipScale = val as number;
                    setShopConfigs(updated);
                  }}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  precision={2}
                />
                <TextInput
                  label="Blip Name"
                  value={config.blipName}
                  onChange={(e) => {
                    const updated = [...shopConfigs];
                    updated[idx].blipName = e.target.value;
                    setShopConfigs(updated);
                  }}
                />
              </div>
            </Box>
          ))}
        </Stack>
      </div>
    </Stack>
  );
};
