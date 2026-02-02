import { FC, useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { Tabs, Button, Stack, Group, Text, TextInput, Select, ActionIcon, Modal, Checkbox, Accordion, Badge, Box, NumberInput, Divider, Loader, Overlay } from '@mantine/core';
import { IconPalette, IconLock, IconUser, IconShoppingCart, IconMapPin, IconHanger, IconDownload, IconFeather, IconMars, IconVenus, IconAdjustments } from './icons/Icons';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import { AddOutfitModal } from './admin/AddOutfitModal';
import { AddZoneModal } from './admin/AddZoneModal';

import { useCustomization } from '../Providers/CustomizationProvider';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
const TattoosTab = lazy(() => import('./admin/TattoosTab').then(mod => ({ default: mod.TattoosTab })));
const ThemeTab = lazy(() => import('./admin/ThemeTab').then(mod => ({ default: mod.ThemeTab })));
const ModelsTab = lazy(() => import('./admin/ModelsTab').then(mod => ({ default: mod.ModelsTab })));
const RestrictionsTab = lazy(() => import('./admin/RestrictionsTab').then(mod => ({ default: mod.RestrictionsTab })));
const ZonesTab = lazy(() => import('./admin/ZonesTab').then(mod => ({ default: mod.ZonesTab })));
const OutfitsTab = lazy(() => import('./admin/OutfitsTab').then(mod => ({ default: mod.OutfitsTab })));
const SettingsTab = lazy(() => import('./admin/SettingsTab').then(mod => ({ default: mod.SettingsTab })));

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
  citizenid?: string;
  playerName?: string;
  gender: 'male' | 'female';
  type?: 'model' | 'clothing';
  part?: 'model' | 'drawable' | 'prop';
  category?: string;
  itemId: number;
  name?: string;
  texturesAll?: boolean;
  textures?: number[];
}

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

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any; // Appearance data JSON
}

interface TattooEntry {
  label: string;
  hashMale: string;
  hashFemale: string;
  zone?: string;
  zoneIndex?: number;
  price?: number;
}

interface TattooDLC {
  dlc: string;
  tattoos: TattooEntry[];
}

type PartType = 'model' | 'drawable' | 'prop';

