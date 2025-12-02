import { FC, useEffect, useState } from 'react';
import { Tabs, ColorPicker, Button, Stack, Group, Text, TextInput, Select, ActionIcon, Modal, Checkbox, Accordion, Badge, Box } from '@mantine/core';
import { IconPalette, IconLock, IconPlus, IconTrash, IconChevronDown, IconUser } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import { CameraShape } from './micro/CameraShape';

interface ThemeConfig {
  primaryColor: string; // Active tab color
  inactiveColor: string; // Inactive tab color
}

interface ShapeConfig {
  type: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
}

interface ClothingRestriction {
  id: string;
  job?: string;
  gang?: string;
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

type PartType = 'model' | 'drawable' | 'prop';

export const AdminMenu: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
  });
  const [shape, setShape] = useState<ShapeConfig>({ type: 'hexagon' });
  const [restrictions, setRestrictions] = useState<ClothingRestriction[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRestriction, setNewRestriction] = useState<Partial<ClothingRestriction>>({
    gender: 'male',
    type: 'clothing',
  });

  const [texturesAll, setTexturesAll] = useState<boolean>(true);
  const [texturesInput, setTexturesInput] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [addModelModalOpen, setAddModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState<string>('');

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
    console.log('[AdminMenu] setVisibleAdminMenu received:', visible);
    setIsVisible(visible);
  });

  HandleNuiMessage<ClothingRestriction[]>('setRestrictions', (data) => {
    setRestrictions(data);
  });

  // no JSON sets

  HandleNuiMessage<ThemeConfig>('setThemeConfig', (data) => {
    setTheme(data);
  });

  HandleNuiMessage<ShapeConfig>('setShapeConfig', (data) => {
    setShape(data);
  });

  HandleNuiMessage<string[]>('setModels', (data) => {
    setModels(data);
  });

  useEffect(() => {}, [isVisible]);

  const handleSaveThemeAndShape = () => {
    TriggerNuiCallback('saveTheme', theme).then(() => {
      console.log('Theme saved');
    });
    TriggerNuiCallback('saveShape', shape).then(() => {
      console.log('Shape saved');
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
    console.log('[AdminMenu] Closing admin menu');
    TriggerNuiCallback('closeAdminMenu', {});
    setIsVisible(false);
  };

  console.log('[AdminMenu] Render - isVisible:', isVisible);

  if (!isVisible) return null;

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
                  value={shape.type}
                  onChange={(value) => {
                    if (value === 'hexagon' || value === 'circle' || value === 'square' || value === 'diamond' || value === 'pentagon') {
                      setShape({ type: value });
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
                          type={shape.type}
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
                          type={shape.type}
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
                Save Appearance Settings
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
                      // Group restrictions by job/gang, then by identifier
                      const grouped = restrictions.reduce((acc, r) => {
                        const key = r.job || r.gang || 'Unknown';
                        const identifierKey = r.identifier || 'all';
                        if (!acc[key]) acc[key] = {};
                        if (!acc[key][identifierKey]) acc[key][identifierKey] = [];
                        acc[key][identifierKey].push(r);
                        return acc;
                      }, {} as Record<string, Record<string, ClothingRestriction[]>>);

                      return Object.entries(grouped).map(([jobGang, identifierGroups]) => {
                        const totalCount = Object.values(identifierGroups).flat().length;
                        const type = restrictions.find(r => (r.job || r.gang) === jobGang)?.job ? 'Job' : 'Gang';
                        
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
                <Text c="white" fw={500}>
                  Available Player Models
                </Text>
                <Button onClick={() => setAddModelModalOpen(true)}>
                  <IconPlus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Add Model
                </Button>
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
                        return (
                          <Group
                            key={idx}
                            position="apart"
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                              borderRadius: 6,
                              border: isFreemode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <Group spacing="sm">
                              <IconUser size={18} color={isFreemode ? '#3b82f6' : '#888'} />
                              <Text c="white" fw={isFreemode ? 600 : 500}>
                                {model}
                              </Text>
                              {isFreemode && (
                                <Badge size="xs" color="blue" variant="light">
                                  Protected
                                </Badge>
                              )}
                            </Group>
                            {!isFreemode && (
                              <ActionIcon 
                                color="red" 
                                onClick={() => {
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

        {/* JSON editor removed */}
      </div>
    </div>
  );
};
