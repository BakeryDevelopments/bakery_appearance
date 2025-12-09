import { FC, useEffect, useState } from 'react';
import { Tabs, ColorPicker, Button, Stack, Group, Text, TextInput, Select, ActionIcon, Modal, Checkbox, Accordion, Badge, Box, NumberInput } from '@mantine/core';
import { IconPalette, IconLock, IconPlus, IconTrash, IconChevronDown, IconUser, IconShoppingCart, IconMapPin, IconHanger, IconDownload, IconFeather } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import { CameraShape } from './micro/CameraShape';
import type { TZoneTattoo } from '../types/appearance';

interface ThemeConfig {
  primaryColor: string; // Active tab color
  inactiveColor: string; // Inactive tab color
  shape?: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon'; // Camera shape
}

interface ClothingRestriction {
  id: string;
  group?: string;  // New unified field replacing job/gang
  job?: string;    // Legacy support
  gang?: string;   // Legacy support
  identifier?: string;
  gender: 'male' | 'female';
  type?: 'model' | 'clothing';
  part?: 'model' | 'drawable' | 'prop';
  category?: string;
  itemId: number;
  name?: string;
  texturesAll?: boolean;
  textures?: number[];
}

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
  enablePedsForShops: boolean;
  enablePedsForClothingRooms: boolean;
  enablePedsForPlayerOutfitRooms: boolean;
}

interface Zone {
  id?: number;
  type: 'clothing' | 'barber' | 'tattoo' | 'surgeon';
  coords: { x: number; y: number; z: number; heading?: number };
  polyzone?: { x: number; y: number }[];
  showBlip: boolean;
  job?: string;
  gang?: string;
  name?: string;
}

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any; // Appearance data JSON
}

type PartType = 'model' | 'drawable' | 'prop';

