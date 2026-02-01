import { FC, useState, useEffect } from 'react';
import { Modal, Stack, Group, Button, TextInput, Select, Checkbox, NumberInput, Text, Box } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface Zone {
  id?: number;
  type: 'clothing' | 'barber' | 'tattoo' | 'surgeon' | 'outfits';
  coords: { x: number; y: number; z: number; w?: number };
  polyzone?: { x: number; y: number }[];
  showBlip: boolean;
  blipSprite?: number;
  blipColor?: number;
  blipScale?: number;
  blipName?: string;
  enablePed?: boolean;
  job?: string;
  gang?: string;
  name?: string;
}

interface AppearanceSettings {
  useTarget: boolean;
  enablePedsForShops: boolean;
  useRadialMenu: boolean;
  blips: Record<string, { sprite?: number; color?: number; scale?: number; name?: string }>;
}

interface AddZoneModalProps {
  opened: boolean;
  onClose: () => void;
  onSaveZone: (zone: Zone, isUpdate: boolean) => void;
  editingZone?: Zone | null;
  appearanceSettings: AppearanceSettings;
  isCapturing: boolean;
  onStartCapture: (multiPoint: boolean) => void;
  capturedCoords?: { x: number; y: number; z: number; w?: number } | null;
  capturedPolyzonePoints?: { x: number; y: number }[] | null;
  onClearCaptureData?: () => void;
}

