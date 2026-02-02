import { FC, useCallback, memo, useMemo } from 'react';
import { Stack, Group, Text, Box, NumberInput, Accordion, TextInput } from '@mantine/core';
import { IconMars, IconVenus } from '@tabler/icons-react';

interface ClothingConfig {
  model: string;
  components: Array<{ drawable: number; texture: number }>;
  props: Array<{ drawable: number; texture: number }>;
  hair: { color: number; highlight: number; style: number; texture: number };
}

interface InitialClothesTabProps {
  initialClothes: {
    male: ClothingConfig;
    female: ClothingConfig;
  };
  setInitialClothes: (clothes: { male: ClothingConfig; female: ClothingConfig }) => void;
  locale: any;
}

// Component names for memoization
const COMPONENT_NAMES = ['Face', 'Mask', 'Hair', 'Upper Body', 'Lower Body', 'Bag', 'Shoes', 'Scarf', 'Shirt', 'Armor', 'Decals', 'Jacket'];
const PROP_NAMES = ['Hat', 'Glasses', 'Ear', 'Watch', 'Bracelet'];
const PROP_INDICES = [0, 1, 2, 6, 7];
const HAIR_NAMES = ['Style', 'Texture', 'Color', 'Highlight'];
const HAIR_KEYS = ['style', 'texture', 'color', 'highlight'] as const;

// Memoized component for clothing component item
const ComponentItem = memo(({ 
  name, 
  idx, 
  drawable, 
  texture, 
  onDrawableChange, 
  onTextureChange 
}: { 
  name: string; 
  idx: number; 
  drawable: number; 
  texture: number;
  onDrawableChange: (val: number) => void;
  onTextureChange: (val: number) => void;
}) => (
  <Group spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
    <Text c="gray.4" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
    <NumberInput
      size="xs"
      value={drawable}
      onChange={onDrawableChange}
      min={0}
      style={{ width: '70px' }}
      hideControls
    />
    <NumberInput
      size="xs"
      value={texture}
      onChange={onTextureChange}
      min={0}
      style={{ width: '70px' }}
      hideControls
    />
  </Group>
));

ComponentItem.displayName = 'ComponentItem';

