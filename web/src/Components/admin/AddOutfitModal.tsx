import { FC, useState } from 'react';
import { Modal, Stack, Group, Button, TextInput, Select, Text } from '@mantine/core';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any;
}

interface AddOutfitModalProps {
  opened: boolean;
  onClose: () => void;
  onAddOutfit: (outfit: JobOutfit) => void;
}

export const AddOutfitModal: FC<AddOutfitModalProps> = ({ opened, onClose, onAddOutfit }) => {
  const [newOutfit, setNewOutfit] = useState<Partial<JobOutfit>>({ gender: 'male' });
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setNewOutfit({ gender: 'male' });
    onClose();
  };

  const handleAdd = () => {
    if (!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang)) return;

    setIsLoading(true);

    // First, request the current player's appearance data from the client
    TriggerNuiCallback('getAppearanceData', {}).then((appearanceData: any) => {
      // Extract only components and props from the appearance data
      const outfitData = {
        components: appearanceData?.components || {},
        props: appearanceData?.props || {},
      };

      const outfitToSave: Partial<JobOutfit> = {
        ...newOutfit,
        outfitData,
      };

      TriggerNuiCallback('addOutfit', outfitToSave).then((result: any) => {
        const newOutfitItem: JobOutfit = {
          ...outfitToSave,
          ...result,
          id: Date.now(),
        } as JobOutfit;
        onAddOutfit(newOutfitItem);
        setIsLoading(false);
        handleClose();
      }).catch((error) => {
        console.error('Failed to add outfit:', error);
        setIsLoading(false);
      });
    }).catch((error) => {
      console.error('Failed to get appearance data:', error);
      setIsLoading(false);
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
          disabled={isLoading}
        />
        <Select
          label="Gender"
          value={newOutfit.gender || 'male'}
          onChange={(value) => setNewOutfit({ ...newOutfit, gender: value as 'male' | 'female' })}
          data={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          disabled={isLoading}
        />
        <TextInput
          label="Job (Optional)"
          placeholder="police"
          description="Leave blank if this is for a gang"
          value={newOutfit.job || ''}
          onChange={(e) => setNewOutfit({ ...newOutfit, job: e.target.value || undefined })}
          disabled={isLoading}
        />
        <TextInput
          label="Gang (Optional)"
          placeholder="ballas"
          description="Leave blank if this is for a job"
          value={newOutfit.gang || ''}
          onChange={(e) => setNewOutfit({ ...newOutfit, gang: e.target.value || undefined })}
          disabled={isLoading}
        />
        <Text c="dimmed" size="xs">
          Note: Outfit appearance data will be captured from your current character when you save.
        </Text>
        <Group position="right" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang) || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Saving...' : 'Add'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
