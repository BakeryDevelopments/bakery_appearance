import { FC } from 'react';
import { Stack, Group, Text, Button, Box, Badge, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '../icons/Icons';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any;
}

interface OutfitsTabProps {
  outfits: JobOutfit[];
  setOutfits: (outfits: JobOutfit[]) => void;
  setAddOutfitModalOpen: (open: boolean) => void;
}

export const OutfitsTab: FC<OutfitsTabProps> = ({
  outfits,
  setOutfits,
  setAddOutfitModalOpen,
}) => {
  return (
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
  );
};