// Memoized component for prop item
const PropItem = memo(({ 
  name, 
  idx,
  realIdx, 
  drawable, 
  texture, 
  onDrawableChange, 
  onTextureChange 
}: { 
  name: string; 
  idx: number;
  realIdx: number; 
  drawable: number; 
  texture: number;
  onDrawableChange: (val: number) => void;
  onTextureChange: (val: number) => void;
}) => (
  <Group spacing={4} style={{ padding: '4px 8px', backgroundColor: realIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
    <Text c="gray.4" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
    <NumberInput
      size="xs"
      value={drawable}
      onChange={onDrawableChange}
      min={-1}
      style={{ width: '70px' }}
      hideControls
    />
    <NumberInput
      size="xs"
      value={texture}
      onChange={onTextureChange}
      min={-1}
      style={{ width: '70px' }}
      hideControls
    />
  </Group>
));

PropItem.displayName = 'PropItem';

// Memoized component for hair item
const HairItem = memo(({ 
  name, 
  idx,
  value, 
  onChange 
}: { 
  name: string; 
  idx: number;
  value: number;
  onChange: (val: number) => void;
}) => (
  <Group spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
    <Text c="gray.4" size="xs" style={{ width: '80px', flexShrink: 0 }}>{name}</Text>
    <NumberInput
      size="xs"
      value={value}
      onChange={onChange}
      min={0}
      style={{ width: '150px' }}
      hideControls
    />
  </Group>
));

HairItem.displayName = 'HairItem';

const InitialClothesTabComponent: FC<InitialClothesTabProps> = ({
  initialClothes,
  setInitialClothes,
  locale,
}) => {
  // Male handlers
  const handleMaleModelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialClothes({
      ...initialClothes,
      male: { ...initialClothes.male, model: e.currentTarget.value }
    });
  }, [initialClothes, setInitialClothes]);

  const handleMaleComponentDrawable = useCallback((idx: number) => (val: number) => {
    const newComps = [...initialClothes.male.components];
    newComps[idx] = { drawable: val, texture: newComps[idx]?.texture ?? 0 };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, components: newComps } });
  }, [initialClothes, setInitialClothes]);

  const handleMaleComponentTexture = useCallback((idx: number) => (val: number) => {
    const newComps = [...initialClothes.male.components];
    newComps[idx] = { drawable: newComps[idx]?.drawable ?? 0, texture: val };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, components: newComps } });
  }, [initialClothes, setInitialClothes]);

  const handleMalePropDrawable = useCallback((realIdx: number) => (val: number) => {
    const newProps = [...initialClothes.male.props];
    newProps[realIdx] = { drawable: val, texture: newProps[realIdx]?.texture ?? -1 };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleMalePropTexture = useCallback((realIdx: number) => (val: number) => {
    const newProps = [...initialClothes.male.props];
    newProps[realIdx] = { drawable: newProps[realIdx]?.drawable ?? -1, texture: val };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleMaleHairChange = useCallback((key: typeof HAIR_KEYS[number]) => (val: number) => {
    setInitialClothes({
      ...initialClothes,
      male: { ...initialClothes.male, hair: { ...initialClothes.male.hair, [key]: val } }
    });
  }, [initialClothes, setInitialClothes]);

  // Female handlers
  const handleFemaleModelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialClothes({
      ...initialClothes,
      female: { ...initialClothes.female, model: e.currentTarget.value }
    });
  }, [initialClothes, setInitialClothes]);

  const handleFemaleComponentDrawable = useCallback((idx: number) => (val: number) => {
    const newComps = [...initialClothes.female.components];
    newComps[idx] = { drawable: val, texture: newComps[idx]?.texture ?? 0 };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, components: newComps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemaleComponentTexture = useCallback((idx: number) => (val: number) => {
    const newComps = [...initialClothes.female.components];
    newComps[idx] = { drawable: newComps[idx]?.drawable ?? 0, texture: val };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, components: newComps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemalePropDrawable = useCallback((realIdx: number) => (val: number) => {
    const newProps = [...initialClothes.female.props];
    newProps[realIdx] = { drawable: val, texture: newProps[realIdx]?.texture ?? -1 };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemalePropTexture = useCallback((realIdx: number) => (val: number) => {
    const newProps = [...initialClothes.female.props];
    newProps[realIdx] = { drawable: newProps[realIdx]?.drawable ?? -1, texture: val };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemaleHairChange = useCallback((key: typeof HAIR_KEYS[number]) => (val: number) => {
    setInitialClothes({
      ...initialClothes,
      female: { ...initialClothes.female, hair: { ...initialClothes.female.hair, [key]: val } }
    });
  }, [initialClothes, setInitialClothes]);

  // Memoize component lists to prevent unnecessary re-renders
  const maleComponents = useMemo(() => (
    COMPONENT_NAMES.map((name, idx) => (
      <ComponentItem
        key={`male-comp-${idx}`}
        name={name}
        idx={idx}
        drawable={initialClothes.male.components[idx]?.drawable ?? 0}
        texture={initialClothes.male.components[idx]?.texture ?? 0}
        onDrawableChange={handleMaleComponentDrawable(idx)}
        onTextureChange={handleMaleComponentTexture(idx)}
      />
    ))
  ), [initialClothes.male.components, handleMaleComponentDrawable, handleMaleComponentTexture]);

  const maleProps = useMemo(() => (
    PROP_NAMES.map((name, realIdx) => {
      const idx = PROP_INDICES[realIdx];
      return (
        <PropItem
          key={`male-prop-${idx}`}
          name={name}
          idx={idx}
          realIdx={realIdx}
          drawable={initialClothes.male.props[realIdx]?.drawable ?? -1}
          texture={initialClothes.male.props[realIdx]?.texture ?? -1}
          onDrawableChange={handleMalePropDrawable(realIdx)}
          onTextureChange={handleMalePropTexture(realIdx)}
        />
      );
    })
  ), [initialClothes.male.props, handleMalePropDrawable, handleMalePropTexture]);

  const maleHair = useMemo(() => (
    HAIR_NAMES.map((name, idx) => {
      const key = HAIR_KEYS[idx];
      return (
        <HairItem
          key={`male-hair-${key}`}
          name={name}
          idx={idx}
          value={initialClothes.male.hair[key] ?? 0}
          onChange={handleMaleHairChange(key)}
        />
      );
    })
  ), [initialClothes.male.hair, handleMaleHairChange]);

  const femaleComponents = useMemo(() => (
    COMPONENT_NAMES.map((name, idx) => (
      <ComponentItem
        key={`female-comp-${idx}`}
        name={name}
        idx={idx}
        drawable={initialClothes.female.components[idx]?.drawable ?? 0}
        texture={initialClothes.female.components[idx]?.texture ?? 0}
        onDrawableChange={handleFemaleComponentDrawable(idx)}
        onTextureChange={handleFemaleComponentTexture(idx)}
      />
    ))
  ), [initialClothes.female.components, handleFemaleComponentDrawable, handleFemaleComponentTexture]);

  const femaleProps = useMemo(() => (
    PROP_NAMES.map((name, realIdx) => {
      const idx = PROP_INDICES[realIdx];
      return (
        <PropItem
          key={`female-prop-${idx}`}
          name={name}
          idx={idx}
          realIdx={realIdx}
          drawable={initialClothes.female.props[realIdx]?.drawable ?? -1}
          texture={initialClothes.female.props[realIdx]?.texture ?? -1}
          onDrawableChange={handleFemalePropDrawable(realIdx)}
          onTextureChange={handleFemalePropTexture(realIdx)}
        />
      );
    })
  ), [initialClothes.female.props, handleFemalePropDrawable, handleFemalePropTexture]);

  const femaleHair = useMemo(() => (
    HAIR_NAMES.map((name, idx) => {
      const key = HAIR_KEYS[idx];
      return (
        <HairItem
          key={`female-hair-${key}`}
          name={name}
          idx={idx}
          value={initialClothes.female.hair[key] ?? 0}
          onChange={handleFemaleHairChange(key)}
        />
      );
    })
  ), [initialClothes.female.hair, handleFemaleHairChange]);

  return (
    <Stack spacing="md">
      <div>
        <Text c="white" fw={500} size="lg" mb={4}>
          {locale.ADMIN_INITIAL_CLOTHES_TITLE || 'Initial Player Clothes'}
        </Text>
        <Text c="gray.4" size="xs">
          {locale.ADMIN_INITIAL_CLOTHES_DESC || 'Set default clothing items that will be applied when a new character is created.'}
        </Text>
      </div>

      <Group grow spacing="md" align="flex-start">
        {/* Male Column */}
        <Box style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <Group mb="sm" spacing="xs">
            <IconMars size={18} color="#4dabf7" />
            <Text c="white" fw={600} size="sm">Male</Text>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.male.model}
                  onChange={handleMaleModelChange}
                  placeholder="mp_m_freemode_01"
                  description="Ped model name"
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="components">
              <Accordion.Control><Text size="sm" fw={500}>Components (12)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {maleComponents}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="props">
              <Accordion.Control><Text size="sm" fw={500}>Props (5)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {maleProps}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="hair">
              <Accordion.Control><Text size="sm" fw={500}>Hair</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {maleHair}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>

        {/* Female Column */}
        <Box style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <Group mb="sm" spacing="xs">
            <IconVenus size={18} color="#ff6b9d" />
            <Text c="white" fw={600} size="sm">Female</Text>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.female.model}
                  onChange={handleFemaleModelChange}
                  placeholder="mp_f_freemode_01"
                  description="Ped model name"
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="components">
              <Accordion.Control><Text size="sm" fw={500}>Components (12)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {femaleComponents}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="props">
              <Accordion.Control><Text size="sm" fw={500}>Props (5)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {femaleProps}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="hair">
              <Accordion.Control><Text size="sm" fw={500}>Hair</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {femaleHair}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </Group>
    </Stack>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export const InitialClothesTab = memo(InitialClothesTabComponent);