export const AdminMenu: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [captureActive, setCaptureActive] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
    shape: 'hexagon',
  });
  const [restrictions, setRestrictions] = useState<ClothingRestriction[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRestriction, setNewRestriction] = useState<Partial<ClothingRestriction>>({
    gender: 'male',
    type: 'clothing',
  });

  const [texturesAll, setTexturesAll] = useState<boolean>(true);
  const [texturesInput, setTexturesInput] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [lockedModelsSaved, setLockedModelsSaved] = useState<string[]>([]);
  const [addModelModalOpen, setAddModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState<string>('');

  // Shop Options State
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    enablePedsForShops: true,
    enablePedsForClothingRooms: true,
    enablePedsForPlayerOutfitRooms: true,
  });
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>([
    { type: 'clothing', blipShow: true, blipSprite: 366, blipColor: 47, blipScale: 0.7, blipName: 'Clothing Store', cost: 0 },
    { type: 'barber', blipShow: true, blipSprite: 71, blipColor: 47, blipScale: 0.7, blipName: 'Barber Shop', cost: 0 },
    { type: 'tattoo', blipShow: true, blipSprite: 75, blipColor: 47, blipScale: 0.7, blipName: 'Tattoo Shop', cost: 0 },
    { type: 'surgeon', blipShow: true, blipSprite: 102, blipColor: 47, blipScale: 0.7, blipName: 'Surgeon', cost: 0 },
  ]);

  // Zones State
  const [zones, setZones] = useState<Zone[]>([]);
  const [addZoneModalOpen, setAddZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [polyzonePointsInput, setPolyzonePointsInput] = useState<string>('');
  const [coordsInput, setCoordsInput] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState<Zone['type']>('clothing');

  // Outfits State
  const [outfits, setOutfits] = useState<JobOutfit[]>([]);
  const [addOutfitModalOpen, setAddOutfitModalOpen] = useState(false);
  const [newOutfit, setNewOutfit] = useState<Partial<JobOutfit>>({ gender: 'male' });

  // Tattoos State
  const [tattoos, setTattoos] = useState<TZoneTattoo[]>([]);

  const categoryOptionsByPart: Record<PartType, { value: string; label: string }[]> = {
    model: [{ value: 'model', label: 'Model' }],
    drawable: [
      { value: 'masks', label: 'Masks' },
      { value: 'shirts', label: 'Undershirts' },
      { value: 'jackets', label: 'Tops/Jackets' },
      { value: 'vest', label: 'Vest' },
      { value: 'legs', label: 'Legs' },
      { value: 'shoes', label: 'Shoes' },
    ],
    prop: [
      { value: 'hats', label: 'Hats' },
      { value: 'glasses', label: 'Glasses' },
    ],
  };

  HandleNuiMessage<boolean>('setVisibleAdminMenu', (visible) => {
    setIsVisible(visible);
  });

  HandleNuiMessage<ClothingRestriction[]>('setRestrictions', (data) => {
    setRestrictions(data || []);
  });

  HandleNuiMessage<string[]>('setModels', (data) => {
    setModels(data || []);
  });

  HandleNuiMessage<string[]>('setLockedModels', (data) => {
    setLockedModelsSaved(data || []);
  });

  HandleNuiMessage<ShopSettings>('setShopSettings', (data) => {
    setShopSettings(data);
  });

  HandleNuiMessage<ShopConfig[]>('setShopConfigs', (data) => {
    setShopConfigs(data);
  });

  HandleNuiMessage<Zone[]>('setZones', (data) => {
    setZones(data);
  });

  HandleNuiMessage<TZoneTattoo[]>('setTattoos', (data) => {
    setTattoos(data || []);
  });

  HandleNuiMessage<JobOutfit[]>('setOutfits', (data) => {
    setOutfits(data || []);
  });


  // Keep UI hidden while capture is active; show again when it ends
  HandleNuiMessage<{ active: boolean }>('zoneCaptureActive', (data) => {
    if (!data) return;
    const active = !!data.active;
    setCaptureActive(active);
    if (active) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  HandleNuiMessage<{ points: { x: number; y: number }[] }>('polyzonePointsCaptured', (data) => {
    if (!data || !data.points) return;
    // Multi-point capture finished, restore UI and set points
    setCaptureActive(false);
    setIsVisible(true);
    if (data.points && data.points.length > 0) {
      setPolyzonePointsInput(JSON.stringify(data.points));
    }
  });

  HandleNuiMessage<{ coords: { x: number; y: number; z: number } }>('singlePointCaptured', (data) => {
    if (!data || !data.coords) return;
    // Single-point capture finished, restore UI and set coord
    setCaptureActive(false);
    setIsVisible(true);
    if (editingZone) {
      const heading = (editingZone.coords?.heading ?? 0);
      setEditingZone({ ...editingZone, coords: { x: data.coords.x, y: data.coords.y, z: data.coords.z, heading } });
      setCoordsInput(`${data.coords.x.toFixed(2)}, ${data.coords.y.toFixed(2)}, ${data.coords.z.toFixed(2)}, ${heading}`);
    }
  });

  // Keep coords input in sync when editingZone changes (e.g., opening modal or selecting a zone)
  useEffect(() => {
    if (editingZone && editingZone.coords) {
      const c = editingZone.coords;
      setCoordsInput(`${(c.x ?? 0).toFixed(2)}, ${(c.y ?? 0).toFixed(2)}, ${(c.z ?? 0).toFixed(2)}, ${c.heading ?? 0}`);
    } else {
      setCoordsInput('');
    }
  }, [editingZone]);

  useEffect(() => {}, [isVisible]);

  const handleSaveThemeAndShape = () => {
    TriggerNuiCallback('saveTheme', theme).then(() => {

    });
  };

  const handleAddRestriction = () => {
    if (!newRestriction.itemId || (!newRestriction.job && !newRestriction.gang)) return;

    const part: PartType = (newRestriction.part as PartType) || 'drawable';
    const category = part === 'model' ? 'model' : newRestriction.category;
    const textures = texturesAll
      ? undefined
      : texturesInput
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));

    const restriction: ClothingRestriction = {
      id: `${Date.now()}-${Math.random()}`,
      job: newRestriction.job,
      gang: newRestriction.gang,
      identifier: newRestriction.identifier,
      gender: newRestriction.gender || 'male',
      type: (part === 'model' ? 'model' : 'clothing'),
      part,
      category,
      itemId: newRestriction.itemId!,
      texturesAll: part === 'model' ? false : texturesAll,
      textures: part === 'model' ? undefined : textures,
    };

    TriggerNuiCallback('addRestriction', restriction).then(() => {
      setRestrictions([...restrictions, restriction]);
      setAddModalOpen(false);
      setNewRestriction({ gender: 'male' });
      setTexturesAll(true);
      setTexturesInput('');
    });
  };

  const handleDeleteRestriction = (id: string) => {
    TriggerNuiCallback('deleteRestriction', id).then(() => {
      setRestrictions(restrictions.filter((r) => r.id !== id));
    });
  };

  const handleClose = () => {
    TriggerNuiCallback('closeAdminMenu', {});
    setIsVisible(false);
  };

  const normalizeTattooData = (data: TZoneTattoo[]) =>
    (data || []).map((zone, zoneIndex) => ({
      ...zone,
      zoneIndex,
      dlcs: (zone.dlcs || []).map((dlc, dlcIndex) => ({
        ...dlc,
        dlcIndex,
        tattoos: (dlc.tattoos || []).map((tattoo) => ({
          ...tattoo,
          opacity: typeof tattoo.opacity === 'number' ? tattoo.opacity : 1,
          dlc: dlc.label,
        })),
      })),
    }));

  const updateTattoos = (updater: (prev: TZoneTattoo[]) => TZoneTattoo[]) => {
    setTattoos((prev) => normalizeTattooData(updater(prev || [])));
  };

  const handleAddZone = () => {
    updateTattoos((prev) => [
      ...prev,
      { label: `Zone ${prev.length + 1}`, zone: `zone_${prev.length + 1}`, zoneIndex: prev.length, dlcs: [] },
    ]);
  };

  const handleUpdateZoneLabel = (index: number, field: 'label' | 'zone', value: string) => {
    updateTattoos((prev) => prev.map((zone, idx) => (idx === index ? { ...zone, [field]: value } : zone)));
  };

  const handleDeleteZone = (index: number) => {
    updateTattoos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddDlc = (zoneIndex: number) => {
    updateTattoos((prev) =>
      prev.map((zone, idx) =>
        idx === zoneIndex
          ? {
              ...zone,
              dlcs: [
                ...(zone.dlcs || []),
                { label: `dlc_${(zone.dlcs?.length || 0) + 1}`, dlcIndex: zone.dlcs?.length || 0, tattoos: [] },
              ],
            }
          : zone
      )
    );
  };

  const handleUpdateDlcLabel = (zoneIndex: number, dlcIndex: number, label: string) => {
    updateTattoos((prev) =>
      prev.map((zone, zIdx) =>
        zIdx === zoneIndex
          ? {
              ...zone,
              dlcs: (zone.dlcs || []).map((dlc, dIdx) =>
                dIdx === dlcIndex
                  ? {
                      ...dlc,
                      label,
                      tattoos: (dlc.tattoos || []).map((tattoo) => ({ ...tattoo, dlc: label })),
                    }
                  : dlc
              ),
            }
          : zone
      )
    );
  };

  const handleDeleteDlc = (zoneIndex: number, dlcIndex: number) => {
    updateTattoos((prev) =>
      prev.map((zone, zIdx) =>
        zIdx === zoneIndex ? { ...zone, dlcs: (zone.dlcs || []).filter((_, dIdx) => dIdx !== dlcIndex) } : zone
      )
    );
  };

  const handleAddTattooEntry = (zoneIndex: number, dlcIndex: number) => {
    updateTattoos((prev) =>
      prev.map((zone, zIdx) =>
        zIdx === zoneIndex
          ? {
              ...zone,
              dlcs: (zone.dlcs || []).map((dlc, dIdx) =>
                dIdx === dlcIndex
                  ? {
                      ...dlc,
                      tattoos: [
                        ...(dlc.tattoos || []),
                        { label: 'New Tattoo', hash: 0, zone: zone.zoneIndex ?? zIdx, opacity: 1, dlc: dlc.label },
                      ],
                    }
                  : dlc
              ),
            }
          : zone
      )
    );
  };

  const handleUpdateTattooField = (
    zoneIndex: number,
    dlcIndex: number,
    tattooIndex: number,
    field: 'label' | 'hash' | 'opacity'
  ) => (value: string | number) => {
    updateTattoos((prev) =>
      prev.map((zone, zIdx) =>
        zIdx === zoneIndex
          ? {
              ...zone,
              dlcs: (zone.dlcs || []).map((dlc, dIdx) =>
                dIdx === dlcIndex
                  ? {
                      ...dlc,
                      tattoos: (dlc.tattoos || []).map((tattoo, tIdx) => {
                        if (tIdx !== tattooIndex) return tattoo;
                        if (field === 'label') return { ...tattoo, label: String(value) };
                        if (field === 'hash') return { ...tattoo, hash: Number(value) || 0 };
                        const nextOpacity = Math.max(0, Math.min(1, Number(value) || 0));
                        return { ...tattoo, opacity: nextOpacity };
                      }),
                    }
                  : dlc
              ),
            }
          : zone
      )
    );
  };

  const handleDeleteTattooEntry = (zoneIndex: number, dlcIndex: number, tattooIndex: number) => {
    updateTattoos((prev) =>
      prev.map((zone, zIdx) =>
        zIdx === zoneIndex
          ? {
              ...zone,
              dlcs: (zone.dlcs || []).map((dlc, dIdx) =>
                dIdx === dlcIndex
                  ? { ...dlc, tattoos: (dlc.tattoos || []).filter((_, tIdx) => tIdx !== tattooIndex) }
                  : dlc
              ),
            }
          : zone
      )
    );
  };

  const handleSaveTattoos = () => {
    const normalized = normalizeTattooData(tattoos);
    setTattoos(normalized);
    TriggerNuiCallback('saveTattoos', normalized).then(() => {});
  };

  if (!isVisible || captureActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          padding: '2rem',
          width: '80vw',
          maxWidth: 1200,
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <Group position="apart" mb="xl">
          <Text size="xl" fw={700} c="white">
            Appearance Admin Menu
          </Text>
          <Button onClick={handleClose} variant="subtle" color="red">
            Close
          </Button>
        </Group>

        <Tabs defaultValue="theme" color="blue">
          <Tabs.List>
            <Tabs.Tab value="theme">
              <IconPalette size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Appearance Settings
            </Tabs.Tab>
            <Tabs.Tab value="restrictions">
              <IconLock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Restrictions
            </Tabs.Tab>
            <Tabs.Tab value="models">
              <IconUser size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Models
            </Tabs.Tab>
            <Tabs.Tab value="shops">
              <IconShoppingCart size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Shop Options
            </Tabs.Tab>
            <Tabs.Tab value="tattoos">
              <IconFeather size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Tattoos
            </Tabs.Tab>
            <Tabs.Tab value="zones">
              <IconMapPin size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Zones
            </Tabs.Tab>
            <Tabs.Tab value="outfits">
              <IconHanger size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Outfits
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theme" pt="xl">
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
                        '#ef4444',
                        '#f97316',
                        '#f59e0b',
                        '#eab308',
                        '#84cc16',
                        '#22c55e',
                        '#10b981',
                        '#14b8a6',
                        '#06b6d4',
                        '#0ea5e9',
                        '#3b82f6',
                        '#6366f1',
                        '#8b5cf6',
                        '#a855f7',
                        '#d946ef',
                        '#ec4899',
                        '#f43f5e',
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
                onClick={handleSaveThemeAndShape}
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
          </Tabs.Panel>

          <Tabs.Panel value="restrictions" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Text c="white" fw={500}>
                  Job/Gang Restrictions (split by gender)
                </Text>
                <Button onClick={() => setAddModalOpen(true)}>
                  <IconPlus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Add Restriction
                </Button>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                {restrictions.length === 0 ? (
                  <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    No restrictions configured
                  </Box>
                ) : (
                  <Accordion
                    chevronPosition="right"
                    variant="separated"
                    styles={{
                      item: {
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '0.5rem',
                      },
                      control: {
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        },
                      },
                    }}
                  >
                    {(() => {
                      // Group restrictions by group (or job/gang), then by identifier
                      const grouped = restrictions.reduce((acc, r) => {
                        const key = r.group || r.job || r.gang || 'Unknown';
                        const identifierKey = r.identifier || 'all';
                        if (!acc[key]) acc[key] = {};
                        if (!acc[key][identifierKey]) acc[key][identifierKey] = [];
                        acc[key][identifierKey].push(r);
                        return acc;
                      }, {} as Record<string, Record<string, ClothingRestriction[]>>);

                      return Object.entries(grouped).map(([jobGang, identifierGroups]) => {
                        const totalCount = Object.values(identifierGroups).flat().length;
                        const type = restrictions.find(r => (r.group || r.job || r.gang) === jobGang)?.job ? 'Job' : 'Gang';
                        
                        return (
                          <Accordion.Item key={jobGang} value={jobGang}>
                            <Accordion.Control>
                              <Group position="apart" style={{ width: '100%', paddingRight: '1rem' }}>
                                <Group spacing="sm">
                                  <Text fw={600} c="white" tt="capitalize">
                                    {jobGang}
                                  </Text>
                                  <Badge size="sm" color="blue" variant="light">
                                    {type}
                                  </Badge>
                                  <Badge size="sm" color="gray" variant="outline">
                                    {totalCount} restriction{totalCount !== 1 ? 's' : ''}
                                  </Badge>
                                </Group>
                              </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Stack spacing="md">
                                {Object.entries(identifierGroups).map(([identifier, items]) => (
                                  <Box key={identifier} style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '1rem' }}>
                                    <Group position="apart" mb="sm">
                                      <Group spacing="xs">
                                        <Text size="sm" fw={500} c="dimmed">
                                          {identifier === 'all' ? '🌐 All Players' : `👤 ${identifier}`}
                                        </Text>
                                      </Group>
                                    </Group>
                                    <Stack spacing="xs">
                                      {items.map((r) => (
                                        <Group
                                          key={r.id}
                                          position="apart"
                                          style={{
                                            padding: '0.5rem',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            borderRadius: 4,
                                            border: '1px solid rgba(255,255,255,0.05)',
                                          }}
                                        >
                                          <Group spacing="sm">
                                            <Badge size="sm" color={r.gender === 'male' ? 'blue' : 'pink'} variant="filled">
                                              {r.gender === 'male' ? '♂' : '♀'} {r.gender}
                                            </Badge>
                                            <Badge size="sm" color="cyan" variant="light">
                                              {r.part || r.type}
                                            </Badge>
                                            <Text size="sm" c="white">
                                              {r.category ? `${r.category}:` : ''} <strong>#{r.itemId}</strong>
                                            </Text>
                                            <Badge size="xs" color="grape" variant="outline">
                                              {r.texturesAll ? 'All Textures' : r.textures?.length ? `Textures: ${r.textures.join(', ')}` : 'No Textures'}
                                            </Badge>
                                          </Group>
                                          <ActionIcon color="red" size="sm" onClick={() => handleDeleteRestriction(r.id)}>
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>
                                      ))}
                                    </Stack>
                                  </Box>
                                ))}
                              </Stack>
                            </Accordion.Panel>
                          </Accordion.Item>
                        );
                      });
                    })()}
                  </Accordion>
                )}
              </div>

              {/* Advanced JSON sets removed per request */}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="models" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Group>
                  <Text c="white" fw={500}>
                    Available Player Models
                  </Text>
                  <Checkbox
                    label="Select All (Lock from Everyone)"
                    description="Check models to lock them from everyone. Unchecked models are available to all players."
                    checked={selectedModels.length > 0 && selectedModels.length === models.filter(m => m !== 'mp_m_freemode_01' && m !== 'mp_f_freemode_01').length}
                    indeterminate={selectedModels.length > 0 && selectedModels.length < models.filter(m => m !== 'mp_m_freemode_01' && m !== 'mp_f_freemode_01').length}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        // Select all non-freemode models
                        setSelectedModels(models.filter(m => m !== 'mp_m_freemode_01' && m !== 'mp_f_freemode_01'));
                      } else {
                        // Deselect all
                        setSelectedModels([]);
                      }
                    }}
                    styles={{
                      label: { color: '#fff', fontSize: '0.9rem' },
                      description: { color: '#888', fontSize: '0.8rem', marginTop: 4 }
                    }}
                  />
                </Group>
                <Group>
                  {selectedModels.length > 0 && (
                    <>
                      <Button 
                        color="blue" 
                        size="sm"
                        onClick={() => {
                          // Only add newly selected models; do not unlock unchecked ones
                          const additions = selectedModels.filter(m => !lockedModelsSaved.includes(m));
                          if (additions.length === 0) return;
                          TriggerNuiCallback('addLockedModels', { models: additions }).then((updated) => {
                            // Reflect saved locks locally
                            setLockedModelsSaved(prev => Array.from(new Set([...prev, ...additions])));
                            // Clear selection after save
                            setSelectedModels([]);
                          });
                        }}
                      >
                        Save Locked Models
                      </Button>
                      <Button 
                        color="red" 
                        size="sm"
                        onClick={() => {
                          TriggerNuiCallback('deleteModels', selectedModels).then(() => {
                            setModels(models.filter(m => !selectedModels.includes(m)));
                            setSelectedModels([]);
                          });
                        }}
                      >
                        <IconTrash size={16} style={{ marginRight: 8 }} />
                        Delete ({selectedModels.length})
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setAddModelModalOpen(true)}>
                    <IconPlus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Add Model
                  </Button>
                </Group>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                {models.length === 0 ? (
                  <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    No models configured
                  </Box>
                ) : (
                  <Stack spacing="xs">
                    {(() => {
                      // Always show freemode models first
                      const freemodeModels = ['mp_m_freemode_01', 'mp_f_freemode_01'];
                      const otherModels = models.filter(m => !freemodeModels.includes(m));
                      const sortedModels = [...freemodeModels.filter(m => models.includes(m)), ...otherModels];
                      
                      return sortedModels.map((model, idx) => {
                        const isFreemode = freemodeModels.includes(model);
                        const isSelected = selectedModels.includes(model);
                        const isLockedSaved = lockedModelsSaved.includes(model);
                        return (
                          <Group
                            key={idx}
                            position="apart"
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: isSelected 
                                ? 'rgba(59, 130, 246, 0.2)' 
                                : isLockedSaved
                                  ? 'rgba(239, 68, 68, 0.10)'
                                  : idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                              borderRadius: 6,
                              border: isFreemode ? '1px solid rgba(59, 130, 246, 0.3)' : (isLockedSaved ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255,255,255,0.05)'),
                              cursor: isFreemode ? 'default' : 'pointer',
                            }}
                            onClick={() => {
                              if (isFreemode) return;
                              setSelectedModels(prev => 
                                prev.includes(model) 
                                  ? prev.filter(m => m !== model)
                                  : [...prev, model]
                              );
                            }}
                          >
                            <Group spacing="sm">
                              {!isFreemode && (
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => {}}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <IconUser size={18} color={isFreemode ? '#3b82f6' : (isLockedSaved ? '#ef4444' : '#888')} />
                              <Text c="white" fw={isFreemode ? 600 : 500}>
                                {model}
                              </Text>
                              {isFreemode && (
                                <Badge size="xs" color="blue" variant="light">
                                  Protected
                                </Badge>
                              )}
                              {!isFreemode && isSelected && (
                                <Badge size="xs" color="blue" variant="light">
                                  To Lock
                                </Badge>
                              )}
                              {!isFreemode && isLockedSaved && (
                                <Badge size="xs" color="red" variant="filled">
                                  Locked
                                </Badge>
                              )}
                            </Group>
                            {!isFreemode && !isSelected && (
                              <ActionIcon 
                                color="red" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  TriggerNuiCallback('deleteModel', model).then(() => {
                                    setModels(models.filter(m => m !== model));
                                  });
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                        );
                      });
                    })()}
                  </Stack>
                )}
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="shops" pt="xl">
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
                    onClick={() => {
                      TriggerNuiCallback('saveShopSettings', { settings: shopSettings, configs: shopConfigs }).then(() => {});
                    }}
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
          </Tabs.Panel>

          <Tabs.Panel value="tattoos" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Text c="white" fw={500}>
                  Tattoo Catalog
                </Text>
                <Group>
                  <Button size="sm" variant="light" onClick={handleAddZone}>
                    <IconPlus size={14} style={{ marginRight: 8 }} />
                    Add Zone
                  </Button>
                  <Button size="sm" onClick={handleSaveTattoos}>
                    Save Tattoos
                  </Button>
                </Group>
              </Group>

              {tattoos.length === 0 ? (
                <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  No tattoos configured
                </Box>
              ) : (
                <Accordion
                  chevronPosition="right"
                  variant="separated"
                  styles={{
                    item: {
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '0.5rem',
                    },
                  }}
                >
                  {tattoos.map((zone, zoneIdx) => {
                    const tattooCount = (zone.dlcs || []).reduce((acc, dlc) => acc + (dlc.tattoos?.length || 0), 0);
                    return (
                      <Accordion.Item key={`zone-${zoneIdx}`} value={`zone-${zoneIdx}`}>
                        <Accordion.Control>
                          <Group position="apart" style={{ width: '100%', paddingRight: '1rem' }}>
                            <Group spacing="sm">
                              <Text fw={600} c="white">
                                {zone.label || `Zone ${zoneIdx + 1}`}
                              </Text>
                              <Badge size="xs" color="blue" variant="light">
                                DLCs {zone.dlcs?.length || 0}
                              </Badge>
                              <Badge size="xs" color="grape" variant="outline">
                                Tattoos {tattooCount}
                              </Badge>
                            </Group>
                            <ActionIcon color="red" onClick={(e) => { e.stopPropagation(); handleDeleteZone(zoneIdx); }}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Stack spacing="sm">
                            <Group grow>
                              <TextInput
                                label="Zone Label"
                                value={zone.label || ''}
                                onChange={(e) => handleUpdateZoneLabel(zoneIdx, 'label', e.currentTarget.value)}
                              />
                              <TextInput
                                label="Zone Key"
                                value={zone.zone || ''}
                                onChange={(e) => handleUpdateZoneLabel(zoneIdx, 'zone', e.currentTarget.value)}
                              />
                            </Group>

                            <Divider />

                            <Stack spacing="sm">
                              {(zone.dlcs || []).map((dlc, dlcIdx) => (
                                <Box key={`dlc-${dlcIdx}`} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <Group position="apart" mb="sm">
                                    <TextInput
                                      label={`DLC ${dlcIdx + 1}`}
                                      value={dlc.label || ''}
                                      onChange={(e) => handleUpdateDlcLabel(zoneIdx, dlcIdx, e.currentTarget.value)}
                                      style={{ flex: 1 }}
                                    />
                                    <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteDlc(zoneIdx, dlcIdx)}>
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Group>

                                  <Stack spacing="xs">
                                    {(dlc.tattoos || []).map((tattoo, tattooIdx) => (
                                      <Box key={`tattoo-${tattooIdx}`} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <Group align="flex-end" spacing="sm">
                                          <TextInput
                                            label="Label"
                                            value={tattoo.label || ''}
                                            onChange={(e) => handleUpdateTattooField(zoneIdx, dlcIdx, tattooIdx, 'label')(e.currentTarget.value)}
                                            style={{ flex: 1 }}
                                          />
                                          <NumberInput
                                            label="Hash"
                                            value={tattoo.hash}
                                            onChange={(val) => handleUpdateTattooField(zoneIdx, dlcIdx, tattooIdx, 'hash')(val as number)}
                                            style={{ width: 140 }}
                                          />
                                          <NumberInput
                                            label="Opacity"
                                            value={tattoo.opacity ?? 1}
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            precision={2}
                                            onChange={(val) => handleUpdateTattooField(zoneIdx, dlcIdx, tattooIdx, 'opacity')(val as number)}
                                            style={{ width: 140 }}
                                          />
                                          <ActionIcon color="red" variant="light" onClick={() => handleDeleteTattooEntry(zoneIdx, dlcIdx, tattooIdx)}>
                                            <IconTrash size={16} />
                                          </ActionIcon>
                                        </Group>
                                      </Box>
                                    ))}
                                    <Button size="xs" variant="light" onClick={() => handleAddTattooEntry(zoneIdx, dlcIdx)}>
                                      <IconPlus size={14} style={{ marginRight: 6 }} />
                                      Add Tattoo
                                    </Button>
                                  </Stack>
                                </Box>
                              ))}
                              <Button size="xs" variant="outline" onClick={() => handleAddDlc(zoneIdx)}>
                                <IconPlus size={14} style={{ marginRight: 6 }} />
                                Add DLC
                              </Button>
                            </Stack>
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="zones" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Text c="white" fw={500}>
                  Appearance Zones
                </Text>
                <Group>
                  <Select
                    value={newZoneType}
                    onChange={(v) => setNewZoneType((v as Zone['type']) || 'clothing')}
                    data={[
                      { value: 'clothing', label: 'Clothing' },
                      { value: 'barber', label: 'Barber' },
                      { value: 'tattoo', label: 'Tattoo' },
                      { value: 'surgeon', label: 'Surgeon' },
                    ]}
                    placeholder="Select zone type"
                  />
                  <Button onClick={() => {
                    setEditingZone({
                      type: newZoneType,
                      coords: { x: 0, y: 0, z: 0, heading: 0 },
                      showBlip: true
                    });
                    setAddZoneModalOpen(true);
                  }}>
                    <IconPlus size={16} style={{ marginRight: 8 }} />
                    Add Zone
                  </Button>
                </Group>
              </Group>

              {zones.length === 0 ? (
                <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  No zones configured
                </Box>
              ) : (
                <Stack spacing="xs">
                  {zones.map((zone, idx) => (
                    <Group
                      key={zone.id || idx}
                      position="apart"
                      style={{
                        padding: '1rem',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div>
                        <Group spacing="sm" mb={4}>
                          <Badge size="sm" color="blue" variant="light" tt="capitalize">
                            {zone.type}
                          </Badge>
                          {zone.job && <Badge size="xs" color="green">Job: {zone.job}</Badge>}
                          {zone.gang && <Badge size="xs" color="purple">Gang: {zone.gang}</Badge>}
                          {!zone.showBlip && <Badge size="xs" color="gray">Blip Hidden</Badge>}
                        </Group>
                        <Text c="white" size="sm">
                          {zone.name || 'Unnamed Zone'}
                        </Text>
                        <Text c="dimmed" size="xs">
                          Coords: {zone.coords.x.toFixed(2)}, {zone.coords.y.toFixed(2)}, {zone.coords.z.toFixed(2)}
                          {zone.polyzone && ` • ${zone.polyzone.length} polyzone points`}
                        </Text>
                      </div>
                      <Group>
                        <ActionIcon 
                          color="blue"
                          onClick={() => {
                            setEditingZone(zone);
                            setPolyzonePointsInput(zone.polyzone ? JSON.stringify(zone.polyzone) : '');
                            setAddZoneModalOpen(true);
                          }}
                        >
                          <IconChevronDown size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          color="red"
                          onClick={() => {
                            TriggerNuiCallback('deleteZone', zone.id).then(() => {
                              setZones(zones.filter(z => z.id !== zone.id));
                            });
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="outfits" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Text c="white" fw={500}>
                  Job & Gang Outfits
                </Text>
                <Button onClick={() => setAddOutfitModalOpen(true)}>
                  <IconPlus size={16} style={{ marginRight: 8 }} />
                  Add Outfit
                </Button>
              </Group>

              {outfits.length === 0 ? (
                <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  No outfits configured
                </Box>
              ) : (
                <Stack spacing="xs">
                  {outfits.map((outfit, idx) => (
                    <Group
                      key={outfit.id || idx}
                      position="apart"
                      style={{
                        padding: '1rem',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div>
                        <Group spacing="sm" mb={4}>
                          <Badge size="sm" color={outfit.gender === 'male' ? 'blue' : 'pink'} variant="light">
                            {outfit.gender}
                          </Badge>
                          {outfit.job && <Badge size="xs" color="green">Job: {outfit.job}</Badge>}
                          {outfit.gang && <Badge size="xs" color="purple">Gang: {outfit.gang}</Badge>}
                        </Group>
                        <Text c="white" size="sm" fw={500}>
                          {outfit.outfitName}
                        </Text>
                      </div>
                      <ActionIcon 
                        color="red"
                        onClick={() => {
                          TriggerNuiCallback('deleteOutfit', outfit.id).then(() => {
                            setOutfits(outfits.filter(o => o.id !== outfit.id));
                          });
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Modal
          opened={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add Restriction"
          centered
          zIndex={10000}
        >
          <Stack spacing="md">
            <TextInput
              label="Job Name (leave empty if gang)"
              placeholder="police"
              value={newRestriction.job || ''}
              onChange={(e) => setNewRestriction({ ...newRestriction, job: e.target.value || undefined, gang: undefined })}
            />
            <TextInput
              label="Gang Name (leave empty if job)"
              placeholder="ballas"
              value={newRestriction.gang || ''}
              onChange={(e) => setNewRestriction({ ...newRestriction, gang: e.target.value || undefined, job: undefined })}
            />
            <TextInput
              label="Identifier (optional - leave empty for all players)"
              placeholder="license:abc123 or steam:110000123456789"
              description="Restrict to specific player identifier"
              value={newRestriction.identifier || ''}
              onChange={(e) => setNewRestriction({ ...newRestriction, identifier: e.target.value || undefined })}
            />
            <Select
              label="Gender"
              value={newRestriction.gender}
              onChange={(value) => {
                if (value === 'male' || value === 'female') {
                  setNewRestriction({ ...newRestriction, gender: value });
                }
              }}
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            {/** Type removed; Part determines behavior */}
            <Select
              label="Part"
              value={newRestriction.part || 'drawable'}
              onChange={(value) => {
                const part = (value as PartType) || 'drawable';
                setNewRestriction({
                  ...newRestriction,
                  part,
                  category: part === 'model' ? undefined : newRestriction.category,
                  itemId: part === 'model' ? undefined : newRestriction.itemId,
                });
              }}
              data={[
                { value: 'model', label: 'Model' },
                { value: 'drawable', label: 'Drawable (clothing component)' },
                { value: 'prop', label: 'Prop (hats/glasses)' },
              ]}
            />
            {(newRestriction.part || 'drawable') === 'model' ? (
              <Select
                label="Model"
                placeholder="Search for a model..."
                value={newRestriction.itemId?.toString() || ''}
                onChange={(value) => {
                  if (value) {
                    setNewRestriction({ ...newRestriction, itemId: parseInt(value, 10) });
                  }
                }}
                data={models.map((model, index) => ({ value: index.toString(), label: model }))}
                searchable
                maxDropdownHeight={300}
                nothingFound="No models found"
              />
            ) : (
              <Select
                label="Category"
                value={newRestriction.category || ''}
                onChange={(value) =>
                  setNewRestriction({ ...newRestriction, category: value || undefined })
                }
                data={categoryOptionsByPart[(newRestriction.part as PartType) || 'drawable']}
                placeholder="Select category"
              />
            )}
            {(newRestriction.part || 'drawable') !== 'model' && (
              <>
                <Checkbox
                  label="All textures"
                  checked={texturesAll}
                  onChange={(e) => setTexturesAll(e.currentTarget.checked)}
                />
                {!texturesAll && (
                  <TextInput
                    label="Textures (comma-separated)"
                    placeholder="0,1,2,3"
                    value={texturesInput}
                    onChange={(e) => setTexturesInput(e.currentTarget.value)}
                  />
                )}
                <TextInput
                  label="Item ID"
                  type="number"
                  placeholder="123"
                  value={newRestriction.itemId?.toString() || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      setNewRestriction({ ...newRestriction, itemId: value });
                    } else {
                      setNewRestriction({ ...newRestriction, itemId: undefined });
                    }
                  }}
                />
              </>
            )}
            
            <Group position="right" mt="md">
              <Button variant="subtle" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRestriction}>Add</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={addModelModalOpen}
          onClose={() => {
            setAddModelModalOpen(false);
            setNewModelName('');
          }}
          title="Add Player Model"
          centered
          zIndex={10000}
        >
          <Stack spacing="md">
            <TextInput
              label="Model Name"
              placeholder="mp_m_freemode_01 or a_m_y_business_01"
              description="Enter the exact spawn name of the ped model"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
            
            <Group position="right" mt="md">
              <Button 
                variant="subtle" 
                onClick={() => {
                  setAddModelModalOpen(false);
                  setNewModelName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newModelName.trim()) return;
                  
                  const freemodeModels = ['mp_m_freemode_01', 'mp_f_freemode_01'];
                  if (freemodeModels.includes(newModelName.trim().toLowerCase())) {
                    // Show error - can't add protected models
                    return;
                  }
                  
                  TriggerNuiCallback('addModel', newModelName.trim()).then(() => {
                    setModels([...models, newModelName.trim()]);
                    setAddModelModalOpen(false);
                    setNewModelName('');
                  });
                }}
                disabled={!newModelName.trim()}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={addZoneModalOpen}
          onClose={() => {
            setAddZoneModalOpen(false);
            setEditingZone(null);
            setPolyzonePointsInput('');
          }}
          title={editingZone ? "Edit Zone" : "Add Zone"}
          centered
          zIndex={10000}
        >
          <Stack spacing="md">
            <Select
              label="Zone Type"
              value={editingZone?.type || 'clothing'}
              onChange={(value) => {
                if (editingZone) {
                  setEditingZone({ ...editingZone, type: value as any });
                }
              }}
              data={[
                { value: 'clothing', label: 'Clothing' },
                { value: 'barber', label: 'Barber' },
                { value: 'tattoo', label: 'Tattoo' },
                { value: 'surgeon', label: 'Surgeon' },
              ]}
            />
            <TextInput
              label="Zone Name (Optional)"
              placeholder="Downtown Clothing Store"
              value={editingZone?.name || ''}
              onChange={(e) => {
                if (editingZone) {
                  setEditingZone({ ...editingZone, name: e.target.value });
                }
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
                    const raw = e.target.value;
                    setCoordsInput(raw);
                    const parts = raw.split(',').map(p => parseFloat(p.trim()));
                    if (parts.length >= 3 && !parts.slice(0, 3).some(isNaN)) {
                      const coords = { x: parts[0], y: parts[1], z: parts[2], heading: parts[3] || 0 };
                      if (editingZone) {
                        setEditingZone({ ...editingZone, coords });
                      }
                    }
                  }}
                />
                <Button
                  variant="light"
                  onClick={() => {
                    setIsVisible(false);
                    setCaptureActive(true);
                    TriggerNuiCallback('startZoneRaycast', { multiPoint: false });
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
                />
                <Button
                  variant="light"
                  onClick={() => {
                    setIsVisible(false);
                    setCaptureActive(true);
                    TriggerNuiCallback('startZoneRaycast', { multiPoint: true }).then(() => {
                      // Client will handle multiple point capture and send back via NUI message when Backspace pressed
                    });
                  }}
                >
                  <IconDownload stroke={2} />
                </Button>
              </Group>
            </div>
            <Checkbox
              label="Show Blip"
              description="Display this zone on the map"
              checked={editingZone?.showBlip ?? true}
              onChange={(e) => {
                if (editingZone) {
                  setEditingZone({ ...editingZone, showBlip: e.currentTarget.checked });
                }
              }}
              styles={{
                label: { color: '#fff', fontSize: '0.9rem' },
                description: { color: '#888', fontSize: '0.8rem', marginTop: 4 }
              }}
            />
            <TextInput
              label="Job (Optional)"
              placeholder="police"
              description="Restrict zone to specific job"
              value={editingZone?.job || ''}
              onChange={(e) => {
                if (editingZone) {
                  setEditingZone({ ...editingZone, job: e.target.value || undefined });
                }
              }}
            />
            <TextInput
              label="Gang (Optional)"
              placeholder="ballas"
              description="Restrict zone to specific gang"
              value={editingZone?.gang || ''}
              onChange={(e) => {
                if (editingZone) {
                  setEditingZone({ ...editingZone, gang: e.target.value || undefined });
                }
              }}
            />
            <Group position="right" mt="md">
              <Button 
                variant="subtle" 
                onClick={() => {
                  setAddZoneModalOpen(false);
                  setEditingZone(null);
                  setPolyzonePointsInput('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!editingZone?.coords) return;
                  
                  let polyzone = undefined;
                  if (polyzonePointsInput.trim()) {
                    try {
                      polyzone = JSON.parse(polyzonePointsInput);
                    } catch (e) {
                      return;
                    }
                  }
                  
                  const zoneData = { ...editingZone, polyzone };
                  
                  TriggerNuiCallback(editingZone.id ? 'updateZone' : 'addZone', zoneData).then(() => {
                    if (editingZone.id) {
                      setZones(zones.map(z => z.id === editingZone.id ? zoneData : z));
                    } else {
                      setZones([...zones, { ...zoneData, id: Date.now() }]);
                    }
                    setAddZoneModalOpen(false);
                    setEditingZone(null);
                    setPolyzonePointsInput('');
                  });
                }}
              >
                {editingZone?.id ? 'Update' : 'Add'}
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={addOutfitModalOpen}
          onClose={() => {
            setAddOutfitModalOpen(false);
            setNewOutfit({ gender: 'male' });
          }}
          title="Add Job/Gang Outfit"
          centered
          zIndex={10000}
        >
          <Stack spacing="md">
            <TextInput
              label="Outfit Name"
              placeholder="Police Uniform"
              value={newOutfit.outfitName || ''}
              onChange={(e) => setNewOutfit({ ...newOutfit, outfitName: e.target.value })}
            />
            <Select
              label="Gender"
              value={newOutfit.gender || 'male'}
              onChange={(value) => setNewOutfit({ ...newOutfit, gender: value as 'male' | 'female' })}
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            <TextInput
              label="Job (Optional)"
              placeholder="police"
              description="Leave blank if this is for a gang"
              value={newOutfit.job || ''}
              onChange={(e) => setNewOutfit({ ...newOutfit, job: e.target.value || undefined })}
            />
            <TextInput
              label="Gang (Optional)"
              placeholder="ballas"
              description="Leave blank if this is for a job"
              value={newOutfit.gang || ''}
              onChange={(e) => setNewOutfit({ ...newOutfit, gang: e.target.value || undefined })}
            />
            <Text c="dimmed" size="xs">
              Note: Outfit appearance data will be captured from your current character when you save.
            </Text>
            <Group position="right" mt="md">
              <Button 
                variant="subtle" 
                onClick={() => {
                  setAddOutfitModalOpen(false);
                  setNewOutfit({ gender: 'male' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang)) return;
                  
                  TriggerNuiCallback('addOutfit', newOutfit).then((outfitData) => {
                    setOutfits([...outfits, { ...newOutfit, ...outfitData, id: Date.now() } as JobOutfit]);
                    setAddOutfitModalOpen(false);
                    setNewOutfit({ gender: 'male' });
                  });
                }}
                disabled={!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang)}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* JSON editor removed */}
      </div>
    </div>
  );
};
