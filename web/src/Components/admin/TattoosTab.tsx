import { FC, Dispatch, SetStateAction, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Box, Stack, Group, Text, Button, Accordion, Badge, ActionIcon, TextInput, Select, NumberInput, Loader } from '@mantine/core';
import { IconPlus, IconTrash, IconDownload, IconMars, IconVenus, IconSearch } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

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

interface TattoosTabProps {
  tattoos: TattooDLC[];
  setTattoos: Dispatch<SetStateAction<TattooDLC[]>>;
  expandedDlc: string | null;
  setExpandedDlc: (value: string | null) => void;
  isLoading: boolean;
  isReady: boolean;
  locale: { [key: string]: string };
  tattooZoneOptions: { value: string; label: string; zoneIndex: number }[];
}

export const TattoosTab: FC<TattoosTabProps> = ({
  tattoos,
  setTattoos,
  expandedDlc,
  setExpandedDlc,
  isLoading,
  isReady,
  locale,
  tattooZoneOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddDlc = () => {
    setTattoos([...tattoos, { dlc: '', tattoos: [] }]);
  };

  const handleUpdateDlcName = (dlcIndex: number, name: string) => {
    setTattoos((prev: TattooDLC[]) => prev.map((dlc: TattooDLC, idx: number) => idx === dlcIndex ? { ...dlc, dlc: name } : dlc));
  };

  const handleDeleteDlc = (dlcIndex: number) => {
    setTattoos((prev: TattooDLC[]) => prev.filter((_: TattooDLC, idx: number) => idx !== dlcIndex));
  };

  const handleAddTattoo = (dlcIndex: number) => {
    setTattoos((prev: TattooDLC[]) => prev.map((dlc: TattooDLC, idx: number) => 
      idx === dlcIndex 
        ? { ...dlc, tattoos: [...(dlc.tattoos || []), { label: '', hashMale: '', hashFemale: '', zone: 'ZONE_TORSO', zoneIndex: 0 }] }
        : dlc
    ));
  };

  const handleUpdateTattooField = (dlcIndex: number, tattooIndex: number, field: keyof TattooEntry, value: string | number) => {
    setTattoos((prev: TattooDLC[]) => prev.map((dlc: TattooDLC, dIdx: number) => 
      dIdx === dlcIndex
        ? {
            ...dlc,
            tattoos: (dlc.tattoos || []).map((t: TattooEntry, tIdx: number) => tIdx === tattooIndex ? { ...t, [field]: value } : t)
          }
        : dlc
    ));
  };

  const handleUpdateTattooZone = (dlcIndex: number, tattooIndex: number, zoneValue: string | null) => {
    const zone = tattooZoneOptions.find((z) => z.value === zoneValue) || tattooZoneOptions[0];
    setTattoos((prev: TattooDLC[]) => prev.map((dlc: TattooDLC, dIdx: number) =>
      dIdx === dlcIndex
        ? {
            ...dlc,
            tattoos: (dlc.tattoos || []).map((t: TattooEntry, tIdx: number) =>
              tIdx === tattooIndex ? { ...t, zone: zone.value, zoneIndex: zone.zoneIndex } : t
            )
          }
        : dlc
    ));
  };

  const handleDeleteTattoo = (dlcIndex: number, tattooIndex: number) => {
    setTattoos((prev: TattooDLC[]) => prev.map((dlc: TattooDLC, dIdx: number) =>
      dIdx === dlcIndex
        ? { ...dlc, tattoos: (dlc.tattoos || []).filter((_: TattooEntry, tIdx: number) => tIdx !== tattooIndex) }
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
        
        let imported: TattooDLC[] = [];
        
        if (Array.isArray(data)) {
          if (data[0]?.dlc) {
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

  if (isLoading || !isReady) {
    return (
      <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
        <Loader color="blue" size="md" />
        <Text c="gray.4" mt="md" size="sm">Loading tattoos...</Text>
      </Box>
    );
  }

  return (
    <Stack spacing="lg">
      <Group position="apart">
        <Text c="white" fw={500}>
          Tattoo Catalog (DLC Packs)
        </Text>
        <Group>
          <Button size="sm" variant="light" onClick={handleAddDlc}>
            <IconPlus size={14} style={{ marginRight: 8 }} />
            Add DLC Pack
          </Button>
          <Button size="sm" variant="default" onClick={handleImportTattoos}>
            <IconDownload size={14} style={{ marginRight: 8 }} />
            Import JSON
          </Button>
          <Button size="sm" onClick={handleSaveTattoos}>
            Save Tattoos
          </Button>
        </Group>
      </Group>

      <TextInput
        icon={<IconSearch size={14} />}
        placeholder="Search label or hash across all DLCs"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        size="sm"
      />

      {tattoos.length === 0 ? (
        <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          No tattoo DLC packs configured
        </Box>
      ) : (
        <Accordion
          chevronPosition="right"
          variant="separated"
          value={expandedDlc}
          onChange={setExpandedDlc}
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
          {tattoos.map((dlc, dlcIdx) => {
            const filtered = searchTerm
              ? (dlc.tattoos || []).filter((t) => {
                  const term = searchTerm.toLowerCase();
                  return (
                    (t.label || '').toLowerCase().includes(term) ||
                    (t.hashMale || '').toLowerCase().includes(term) ||
                    (t.hashFemale || '').toLowerCase().includes(term)
                  );
                })
              : dlc.tattoos || [];
            const totalCount = filtered.length;

            // Skip rendering this DLC if it has no matches and search is active
            if (searchTerm && totalCount === 0) return null;

            return (
            <Accordion.Item key={`dlc-${dlcIdx}`} value={`dlc-${dlcIdx}`}>
              <Accordion.Control>
                <Group position="apart" style={{ width: '100%', paddingRight: '1rem' }}>
                  <Group spacing="sm">
                    <TextInput
                      placeholder="e.g., mpbeach_overlays"
                      value={dlc.dlc || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateDlcName(dlcIdx, e.currentTarget.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, minWidth: 150 }}
                      size="sm"
                    />
                    <Badge size="lg" color="grape" variant="outline">
                      {totalCount} / {dlc.tattoos?.length || 0} tattoos
                    </Badge>
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack spacing="sm">
                  <Group position="apart">
                    <Text size="sm" c="gray.4">Tattoo Entries (label + hashes)</Text>
                    <Group spacing="xs">
                      <Button size="xs" variant="light" onClick={() => handleAddTattoo(dlcIdx)}>
                        <IconPlus size={12} style={{ marginRight: 4 }} />
                        Add Tattoo
                      </Button>
                      <ActionIcon 
                        color="red" 
                        variant="light" 
                        size="sm"
                        onClick={() => handleDeleteDlc(dlcIdx)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  {(dlc.tattoos || []).length === 0 ? (
                    <Text size="xs" c="gray.4" ta="center" py="md">
                      No tattoos in this DLC pack yet
                    </Text>
                  ) : totalCount === 0 ? (
                    <Text size="xs" c="gray.4" ta="center" py="md">
                      No tattoos match "{searchTerm}"
                    </Text>
                  ) : (
                    <Virtuoso
                      style={{ height: Math.min(Math.max(totalCount * 72, 260), 560) }}
                      totalCount={totalCount}
                      itemContent={(tattooIdx) => {
                        const tattoo = filtered[tattooIdx];
                        return (
                          <Box
                            key={`tattoo-${tattooIdx}`}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: 4,
                              border: '1px solid rgba(255,255,255,0.05)',
                              marginBottom: '6px',
                            }}
                          >
                            <Group position="apart" spacing="xs" mb="4px">
                              <TextInput
                                placeholder="Label"
                                value={tattoo.label || ''}
                                onChange={(e) => handleUpdateTattooField(dlcIdx, tattooIdx, 'label', e.currentTarget.value)}
                                size="xs"
                                style={{ flex: 1 }}
                              />
                              <Select
                                placeholder="Zone"
                                data={tattooZoneOptions}
                                value={tattoo.zone || 'ZONE_TORSO'}
                                onChange={(value) => handleUpdateTattooZone(dlcIdx, tattooIdx, value)}
                                size="xs"
                                style={{ width: 110 }}
                                searchable
                              />
                              <NumberInput
                                placeholder="$"
                                value={typeof tattoo.price === 'number' ? tattoo.price : ''}
                                onChange={(val) => handleUpdateTattooField(dlcIdx, tattooIdx, 'price', val as number)}
                                size="xs"
                                style={{ width: 70 }}
                                min={0}
                              />
                              <ActionIcon size="xs" color="red" variant="subtle" onClick={() => handleDeleteTattoo(dlcIdx, tattooIdx)}>
                                <IconTrash size={12} />
                              </ActionIcon>
                            </Group>

                            <Group spacing="4px">
                              <div style={{ flex: 1 }}>
                                <Group spacing="3px" mb="2px">
                                  <IconMars size={12} color="#3b82f6" />
                                  <Text size="9px" fw={600} c="cyan">M</Text>
                                </Group>
                                <TextInput
                                  placeholder="M hash"
                                  value={tattoo.hashMale || ''}
                                  onChange={(e) => handleUpdateTattooField(dlcIdx, tattooIdx, 'hashMale', e.currentTarget.value)}
                                  size="xs"
                                  styles={{
                                    input: {
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      borderColor: 'rgba(59, 130, 246, 0.3)',
                                      height: '24px',
                                    },
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Group spacing="3px" mb="2px">
                                  <IconVenus size={12} color="#ec4899" />
                                  <Text size="9px" fw={600} c="pink">F</Text>
                                </Group>
                                <TextInput
                                  placeholder="F hash"
                                  value={tattoo.hashFemale || ''}
                                  onChange={(e) => handleUpdateTattooField(dlcIdx, tattooIdx, 'hashFemale', e.currentTarget.value)}
                                  size="xs"
                                  styles={{
                                    input: {
                                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                      borderColor: 'rgba(236, 72, 153, 0.3)',
                                      height: '24px',
                                    },
                                  }}
                                />
                              </div>
                            </Group>
                          </Box>
                        );
                      }}
                    />
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Stack>
  );
};