export const AdminMenu: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [captureActive, setCaptureActive] = useState(false);
  const { theme: cachedTheme } = useCustomization();
  const { locale } = useAppearanceStore();
  const [theme, setTheme] = useState<ThemeConfig>(cachedTheme);
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

  // Zones State
  const [zones, setZones] = useState<Zone[]>([]);
  const [addZoneModalOpen, setAddZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [capturedCoords, setCapturedCoords] = useState<{ x: number; y: number; z: number; w?: number } | null>(null);
  const [capturedPolyzonePoints, setCapturedPolyzonePoints] = useState<{ x: number; y: number }[] | null>(null);
  const [zoneFormData, setZoneFormData] = useState<{type: string; name: string; job: string; gang: string; price: number; useCustomPrice: boolean} | null>(null);

  // Outfits State
  const [outfits, setOutfits] = useState<JobOutfit[]>([]);
  const [addOutfitModalOpen, setAddOutfitModalOpen] = useState(false);

  // Tattoos State
  const [tattoos, setTattoos] = useState<TattooDLC[]>([]);
  const [expandedDlc, setExpandedDlc] = useState<string | null>(null);
  const [expandedRestriction, setExpandedRestriction] = useState<string | null>(null);

  // Appearance settings (runtime defaults for zones)
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    useTarget: true,
    useRadialMenu: false,
    chargePerTattoo: false,
    prices: {
      clothing: 0,
      barber: 0,
      tattoo: 0,
      surgeon: 0
    },
    blips: {}
  });

  // Initial Player Clothes State
  interface ClothingConfig {
    model: string;
    components: Array<{ drawable: number; texture: number }>;
    props: Array<{ drawable: number; texture: number }>;
    hair: { color: number; highlight: number; style: number; texture: number };
  }
  
  const [initialClothes, setInitialClothes] = useState<{
    male: ClothingConfig;
    female: ClothingConfig;
  }>({
    male: {
      model: 'mp_m_freemode_01',
      components: Array(12).fill(null).map(() => ({ drawable: 0, texture: 0 })),
      props: Array(5).fill(null).map(() => ({ drawable: -1, texture: -1 })),
      hair: { color: 0, highlight: 0, style: 0, texture: 0 }
    },
    female: {
      model: 'mp_f_freemode_01',
      components: Array(12).fill(null).map(() => ({ drawable: 0, texture: 0 })),
      props: Array(5).fill(null).map(() => ({ drawable: -1, texture: -1 })),
      hair: { color: 0, highlight: 0, style: 0, texture: 0 }
    }
  });

  // Loading State
  const [activeTab, setActiveTab] = useState<string | null>('theme');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [dataLoadProgress, setDataLoadProgress] = useState({ theme: false, restrictions: false, models: false, tattoos: false });
  const [themeReady, setThemeReady] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

  const categoryOptionsByPart: Record<PartType, { value: string; label: string }[]> = useMemo(() => ({
    model: [{ value: 'model', label: locale.ADMIN_PART_MODEL || 'Model' }],
    drawable: [
      { value: 'masks', label: locale.ADMIN_CATEGORY_MASKS || 'Masks' },
      { value: 'shirts', label: locale.ADMIN_CATEGORY_UNDERSHIRTS || 'Undershirts' },
      { value: 'jackets', label: locale.ADMIN_CATEGORY_TOPS || 'Tops/Jackets' },
      { value: 'vest', label: locale.ADMIN_CATEGORY_VEST || 'Vest' },
      { value: 'legs', label: locale.ADMIN_CATEGORY_LEGS || 'Legs' },
      { value: 'shoes', label: locale.ADMIN_CATEGORY_SHOES || 'Shoes' },
    ],
    prop: [
      { value: 'hats', label: locale.ADMIN_CATEGORY_HATS || 'Hats' },
      { value: 'glasses', label: locale.ADMIN_CATEGORY_GLASSES || 'Glasses' },
    ],
  }), [locale]);

  const tattooZoneOptions = useMemo(() => [
    { value: 'ZONE_TORSO', label: locale.ADMIN_TATTOO_ZONE_TORSO || 'Torso', zoneIndex: 0 },
    { value: 'ZONE_HEAD', label: locale.ADMIN_TATTOO_ZONE_HEAD || 'Head', zoneIndex: 1 },
    { value: 'ZONE_LEFT_ARM', label: locale.ADMIN_TATTOO_ZONE_LEFT_ARM || 'Left Arm', zoneIndex: 2 },
    { value: 'ZONE_RIGHT_ARM', label: locale.ADMIN_TATTOO_ZONE_RIGHT_ARM || 'Right Arm', zoneIndex: 3 },
    { value: 'ZONE_LEFT_LEG', label: locale.ADMIN_TATTOO_ZONE_LEFT_LEG || 'Left Leg', zoneIndex: 4 },
    { value: 'ZONE_RIGHT_LEG', label: locale.ADMIN_TATTOO_ZONE_RIGHT_LEG || 'Right Leg', zoneIndex: 5 },
    { value: 'ZONE_UNKNOWN', label: locale.ADMIN_TATTOO_ZONE_UNKNOWN || 'Unknown', zoneIndex: 6 },
    { value: 'ZONE_NONE', label: locale.ADMIN_TATTOO_ZONE_NONE || 'None', zoneIndex: 7 },
  ], [locale]);

  HandleNuiMessage<boolean>('setVisibleAdminMenu', (visible) => {
    setIsVisible(visible);
  });

  HandleNuiMessage<ThemeConfig>('setThemeConfig', (data) => {
    // Defer theme update to prevent blocking
    requestAnimationFrame(() => {
      setTheme(data);
      setDataLoadProgress(prev => ({ ...prev, theme: true }));
    });
  });

  HandleNuiMessage<ClothingRestriction[]>('setRestrictions', (data) => {
    // Ensure data is always an array
    if (Array.isArray(data)) {
      // Defer the heavy grouping work to next animation frame
      requestAnimationFrame(() => {
        setRestrictions(data);
        setDataLoadProgress(prev => ({ ...prev, restrictions: true }));
      });
    } else {
      //console.warn('Received non-array restrictions data:', data);
      setRestrictions([]);
      setDataLoadProgress(prev => ({ ...prev, restrictions: true }));
    }
  });

  HandleNuiMessage<string[]>('setModels', (data) => {
    // Defer the heavy sorting work to next animation frame
    requestAnimationFrame(() => {
      setModels(data || []);
      setDataLoadProgress(prev => ({ ...prev, models: true }));
    });
  });

  HandleNuiMessage<string[]>('setLockedModels', (data) => {
    setLockedModelsSaved(data || []);
  });

  HandleNuiMessage<Zone[]>('setZones', (data) => {
    setZones(data);
  });

  HandleNuiMessage<any>('setTattoos', (data) => {
    // Defer heavy processing to allow UI to load first
    requestAnimationFrame(() => {
      // Convert nested zone format to simple DLC format for admin menu
      if (data && data[0] && data[0].dlcs) {
        // It's nested format, extract DLCs
        const simpleDLCs: TattooDLC[] = [];
        data.forEach((zone: any) => {
          (zone.dlcs || []).forEach((dlc: any) => {
            simpleDLCs.push({
              dlc: dlc.label || '',
              tattoos: (dlc.tattoos || []).map((t: any) => ({
                label: t.label || t.hash || '',
                hashMale: t.hashMale || t.hash || t.label || '',
                hashFemale: t.hashFemale || t.hash || t.label || '',
                zone: zone.zone || 'ZONE_TORSO',
                zoneIndex: typeof zone.zoneIndex === 'number' ? zone.zoneIndex : 0,
                price: typeof t.price === 'number' ? t.price : undefined,
              })),
            });
          });
        });
        setTattoos(simpleDLCs);
        setDataLoadProgress(prev => ({ ...prev, tattoos: true }));
      } else if (data && data[0] && data[0].dlc) {
        // Already simple format, normalize tattoo entries
        const normalized: TattooDLC[] = (data as any[]).map((dlc: any) => ({
          dlc: dlc.dlc || '',
          tattoos: (dlc.tattoos || []).map((t: any) => (
            typeof t === 'string'
              ? { label: t, hashMale: t, hashFemale: t, zone: 'ZONE_TORSO', zoneIndex: 0 }
              : {
                  label: t.label || t.hash || '',
                  hashMale: t.hashMale || t.hash || t.label || '',
                  hashFemale: t.hashFemale || t.hash || t.label || '',
                  zone: t.zone || (typeof t.zoneIndex === 'number' ? (tattooZoneOptions.find((z) => z.zoneIndex === t.zoneIndex)?.value || 'ZONE_TORSO') : 'ZONE_TORSO'),
                  zoneIndex: typeof t.zoneIndex === 'number'
                    ? t.zoneIndex
                    : tattooZoneOptions.find((z) => z.value === t.zone)?.zoneIndex ?? 0,
                  price: typeof t.price === 'number' ? t.price : undefined,
                }
          )),
        }));
        setTattoos(normalized);
        setDataLoadProgress(prev => ({ ...prev, tattoos: true }));
      } else {
        setTattoos([]);
        setDataLoadProgress(prev => ({ ...prev, tattoos: true }));
      }
    });
  });

  HandleNuiMessage<AppearanceSettings>('setAppearanceSettings', (data) => {
    if (data) {
      const { initialClothes: clothes, ...settings } = data as any;
      setAppearanceSettings(settings);
      if (clothes) setInitialClothes(clothes);
    }
  });

  HandleNuiMessage<JobOutfit[]>('setOutfits', (data) => {
    setOutfits(data || []);
  });

  HandleNuiMessage<{
    male: ClothingConfig;
    female: ClothingConfig;
  }>('setInitialClothes', (data) => {
    if (data) setInitialClothes(data);
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
    // Multi-point capture finished, restore UI
    setCapturedPolyzonePoints(data.points);
    // setCapturedCoords(null);
    setCaptureActive(false);
    setIsVisible(true);
  });

  HandleNuiMessage<{ coords: { x: number; y: number; z: number; w?: number } }>('singlePointCaptured', (data) => {
    if (!data || !data.coords) return;
    // Single-point capture finished, restore UI
    setCapturedCoords(data.coords);
    // setCapturedPolyzonePoints(null);
    setCaptureActive(false);
    setIsVisible(true);
  });

  const openZoneModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
    } else {
      setEditingZone(null);
    }
    setAddZoneModalOpen(true);
  };

  const handleStartCapture = (multiPoint: boolean) => {
    // Only clear the capture type we're about to use, preserve the other
    setIsVisible(false);
    setCaptureActive(true);
    TriggerNuiCallback('startZoneRaycast', { multiPoint });
  };

  const clearCaptureData = () => {
    setCapturedCoords(null);
    setCapturedPolyzonePoints(null);
  };

  const handleSaveZone = (zoneData: Zone, isUpdate: boolean) => {
    // Don't update local state here - wait for the server broadcast via setZones NUI message
    // This ensures zones have proper IDs from the database
    setAddZoneModalOpen(false);
    setEditingZone(null);
    clearCaptureData(); // Clear capture data after successful save
  };

  // Sync local theme state with cached theme from provider
  useEffect(() => {
    setTheme(cachedTheme);
  }, [cachedTheme]);

  useEffect(() => {}, [isVisible]);

  // Mount the menu structure after becoming visible to show loading spinner first
  useEffect(() => {
    if (isVisible && !menuMounted) {
      // Mount on the next frame to show immediately without added delay
      const id = requestAnimationFrame(() => setMenuMounted(true));
      return () => cancelAnimationFrame(id);
    } else if (!isVisible && menuMounted) {
      setMenuMounted(false);
    }
  }, [isVisible, menuMounted]);

  // Defer heavy ColorPicker rendering until theme data is loaded
  useEffect(() => {
    if (dataLoadProgress.theme && !themeReady) {
      // Double requestAnimationFrame to ensure the loading spinner renders first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setThemeReady(true);
        });
      });
    }
  }, [dataLoadProgress.theme, themeReady]);

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

  const handleTabChange = (tabValue: string | null) => {
    // Switch immediately and clear loading on the next frame to avoid perceived delay
    setIsLoadingTab(true);
    setActiveTab(tabValue);
    requestAnimationFrame(() => setIsLoadingTab(false));
  };

  // Tattoo handlers - simplified for DLC-based structure
  const handleAddDlc = () => {
    setTattoos([...tattoos, { dlc: '', tattoos: [] }]);
  };

  const handleUpdateDlcName = (dlcIndex: number, name: string) => {
    setTattoos(prev => prev.map((dlc, idx) => idx === dlcIndex ? { ...dlc, dlc: name } : dlc));
  };

  const handleDeleteDlc = (dlcIndex: number) => {
    setTattoos(prev => prev.filter((_, idx) => idx !== dlcIndex));
  };

  const handleAddTattoo = (dlcIndex: number) => {
    setTattoos(prev => prev.map((dlc, idx) => 
      idx === dlcIndex 
        ? { ...dlc, tattoos: [...(dlc.tattoos || []), { label: '', hashMale: '', hashFemale: '', zone: 'ZONE_TORSO', zoneIndex: 0 }] }
        : dlc
    ));
  };

  const handleUpdateTattooField = (dlcIndex: number, tattooIndex: number, field: keyof TattooEntry, value: string | number) => {
    setTattoos(prev => prev.map((dlc, dIdx) => 
      dIdx === dlcIndex
        ? {
            ...dlc,
            tattoos: (dlc.tattoos || []).map((t, tIdx) => tIdx === tattooIndex ? { ...t, [field]: value } : t)
          }
        : dlc
    ));
  };

  const handleUpdateTattooZone = (dlcIndex: number, tattooIndex: number, zoneValue: string | null) => {
    const zone = tattooZoneOptions.find((z) => z.value === zoneValue) || tattooZoneOptions[0];
    setTattoos(prev => prev.map((dlc, dIdx) =>
      dIdx === dlcIndex
        ? {
            ...dlc,
            tattoos: (dlc.tattoos || []).map((t, tIdx) =>
              tIdx === tattooIndex ? { ...t, zone: zone.value, zoneIndex: zone.zoneIndex } : t
            )
          }
        : dlc
    ));
  };

  const handleDeleteTattoo = (dlcIndex: number, tattooIndex: number) => {
    setTattoos(prev => prev.map((dlc, dIdx) =>
      dIdx === dlcIndex
        ? { ...dlc, tattoos: (dlc.tattoos || []).filter((_, tIdx) => tIdx !== tattooIndex) }
        : dlc
    ));
  };

  const handleSaveTattoos = () => {
    TriggerNuiCallback('saveTattoos', tattoos).then(() => {});
  };

  const handleImportTattoos = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Handle both array of tattoo objects and DLC pack format
        let imported: TattooDLC[] = [];
        
        if (Array.isArray(data)) {
          if (data[0]?.dlc) {
            // Already in DLC format
            imported = data.map((dlc: any) => ({
              dlc: dlc.dlc || '',
              tattoos: (dlc.tattoos || []).map((t: any) => ({
                label: t.label || t.name || t.hashMale || '',
                hashMale: t.hashMale || t.hash || '',
                hashFemale: t.hashFemale || t.hash || '',
                zone: t.zone || 'ZONE_TORSO',
                zoneIndex: typeof t.zoneIndex === 'number' ? t.zoneIndex : 0,
                price: typeof t.price === 'number' ? t.price : undefined,
              })),
            }));
          } else if (data[0]?.hashMale || data[0]?.name) {
            // Individual tattoo array (rcore format), group by collection/zone
            const byCollection: Record<string, TattooEntry[]> = {};
            data.forEach((tattoo: any) => {
              const dlcKey = tattoo.collection || tattoo.dlc || 'Default';
              if (!byCollection[dlcKey]) byCollection[dlcKey] = [];
              byCollection[dlcKey].push({
                label: tattoo.name || tattoo.label || tattoo.hashMale || '',
                hashMale: tattoo.hashMale || tattoo.hash || '',
                hashFemale: tattoo.hashFemale || tattoo.hash || '',
                zone: tattoo.zone || 'ZONE_TORSO',
                zoneIndex: typeof tattoo.zoneIndex === 'number' ? tattoo.zoneIndex : (tattoo.zone ? tattooZoneOptions.findIndex((z) => z.value === tattoo.zone) : 0),
                price: typeof tattoo.price === 'number' ? tattoo.price : undefined,
              });
            });
            imported = Object.entries(byCollection).map(([dlcName, entries]) => ({
              dlc: dlcName,
              tattoos: entries,
            }));
          }
        }
        
        if (imported.length > 0) {
          setTattoos([...tattoos, ...imported]);
        }
      } catch (err) {
        console.error('Failed to import tattoos:', err);
        alert('Failed to import tattoos. Check console for details.');
      }
    };
    input.click();
  };

  // Memoize grouped restrictions to avoid expensive recalculation during renders
  const groupedRestrictions = useMemo(() => {
    if (!Array.isArray(restrictions)) return {};
    return restrictions.reduce((acc, r) => {
      // Use citizenid/playerName if available for identifier-only restrictions
      let key: string;
      if (r.citizenid && r.playerName) {
        key = `${r.citizenid} (${r.playerName})`;
      } else if (r.citizenid) {
        key = r.citizenid;
      } else if (r.identifier && !r.job && !r.gang) {
        // Identifier-only restriction without player info yet
        key = 'Player';
      } else {
        key = r.group || r.job || r.gang || 'Player';
      }
      
      const identifierKey = r.identifier || 'all';
      if (!acc[key]) acc[key] = {};
      if (!acc[key][identifierKey]) acc[key][identifierKey] = [];
      acc[key][identifierKey].push(r);
      return acc;
    }, {} as Record<string, Record<string, ClothingRestriction[]>>);
  }, [restrictions]);

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
      {!menuMounted ? (
        <div style={{ textAlign: 'center' }}>
          <Loader color="blue" size="xl" />
          <Text c="white" mt="lg" size="md">{locale.ADMIN_MSG_LOADING || 'Loading admin menu...'}</Text>
        </div>
      ) : (
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
            {locale.ADMIN_MENU_TITLE || 'Appearance Admin Menu'}
          </Text>
          <Button onClick={handleClose} variant="subtle" color="red">
            {locale.CLOSE_TITLE || 'Close'}
          </Button>
        </Group>

        <div style={{ position: 'relative' }}>
        <Tabs value={activeTab} onTabChange={handleTabChange} color="blue">
          <Tabs.List>
            <Tabs.Tab value="theme">
              <IconPalette size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_THEME || 'Appearance Settings'}
            </Tabs.Tab>
            <Tabs.Tab value="settings">
              <IconAdjustments size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_CONFIG || 'Config'}
            </Tabs.Tab>
            <Tabs.Tab value="restrictions">
              <IconLock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_RESTRICTIONS || 'Restrictions'}
            </Tabs.Tab>
            <Tabs.Tab value="models">
              <IconUser size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_MODELS || 'Models'}
            </Tabs.Tab>
            <Tabs.Tab value="tattoos">
              <IconFeather size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_TATTOOS || 'Tattoos'}
            </Tabs.Tab>
            <Tabs.Tab value="zones">
              <IconMapPin size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_ZONES || 'Zones'}
            </Tabs.Tab>
            <Tabs.Tab value="outfits">
              <IconHanger size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {locale.ADMIN_TAB_OUTFITS || 'Outfits'}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theme" pt="xl">
            <ThemeTab
              theme={theme}
              setTheme={setTheme}
              onSave={handleSaveThemeAndShape}
              isLoading={isLoadingTab && activeTab === 'theme'}
              isReady={dataLoadProgress.theme && themeReady}
            />
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="xl">
            <Suspense
                fallback={
                  <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <Loader color="blue" size="md" />
                    <Text c="gray.4" mt="md" size="sm">{locale.ADMIN_MSG_LOADING_SETTINGS || 'Loading settings...'}</Text>
                  </Box>
                }
              >
                <SettingsTab
                  appearanceSettings={appearanceSettings}
                  setAppearanceSettings={setAppearanceSettings}
                  initialClothes={initialClothes}
                  setInitialClothes={setInitialClothes}
                  locale={locale}
                  isLoading={isLoadingTab && activeTab === 'settings'}
                />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="restrictions" pt="xl">
            <Suspense
                fallback={
                  <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <Loader color="blue" size="md" />
                    <Text c="gray.4" mt="md" size="sm">{locale.ADMIN_MSG_LOADING_RESTRICTIONS || 'Loading restrictions...'}</Text>
                  </Box>
                }
              >
                <RestrictionsTab
                  restrictions={restrictions}
                  setRestrictions={setRestrictions}
                  groupedRestrictions={groupedRestrictions}
                  models={models}
                  expandedRestriction={expandedRestriction}
                  setExpandedRestriction={setExpandedRestriction}
                  isLoading={!dataLoadProgress.restrictions}
                  isReady={true}
                  locale={locale}
                  categoryOptionsByPart={categoryOptionsByPart}
                />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="models" pt="xl">
            <Suspense
                fallback={
                  <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <Loader color="blue" size="md" />
                    <Text c="gray.4" mt="md" size="sm">{locale.ADMIN_MSG_LOADING_MODELS || 'Loading models...'}</Text>
                  </Box>
                }
              >
                <ModelsTab
                  models={models}
                  setModels={setModels}
                  selectedModels={selectedModels}
                  setSelectedModels={setSelectedModels}
                  lockedModelsSaved={lockedModelsSaved}
                  setLockedModelsSaved={setLockedModelsSaved}
                  isLoading={!dataLoadProgress.models}
                  isReady={true}
                  locale={locale}
                />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="tattoos" pt="xl">
            <Suspense
                fallback={
                  <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <Loader color="blue" size="md" />
                    <Text c="gray.4" mt="md" size="sm">{locale.ADMIN_MSG_LOADING_TATTOOS || 'Loading tattoos...'}</Text>
                  </Box>
                }
              >
                <TattoosTab
                  tattoos={tattoos}
                  setTattoos={setTattoos}
                  expandedDlc={expandedDlc}
                  setExpandedDlc={setExpandedDlc}
                  isLoading={!dataLoadProgress.tattoos}
                  isReady={true}
                  locale={locale}
                  tattooZoneOptions={tattooZoneOptions}
                />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="zones" pt="xl">
            <ZonesTab
              zones={zones}
              setZones={setZones}
              onOpenZoneModal={openZoneModal}
              appearanceSettings={appearanceSettings}
              locale={locale}
            />
          </Tabs.Panel>

          <Tabs.Panel value="outfits" pt="xl">
            <OutfitsTab
              outfits={outfits}
              setOutfits={setOutfits}
              setAddOutfitModalOpen={setAddOutfitModalOpen}
            />
          </Tabs.Panel>

        </Tabs>

        {isLoadingTab && !addOutfitModalOpen && (
          <Overlay
            opacity={0.6}
            color="#000"
            zIndex={100}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            <Loader color="blue" size="lg" />
          </Overlay>
        )}
        </div>

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

        <AddZoneModal
          opened={addZoneModalOpen}
          onClose={() => {
            setAddZoneModalOpen(false);
            setEditingZone(null);
            // Don't clear capture data immediately - let the modal handle it
          }}
          onSaveZone={handleSaveZone}
          editingZone={editingZone}
          appearanceSettings={appearanceSettings}
          isCapturing={captureActive}
          onStartCapture={handleStartCapture}
          capturedCoords={capturedCoords}
          capturedPolyzonePoints={capturedPolyzonePoints}
          onClearCaptureData={clearCaptureData}
          formData={zoneFormData}
          onFormDataChange={setZoneFormData}
        />

        <AddOutfitModal
          opened={addOutfitModalOpen}
          onClose={() => setAddOutfitModalOpen(false)}
          onAddOutfit={(outfit) => setOutfits([...outfits, outfit])}
        />

        {/* JSON editor removed */}
      </div>
      )}
    </div>
  );
};
