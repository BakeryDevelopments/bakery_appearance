import { FC, useState, Dispatch, SetStateAction } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Box, Stack, Group, Text, Button, Accordion, Badge, ActionIcon, Modal, TextInput, Select, Checkbox, Loader } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface ClothingRestriction {
  id: string;
  group?: string;
  job?: string;
  gang?: string;
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

type PartType = 'model' | 'drawable' | 'prop';

interface RestrictionsTabProps {
  restrictions: ClothingRestriction[];
  setRestrictions: Dispatch<SetStateAction<ClothingRestriction[]>>;
  groupedRestrictions: Record<string, Record<string, ClothingRestriction[]>>;
  locale: { [key: string]: string };
  categoryOptionsByPart: Record<PartType, { value: string; label: string }[]>;
  models: string[];
  expandedRestriction: string | null;
  setExpandedRestriction: (value: string | null) => void;
  isLoading: boolean;
  isReady: boolean;
}

export const RestrictionsTab: FC<RestrictionsTabProps> = ({
  restrictions,
  setRestrictions,
  groupedRestrictions,
  locale,
  categoryOptionsByPart,
  models,
  expandedRestriction,
  setExpandedRestriction,
  isLoading,
  isReady,
}) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRestriction, setNewRestriction] = useState<Partial<ClothingRestriction>>({
    gender: 'male',
    type: 'clothing',
  });
  const [texturesAll, setTexturesAll] = useState<boolean>(true);
  const [texturesInput, setTexturesInput] = useState<string>('');

  const handleAddRestriction = async () => {
    if (!newRestriction.itemId || (!newRestriction.job && !newRestriction.gang && !newRestriction.identifier)) return;

    const part: PartType = (newRestriction.part as PartType) || 'drawable';
    const category = part === 'model' ? 'model' : newRestriction.category;
    const textures = texturesAll
      ? undefined
      : texturesInput
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));

    let citizenid: string | undefined;
    let playerName: string | undefined;

    // Fetch player info if identifier is provided
    if (newRestriction.identifier && !newRestriction.job && !newRestriction.gang) {
      const playerInfo = await TriggerNuiCallback<{ citizenid: string; name: string }>('getPlayerInfo', newRestriction.identifier);
      if (playerInfo) {
        citizenid = playerInfo.citizenid;
        playerName = playerInfo.name;
      }
    }

    const restriction: ClothingRestriction = {
      id: `${Date.now()}-${Math.random()}`,
      job: newRestriction.job,
      gang: newRestriction.gang,
      identifier: newRestriction.identifier,
      citizenid,
      playerName,
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

  if (isLoading || !isReady) {
    return (
      <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
        <Loader color="blue" size="md" />
        <Text c="dimmed" mt="md" size="sm">Loading restrictions...</Text>
      </Box>
    );
  }

  return (
    <>
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
              value={expandedRestriction}
              onChange={setExpandedRestriction}
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
                try {
                  if (!Array.isArray(restrictions)) {
                    console.error('Restrictions is not an array:', restrictions);
                    return (
                      <Box style={{ padding: '1rem', textAlign: 'center', color: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 8 }}>
                        Invalid restrictions data format
                      </Box>
                    );
                  }

                  return Object.entries(groupedRestrictions).map(([jobGang, identifierGroups]) => {
                    const totalCount = Object.values(identifierGroups).flat().length;
                    // Get the first restriction to determine the type
                    const firstRestriction = Object.values(identifierGroups).flat()[0];
                    let type = 'Player';
                    let displayName = jobGang;
                    
                    if (firstRestriction) {
                      if (firstRestriction.job) {
                        type = 'Job';
                      } else if (firstRestriction.gang) {
                        type = 'Gang';
                      } else if (firstRestriction.citizenid || firstRestriction.playerName) {
                        type = 'Player';
                        // jobGang already contains the formatted string from AdminMenu grouping
                      }
                    }
                  
                    return (
                      <Accordion.Item key={jobGang} value={jobGang}>
                        <Accordion.Control>
                          <Group position="apart" style={{ width: '100%', paddingRight: '1rem' }}>
                            <Group spacing="sm">
                              <Text fw={600} c="white" tt="capitalize">
                                {displayName}
                              </Text>
                              <Badge size="sm" color={type === 'Job' ? 'blue' : type === 'Gang' ? 'purple' : 'cyan'} variant="light">
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
                                <Virtuoso
                                  style={{ height: Math.min(Math.max(items.length * 60, 220), 520) }}
                                  totalCount={items.length}
                                  itemContent={(itemIdx) => {
                                    const r = items[itemIdx];
                                    return (
                                      <Group
                                        key={r.id}
                                        position="apart"
                                        style={{
                                          padding: '0.5rem',
                                          backgroundColor: 'rgba(255,255,255,0.02)',
                                          borderRadius: 4,
                                          border: '1px solid rgba(255,255,255,0.05)',
                                          marginBottom: '4px',
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
                                        <Group spacing="xs">
                                          <Badge size="xs" color="gray" variant="outline">
                                            {r.identifier ? 'Identifier only' : 'All players'}
                                          </Badge>
                                          <ActionIcon color="red" onClick={() => handleDeleteRestriction(r.id)}>
                                            <IconTrash size={16} />
                                          </ActionIcon>
                                        </Group>
                                      </Group>
                                    );
                                  }}
                                />
                              </Box>
                            ))}
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  });
                } catch (error) {
                  console.error('Error rendering restrictions:', error);
                  return (
                    <Box style={{ padding: '1rem', textAlign: 'center', color: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 8 }}>
                      Failed to render restrictions
                    </Box>
                  );
                }
              })()}
            </Accordion>
          )}
        </div>

        <Modal 
          opened={addModalOpen} 
          onClose={() => setAddModalOpen(false)} 
          title="Add Restriction" 
          centered
          zIndex={10000}
        >
          <Stack spacing="sm">
            <Group grow>
              <TextInput
                label="Job"
                placeholder="police"
                value={newRestriction.job || ''}
                onChange={(e) => setNewRestriction({ ...newRestriction, job: e.target.value || undefined, gang: undefined })}
              />
              <TextInput
                label="Gang"
                placeholder="ballas"
                 value={newRestriction.gang || ''}
                 onChange={(e) => setNewRestriction({ ...newRestriction, gang: e.target.value || undefined, job: undefined })}
               />
             </Group>

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
              <>
                <Select
                  label="Category"
                  value={newRestriction.category || ''}
                  onChange={(value) =>
                    setNewRestriction({ ...newRestriction, category: value || undefined })
                  }
                  data={categoryOptionsByPart[(newRestriction.part as PartType) || 'drawable']}
                  placeholder="Select category"
                />

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
      </Stack>
    </>
  );
};
