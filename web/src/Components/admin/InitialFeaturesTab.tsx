import { FC, useCallback, memo, useMemo, useState } from 'react';
import { Stack, Group, Text, Box, Button, Divider, SimpleGrid } from '@mantine/core';
import { IconMars, IconVenus } from '../icons/Icons';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface HeritageData {
  shapeFirst?: number;
  shapeSecond?: number;
  shapeThird?: number;
  skinFirst?: number;
  skinSecond?: number;
  skinThird?: number;
  shapeMix?: number;
  skinMix?: number;
  thirdMix?: number;
}

interface FeaturesConfig {
  headBlend?: HeritageData;
}

interface InitialFeaturesTabProps {
  initialFeatures: {
    male: FeaturesConfig;
    female: FeaturesConfig;
  };
  setInitialFeatures: (features: { male: FeaturesConfig; female: FeaturesConfig }) => void;
  locale: any;
}

// Memoized component for family face/skin slider
const FamilyMemberSlider = memo(({
  label,
  faceValue,
  skinValue,
  onFaceChange,
  onSkinChange,
}: {
  label: string;
  faceValue: number;
  skinValue: number;
  onFaceChange: (val: number) => void;
  onSkinChange: (val: number) => void;
}) => (
  <Box>
    <Text size="sm" ta="right" c="gray.4" mb="0.625rem">{label}</Text>
    <Group spacing="md">
      <Box style={{ flex: 1 }}>
        <Text size="xs" mb="0.5rem" c="gray.4">Face</Text>
        <Group spacing="0.75rem" align="center">
          <Box
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.375rem 0.625rem',
              minWidth: '2.5rem',
              textAlign: 'center',
              height: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.125rem'
            }}
          >
            <Text size="xs" c="white" fw={500}>{Math.floor(faceValue)}</Text>
          </Box>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={faceValue}
            onChange={(e) => onFaceChange(parseInt(e.currentTarget.value))}
            style={{
              flex: 1,
              accentColor: '#4dabf7',
              height: '0.375rem',
              cursor: 'pointer'
            }}
          />
          <Text size="xs" c="gray.4">Total: 46</Text>
        </Group>
      </Box>
      <Box style={{ flex: 1 }}>
        <Text size="xs" mb="0.5rem" c="gray.4">Skin</Text>
        <Group spacing="0.75rem" align="center">
          <Box
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.375rem 0.625rem',
              minWidth: '2.5rem',
              textAlign: 'center',
              height: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.125rem'
            }}
          >
            <Text size="xs" c="white" fw={500}>{Math.floor(skinValue)}</Text>
          </Box>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={skinValue}
            onChange={(e) => onSkinChange(parseInt(e.currentTarget.value))}
            style={{
              flex: 1,
              accentColor: '#4dabf7',
              height: '0.375rem',
              cursor: 'pointer'
            }}
          />
          <Text size="xs" c="gray.4">Total: 45</Text>
        </Group>
      </Box>
    </Group>
  </Box>
));

FamilyMemberSlider.displayName = 'FamilyMemberSlider';

// Memoized component for mix percentage slider
const MixSlider = memo(({
  label,
  value,
  onChange,
  leftLabel = 'Mother',
  rightLabel = 'Father',
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}) => (
  <Box>
    <Text size="sm" ta="right" c="gray.4" mb="0.625rem">{label}</Text>
    <Group spacing="0.75rem" align="center">
      <Box
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.375rem 0.625rem',
          minWidth: '3.375rem',
          textAlign: 'center',
          height: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.125rem'
        }}
      >
        <Text size="xs" c="white" fw={500}>{leftLabel} {Math.floor((1 - value) * 100)}%</Text>
      </Box>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.currentTarget.value))}
        style={{
          flex: 1,
          accentColor: '#4dabf7',
          height: '0.375rem',
          cursor: 'pointer'
        }}
      />
      <Box
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.375rem 0.625rem',
          minWidth: '3.375rem',
          textAlign: 'center',
          height: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.125rem'
        }}
      >
        <Text size="xs" c="white" fw={500}>{rightLabel} {Math.floor(value * 100)}%</Text>
      </Box>
    </Group>
  </Box>
));

MixSlider.displayName = 'MixSlider';


