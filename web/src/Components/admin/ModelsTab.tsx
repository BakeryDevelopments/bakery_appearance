import { FC, useState, Dispatch, SetStateAction } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Box, Stack, Group, Text, Button, Checkbox, ActionIcon, Modal, TextInput, Badge, Loader } from '@mantine/core';
import { IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface ModelsTabProps {
  models: string[];
  setModels: (models: string[]) => void;
  selectedModels: string[];
  setSelectedModels: Dispatch<SetStateAction<string[]>>;
  lockedModelsSaved: string[];
  setLockedModelsSaved: Dispatch<SetStateAction<string[]>>;
  isLoading: boolean;
  isReady: boolean;
  locale: { [key: string]: string };
}

export const ModelsTab: FC<ModelsTabProps> = ({
  models,
  setModels,
  selectedModels,
  setSelectedModels,
  lockedModelsSaved,
  setLockedModelsSaved,
  isLoading,
  isReady,
  locale,
}) => {
  const [addModelModalOpen, setAddModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState<string>('');

  if (isLoading || !isReady) {
    return (
      <Box style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
        <Loader color="blue" size="md" />
        <Text c="gray.4" mt="md" size="sm">Loading models...</Text>
      </Box>
    );
  }

  const freemodeModels = ['mp_m_freemode_01', 'mp_f_freemode_01'];

  return (
    <>
      <Stack spacing="lg">
        <Group position="apart">
          <Group>
            <Text c="white" fw={500}>
              Available Player Models
            </Text>
            <Checkbox
              label="Select All (Lock from Everyone)"
              description="Check models to lock them from everyone. Unchecked models are available to all players."
              checked={selectedModels.length > 0 && selectedModels.length === models.filter(m => !freemodeModels.includes(m)).length}
              indeterminate={selectedModels.length > 0 && selectedModels.length < models.filter(m => !freemodeModels.includes(m)).length}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setSelectedModels(models.filter(m => !freemodeModels.includes(m)));
                } else {
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
                    const additions = selectedModels.filter(m => !lockedModelsSaved.includes(m));
                    if (additions.length === 0) return;
                    TriggerNuiCallback('addLockedModels', { models: additions }).then((updated) => {
                      setLockedModelsSaved((prev: string[]) => Array.from(new Set([...prev, ...additions])));
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
            <Virtuoso
              style={{ height: Math.min(Math.max(models.length * 56, 260), 620) }}
              totalCount={models.length}
              itemContent={(idx) => {
                const model = models[idx];
                const isFreemode = freemodeModels.includes(model);
                const isSelected = selectedModels.includes(model);
                const isLockedSaved = lockedModelsSaved.includes(model);
                return (
                  <Group
                    key={model}
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
                      setSelectedModels((prev: string[]) =>
                        prev.includes(model)
                          ? prev.filter((m: string) => m !== model)
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
              }}
            />
          )}
        </div>
      </Stack>

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
    </>
  );
};