export const AddZoneModal: FC<AddZoneModalProps> = ({
  opened,
  onClose,
  onSaveZone,
  editingZone,
  appearanceSettings,
  isCapturing,
  onStartCapture,
  capturedCoords,
  capturedPolyzonePoints,
  onClearCaptureData,
}) => {
  const [zoneType, setZoneType] = useState<Zone['type']>('clothing');
  const [zoneName, setZoneName] = useState('');
  const [coordsInput, setCoordsInput] =  useState<string>('');
  const [polyzonePointsInput, setPolyzonePointsInput] = useState('');
  const [zoneShowBlip, setZoneShowBlip] = useState(true);
  const [zoneBlipSprite, setZoneBlipSprite] = useState<number>(0);
  const [zoneBlipColor, setZoneBlipColor] = useState<number>(0);
  const [zoneBlipScale, setZoneBlipScale] = useState<number>(0.7);
  const [zoneBlipName, setZoneBlipName] = useState('');
  const [zoneEnablePed, setZoneEnablePed] = useState(false);
  const [zoneJob, setZoneJob] = useState('');
  const [zoneGang, setZoneGang] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (capturedPolyzonePoints && capturedPolyzonePoints.length > 0 && !polyzonePointsInput) {
      setPolyzonePointsInput(JSON.stringify(capturedPolyzonePoints));
    }
  }, [capturedPolyzonePoints, polyzonePointsInput]);

  useEffect(() => {
    if (capturedCoords && !coordsInput) {
      const { x, y, z, w } = capturedCoords;
      const string = `${(x ?? 0).toFixed(2)}, ${(y ?? 0).toFixed(2)}, ${(z ?? 0).toFixed(2)}, ${(w ?? 0).toFixed(3)}`;
      setCoordsInput(string);
    }
  }, [capturedCoords, coordsInput]);


  // Handle single point capture for coordinates
  

  const handleClose = () => {
    resetForm();
    onClearCaptureData?.();
    setInitialized(false);
    onClose();
  };

  const resetForm = () => {
    setZoneType('clothing');
    setZoneName('');
    setCoordsInput('');
    setPolyzonePointsInput('');
    setZoneShowBlip(true);
    setZoneBlipSprite(0);
    setZoneBlipColor(0);
    setZoneBlipScale(0.7);
    setZoneBlipName('');
    setZoneEnablePed(false);
    setZoneJob('');
    setZoneGang('');
  };

  const loadZoneData = (zone: Zone) => {
    const defaults = appearanceSettings?.blips?.[zone.type] || {};
    setZoneType(zone.type);
    setZoneName(zone.name || '');
    setCoordsInput(
      `${(zone.coords.x ?? 0).toFixed(2)}, ${(zone.coords.y ?? 0).toFixed(2)}, ${(
        zone.coords.z ?? 0
      ).toFixed(2)}, ${zone.coords.w ?? 0}`
    );
    setPolyzonePointsInput(zone.polyzone ? JSON.stringify(zone.polyzone) : '');
    setZoneShowBlip(zone.showBlip ?? true);
    setZoneBlipSprite(zone.blipSprite ?? defaults.sprite ?? 0);
    setZoneBlipColor(zone.blipColor ?? defaults.color ?? 0);
    setZoneBlipScale(zone.blipScale ?? defaults.scale ?? 0.7);
    setZoneBlipName(zone.blipName ?? defaults.name ?? '');
    setZoneEnablePed(zone.enablePed ?? false);
    setZoneJob(zone.job || '');
    setZoneGang(zone.gang || '');
  };

  useEffect(() => {
    if (!opened) {
      setInitialized(false);
      return;
    }

    if (editingZone) {
      if (!polyzonePointsInput && !coordsInput && !initialized) {
        loadZoneData(editingZone);
      }
      setInitialized(true);
      return;
    }

    // If we already have captured data, don't wipe it
    if ((capturedCoords && !initialized) || (capturedPolyzonePoints && !initialized)) {
      setInitialized(true);
      return;
    }

    if (!initialized) {
      resetForm();
      const defaults = appearanceSettings?.blips?.['clothing'] || {};
      setZoneBlipSprite(defaults.sprite ?? 0);
      setZoneBlipColor(defaults.color ?? 0);
      setZoneBlipScale(defaults.scale ?? 0.7);
      setZoneBlipName(defaults.name ?? '');
      setInitialized(true);
    }
  }, [opened, editingZone, initialized, appearanceSettings]);

  // When zone type changes on a new zone, apply blip defaults for that type
  useEffect(() => {
    if (!opened || editingZone) return;
    const defaults = appearanceSettings?.blips?.[zoneType] || {};
    setZoneBlipSprite(defaults.sprite ?? 0);
    setZoneBlipColor(defaults.color ?? 0);
    setZoneBlipScale(defaults.scale ?? 0.7);
    setZoneBlipName(defaults.name ?? '');
  }, [zoneType, opened, editingZone, appearanceSettings]);

  const handleSave = () => {
    // Parse coords
    const parts = coordsInput.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length < 3 || parts.slice(0, 3).some(isNaN)) {
      return;
    }

    const coords = { x: parts[0], y: parts[1], z: parts[2], w: parts[3] || 0 };

    // Check if coords are all zero
    if (coords.x === 0 && coords.y === 0 && coords.z === 0) {
      return;
    }

    let polyzone = undefined;
    if (polyzonePointsInput.trim()) {
      try {
        polyzone = JSON.parse(polyzonePointsInput);
      } catch (e) {
        return;
      }
    }

    const zoneData: Zone = {
      id: editingZone?.id,
      type: zoneType,
      coords,
      polyzone,
      showBlip: zoneShowBlip,
      blipSprite: zoneBlipSprite,
      blipColor: zoneBlipColor,
      blipScale: zoneBlipScale,
      blipName: zoneBlipName,
      enablePed: zoneEnablePed,
      job: zoneJob || undefined,
      gang: zoneGang || undefined,
      name: zoneName || undefined,
    };

    TriggerNuiCallback(editingZone ? 'updateZone' : 'addZone', zoneData).then(() => {
      onSaveZone(zoneData, !!editingZone);
      handleClose();
    });
  };

  const isButtonDisabled = () => {
    if (!coordsInput) return true;
    const parts = coordsInput.split(',').slice(0, 3);
    return parts.every((p) => {
      const n = parseFloat(p.trim());
      return n === 0;
    });
  };

  if (!opened) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={editingZone ? 'Edit Zone' : 'Add Zone'}
      centered
      zIndex={10000}
    >
      <Stack spacing="md">
        <Select
          label="Zone Type"
          value={zoneType}
          onChange={(value) => {
            setZoneType((value as Zone['type']) || 'clothing');
          }}
          data={[
            { value: 'clothing', label: 'Clothing' },
            { value: 'barber', label: 'Barber' },
            { value: 'tattoo', label: 'Tattoo' },
            { value: 'surgeon', label: 'Surgeon' },
            { value: 'outfits', label: 'Outfits' },
          ]}
        />
        <TextInput
          label="Zone Name (Optional)"
          placeholder="Downtown Clothing Store"
          value={zoneName}
          onChange={(e) => {
            setZoneName(e.target.value);
          }}
        />
        <div>
          <Group spacing="xs" align="flex-end">
            <TextInput
              label="Coordinates (x, y, z, heading)"
              placeholder="123.45, 234.56, 345.67, 90.0"
              description="Get coords in-game and paste here"
              style={{ flex: 1 }}
              value={coordsInput}
              onChange={(e) => {
                setCoordsInput(e.target.value);
              }}
            />
            <Button
              variant="light"
              onClick={() => {
                onStartCapture(false);
              }}
            >
              <IconDownload stroke={2} />
            </Button>
          </Group>
        </div>

        <div>
          <Group spacing="xs" align="flex-end">
            <TextInput
              label="Polyzone Points (JSON)"
              placeholder='[{"x":1,"y":2},{"x":3,"y":4}]'
              description="Optional: Press E to add points, ESC to finish"
              style={{ flex: 1 }}
              value={polyzonePointsInput}
              onChange={(e) => setPolyzonePointsInput(e.target.value)}
              disabled={zoneEnablePed}
            />
            <Button
              variant="light"
              onClick={() => {
                onStartCapture(true);
              }}
              disabled={zoneEnablePed}
            >
              <IconDownload stroke={2} />
            </Button>
          </Group>
          {zoneEnablePed && <Text c="dimmed" size="xs" mt={4}>
            Polyzone disabled when using ped
          </Text>}
        </div>
        <Checkbox
          label="Enable Ped at Location"
          description="Spawn an NPC at this location (disables polyzone)"
          checked={zoneEnablePed}
          onChange={(e) => {
            setZoneEnablePed(e.currentTarget.checked);
            if (e.currentTarget.checked) {
              setPolyzonePointsInput('');
            }
          }}
          styles={{
            label: { color: '#fff', fontSize: '0.9rem' },
            description: { color: '#888', fontSize: '0.8rem', marginTop: 4 },
          }}
        />
        <Checkbox
          label="Show Blip"
          description="Display this zone on the map"
          checked={zoneShowBlip}
          onChange={(e) => {
            setZoneShowBlip(e.currentTarget.checked);
          }}
          styles={{
            label: { color: '#fff', fontSize: '0.9rem' },
            description: { color: '#888', fontSize: '0.8rem', marginTop: 4 },
          }}
        />
        {zoneShowBlip && (
          <Stack spacing="sm" pl="md">
            <NumberInput
              label="Blip Sprite"
              description="Icon ID for the blip"
              value={zoneBlipSprite}
              onChange={(val) => {
                setZoneBlipSprite(val as number);
              }}
              styles={{
                label: { color: '#fff', fontSize: '0.85rem' },
                description: { color: '#888', fontSize: '0.75rem' },
              }}
            />
            <NumberInput
              label="Blip Color"
              description="Color ID for the blip"
              value={zoneBlipColor}
              onChange={(val) => {
                setZoneBlipColor(val as number);
              }}
              styles={{
                label: { color: '#fff', fontSize: '0.85rem' },
                description: { color: '#888', fontSize: '0.75rem' },
              }}
            />
            <NumberInput
              label="Blip Scale"
              description="Size of the blip (0.0 - 2.0)"
              value={zoneBlipScale}
              step={0.1}
              precision={1}
              min={0}
              max={2}
              onChange={(val) => {
                setZoneBlipScale(val as number);
              }}
              styles={{
                label: { color: '#fff', fontSize: '0.85rem' },
                description: { color: '#888', fontSize: '0.75rem' },
              }}
            />
            <TextInput
              label="Blip Name"
              placeholder="Custom blip name"
              value={zoneBlipName}
              onChange={(e) => {
                setZoneBlipName(e.target.value);
              }}
              styles={{
                label: { color: '#fff', fontSize: '0.85rem' },
              }}
            />
          </Stack>
        )}
        <TextInput
          label="Job (Optional)"
          placeholder="police"
          description="Restrict zone to specific job"
          value={zoneJob}
          onChange={(e) => {
            setZoneJob(e.target.value);
          }}
        />
        <TextInput
          label="Gang (Optional)"
          placeholder="ballas"
          description="Restrict zone to specific gang"
          value={zoneGang}
          onChange={(e) => {
            setZoneGang(e.target.value);
          }}
        />
        <Group position="right" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isButtonDisabled()}>
            {editingZone ? 'Update' : 'Add'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