const InitialFeaturesTabComponent: FC<InitialFeaturesTabProps> = ({
  initialFeatures,
  setInitialFeatures,
  locale,
}) => {
  const [isGrabbingMale, setIsGrabbingMale] = useState(false);
  const [isGrabbingFemale, setIsGrabbingFemale] = useState(false);

  // Male handlers
  const handleMaleChange = useCallback((key: keyof HeritageData) => (val: number) => {
    setInitialFeatures({
      ...initialFeatures,
      male: {
        ...initialFeatures.male,
        headBlend: {
          ...(initialFeatures.male.headBlend || {}),
          [key]: val,
        },
      },
    });
  }, [initialFeatures, setInitialFeatures]);

  // Female handlers
  const handleFemaleChange = useCallback((key: keyof HeritageData) => (val: number) => {
    setInitialFeatures({
      ...initialFeatures,
      female: {
        ...initialFeatures.female,
        headBlend: {
          ...(initialFeatures.female.headBlend || {}),
          [key]: val,
        },
      },
    });
  }, [initialFeatures, setInitialFeatures]);

  // Grab current appearance handlers
  const handleGrabMaleFeatures = useCallback(() => {
    setIsGrabbingMale(true);
    TriggerNuiCallback('getAppearanceData', {}).then((appearanceData: any) => {
      setInitialFeatures({
        ...initialFeatures,
        male: {
          ...initialFeatures.male,
          headBlend: appearanceData?.headBlend || {},
        },
      });
      setIsGrabbingMale(false);
    }).catch((error) => {
      console.error('Failed to grab male features:', error);
      setIsGrabbingMale(false);
    });
  }, [initialFeatures, setInitialFeatures]);

  const handleGrabFemaleFeatures = useCallback(() => {
    setIsGrabbingFemale(true);
    TriggerNuiCallback('getAppearanceData', {}).then((appearanceData: any) => {
      setInitialFeatures({
        ...initialFeatures,
        female: {
          ...initialFeatures.female,
          headBlend: appearanceData?.headBlend || {},
        },
      });
      setIsGrabbingFemale(false);
    }).catch((error) => {
      console.error('Failed to grab female features:', error);
      setIsGrabbingFemale(false);
    });
  }, [initialFeatures, setInitialFeatures]);

  const maleBlend = initialFeatures.male.headBlend || {};
  const femaleBlend = initialFeatures.female.headBlend || {};

  const columnContent = (
    gender: 'male' | 'female',
    blend: HeritageData,
    isGrabbing: boolean,
    onGrab: () => void,
    onChange: (key: keyof HeritageData) => (val: number) => void
  ) => (
    <Stack spacing="lg">
      <Group spacing="xs">
        {gender === 'male' ? (
          <>
            <IconMars size={18} color="#4dabf7" />
            <Text c="white" fw={600} size="sm">Male</Text>
          </>
        ) : (
          <>
            <IconVenus size={18} color="#ff6b9d" />
            <Text c="white" fw={600} size="sm">Female</Text>
          </>
        )}
      </Group>

      <Button
        size="xs"
        variant="light"
        onClick={onGrab}
        loading={isGrabbing}
        fullWidth
      >
        Grab Current
      </Button>

      <Stack spacing="lg">
        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">MOTHER</Text>
          <FamilyMemberSlider
            label="Mother"
            faceValue={blend.shapeSecond ?? 0}
            skinValue={blend.skinSecond ?? 0}
            onFaceChange={onChange('shapeSecond')}
            onSkinChange={onChange('skinSecond')}
          />
        </Box>

        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">FATHER</Text>
          <FamilyMemberSlider
            label="Father"
            faceValue={blend.shapeFirst ?? 0}
            skinValue={blend.skinFirst ?? 0}
            onFaceChange={onChange('shapeFirst')}
            onSkinChange={onChange('skinFirst')}
          />
        </Box>

        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">THIRD PARENT</Text>
          <FamilyMemberSlider
            label="Third"
            faceValue={blend.shapeThird ?? 0}
            skinValue={blend.skinThird ?? 0}
            onFaceChange={onChange('shapeThird')}
            onSkinChange={onChange('skinThird')}
          />
        </Box>

        <Divider />

        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">RESEMBLANCE</Text>
          <MixSlider
            label=""
            value={blend.shapeMix ?? 0}
            onChange={onChange('shapeMix')}
            leftLabel="Mother"
            rightLabel="Father"
          />
        </Box>

        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">THIRD</Text>
          <MixSlider
            label=""
            value={blend.thirdMix ?? 0}
            onChange={onChange('thirdMix')}
            leftLabel=""
            rightLabel=""
          />
        </Box>

        <Box>
          <Text c="white" fw={500} size="sm" mb="sm" ta="right">SKIN MIX</Text>
          <MixSlider
            label=""
            value={blend.skinMix ?? 0}
            onChange={onChange('skinMix')}
            leftLabel="Mother"
            rightLabel="Father"
          />
        </Box>
      </Stack>
    </Stack>
  );

  return (
    <Stack spacing="lg">
      <div>
        <Text c="white" fw={500} size="lg" mb={4}>
          {locale.ADMIN_INITIAL_FEATURES_TITLE || 'Initial Player Heritage'}
        </Text>
        <Text c="gray.4" size="xs">
          {locale.ADMIN_INITIAL_FEATURES_DESC || 'Set default heritage traits that will be applied when a new character is created.'}
        </Text>
      </div>

      <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        {columnContent('male', maleBlend, isGrabbingMale, handleGrabMaleFeatures, handleMaleChange)}
        {columnContent('female', femaleBlend, isGrabbingFemale, handleGrabFemaleFeatures, handleFemaleChange)}
      </SimpleGrid>
    </Stack>
  );
};

export const InitialFeaturesTab = memo(InitialFeaturesTabComponent);
