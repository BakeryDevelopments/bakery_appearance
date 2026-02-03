import { FC, useCallback, memo, useMemo, useState } from 'react';
import { Stack, Group, Text, Box, NumberInput, Accordion, TextInput, Button } from '@mantine/core';
import { IconMars, IconVenus } from '../icons/Icons';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';
import { ColourDropdown } from '../micro/ColourDropdown';

interface ClothingConfig {
  model: string;
  components: Array<{ drawable: number; texture: number }>;
  drawables?: Record<string, { id?: string; index?: number; value?: number; texture?: number; drawable?: number }>;
  props: Array<{ drawable: number; texture: number }>;
  hair?: { color: number; highlight: number; style: number; texture: number };
  hairColour?: { Colour: number; highlight: number };
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
const COMPONENT_NAMES = ['Mask', 'Hair', 'Upper Body', 'Lower Body', 'Bag', 'Shoes', 'Scarf', 'Shirt', 'Armor', 'Decals', 'Jacket'];
const DRAWABLE_KEYS = ['masks', 'hair', 'torsos', 'legs', 'bags', 'shoes', 'neck', 'shirts', 'vest', 'decals', 'jackets'];
const PROP_NAMES = ['Hat', 'Glasses', 'Ear', 'Watch', 'Bracelet'];
const PROP_INDICES = [0, 1, 2, 6, 7];
const PROP_KEYS = ['hats', 'glasses', 'earrings', 'watches', 'bracelets'];
const HAIR_NAMES = ['Style', 'Texture', 'Colour', 'Highlight'];
const HAIR_KEYS = ['style', 'texture', 'color', 'highlight'] as const;

const getDrawableEntry = (config: ClothingConfig, idx: number) => {
  if (Array.isArray(config.components) && config.components[idx]) {
    return config.components[idx];
  }

  const key = DRAWABLE_KEYS[idx];
  const entry = config.drawables?.[key];
  if (entry) {
    return {
      drawable: Number(entry.value ?? entry.drawable ?? 0),
      texture: Number(entry.texture ?? 0),
    };
  }

  return { drawable: 0, texture: 0 };
};

const getPropEntry = (config: ClothingConfig, realIdx: number) => {
  if (Array.isArray(config.props) && config.props[realIdx]) {
    return config.props[realIdx];
  }

  const propIndex = PROP_INDICES[realIdx];
  const key = PROP_KEYS[realIdx];
  const entry = (config as any).props?.[key] || (config as any).props?.[propIndex];

  if (entry && typeof entry === 'object') {
    return {
      drawable: Number(entry.value ?? entry.drawable ?? -1),
      texture: Number(entry.texture ?? -1),
    };
  }

  return { drawable: -1, texture: -1 };
};

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

// Memoized component for hair item (style/texture)
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
    const newComps = Array.isArray(initialClothes.male.components)
      ? [...initialClothes.male.components]
      : [];
    const existing = getDrawableEntry(initialClothes.male, idx);
    newComps[idx] = { drawable: val, texture: existing.texture ?? 0 };

    const key = DRAWABLE_KEYS[idx];
    const newDrawables = { ...(initialClothes.male.drawables || {}) };
    newDrawables[key] = { id: key, index: idx, value: val, texture: existing.texture ?? 0 };

    setInitialClothes({
      ...initialClothes,
      male: { ...initialClothes.male, components: newComps, drawables: newDrawables },
    });
  }, [initialClothes, setInitialClothes]);

  const handleMaleComponentTexture = useCallback((idx: number) => (val: number) => {
    const newComps = Array.isArray(initialClothes.male.components)
      ? [...initialClothes.male.components]
      : [];
    const existing = getDrawableEntry(initialClothes.male, idx);
    newComps[idx] = { drawable: existing.drawable ?? 0, texture: val };

    const key = DRAWABLE_KEYS[idx];
    const newDrawables = { ...(initialClothes.male.drawables || {}) };
    newDrawables[key] = { id: key, index: idx, value: existing.drawable ?? 0, texture: val };

    setInitialClothes({
      ...initialClothes,
      male: { ...initialClothes.male, components: newComps, drawables: newDrawables },
    });
  }, [initialClothes, setInitialClothes]);

  const handleMalePropDrawable = useCallback((realIdx: number) => (val: number) => {
    const newProps = Array.isArray(initialClothes.male.props)
      ? [...initialClothes.male.props]
      : [];
    const existing = getPropEntry(initialClothes.male, realIdx);
    newProps[realIdx] = { drawable: val, texture: existing.texture ?? -1 };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleMalePropTexture = useCallback((realIdx: number) => (val: number) => {
    const newProps = Array.isArray(initialClothes.male.props)
      ? [...initialClothes.male.props]
      : [];
    const existing = getPropEntry(initialClothes.male, realIdx);
    newProps[realIdx] = { drawable: existing.drawable ?? -1, texture: val };
    setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleMaleHairChange = useCallback((key: typeof HAIR_KEYS[number]) => (val: number) => {
    setInitialClothes({
      ...initialClothes,
      male: { ...initialClothes.male, hair: { ...(initialClothes.male.hair || { color: 0, highlight: 0, style: 0, texture: 0 }), [key]: val } }
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
    const newComps = Array.isArray(initialClothes.female.components)
      ? [...initialClothes.female.components]
      : [];
    const existing = getDrawableEntry(initialClothes.female, idx);
    newComps[idx] = { drawable: val, texture: existing.texture ?? 0 };

    const key = DRAWABLE_KEYS[idx];
    const newDrawables = { ...(initialClothes.female.drawables || {}) };
    newDrawables[key] = { id: key, index: idx, value: val, texture: existing.texture ?? 0 };

    setInitialClothes({
      ...initialClothes,
      female: { ...initialClothes.female, components: newComps, drawables: newDrawables },
    });
  }, [initialClothes, setInitialClothes]);

  const handleFemaleComponentTexture = useCallback((idx: number) => (val: number) => {
    const newComps = Array.isArray(initialClothes.female.components)
      ? [...initialClothes.female.components]
      : [];
    const existing = getDrawableEntry(initialClothes.female, idx);
    newComps[idx] = { drawable: existing.drawable ?? 0, texture: val };

    const key = DRAWABLE_KEYS[idx];
    const newDrawables = { ...(initialClothes.female.drawables || {}) };
    newDrawables[key] = { id: key, index: idx, value: existing.drawable ?? 0, texture: val };

    setInitialClothes({
      ...initialClothes,
      female: { ...initialClothes.female, components: newComps, drawables: newDrawables },
    });
  }, [initialClothes, setInitialClothes]);

  const handleFemalePropDrawable = useCallback((realIdx: number) => (val: number) => {
    const newProps = Array.isArray(initialClothes.female.props)
      ? [...initialClothes.female.props]
      : [];
    const existing = getPropEntry(initialClothes.female, realIdx);
    newProps[realIdx] = { drawable: val, texture: existing.texture ?? -1 };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemalePropTexture = useCallback((realIdx: number) => (val: number) => {
    const newProps = Array.isArray(initialClothes.female.props)
      ? [...initialClothes.female.props]
      : [];
    const existing = getPropEntry(initialClothes.female, realIdx);
    newProps[realIdx] = { drawable: existing.drawable ?? -1, texture: val };
    setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
  }, [initialClothes, setInitialClothes]);

  const handleFemaleHairChange = useCallback((key: typeof HAIR_KEYS[number]) => (val: number) => {
    setInitialClothes({
      ...initialClothes,
      female: { ...initialClothes.female, hair: { ...(initialClothes.female.hair || { color: 0, highlight: 0, style: 0, texture: 0 }), [key]: val } }
    });
  }, [initialClothes, setInitialClothes]);

  // Grab current appearance handlers
  const [isGrabbingMale, setIsGrabbingMale] = useState(false);
  const [isGrabbingFemale, setIsGrabbingFemale] = useState(false);

  const handleGrabMaleAppearance = useCallback(() => {
    setIsGrabbingMale(true);
    TriggerNuiCallback('getAppearanceData', {}).then((appearanceData: any) => {
      const comps: Array<{ drawable: number; texture: number }> = [];
      let hairData = initialClothes.male.hair || { color: 0, highlight: 0, style: 0, texture: 0 };
      
      // Build components array from drawables
      if (appearanceData?.drawables) {
        DRAWABLE_KEYS.forEach((key, idx) => {
          const drawable = appearanceData.drawables[key];
          if (drawable) {
            comps[idx] = {
              drawable: Number(drawable.value ?? drawable.drawable ?? 0),
              texture: Number(drawable.texture ?? 0),
            };
          }
        });
        
        // Extract hair drawable data separately (style and texture)
        const hairDrawable = appearanceData.drawables.hair;
        if (hairDrawable) {
          hairData = {
            ...hairData,
            style: Number(hairDrawable.value ?? hairDrawable.drawable ?? 0),
            texture: Number(hairDrawable.texture ?? 0),
          };
        }
      }
      
      // Update hair colors from hairColour
      if (appearanceData?.hairColour) {
        hairData = {
          ...hairData,
          color: appearanceData.hairColour.Colour ?? 0,
          highlight: appearanceData.hairColour.highlight ?? 0,
        };
      }

      const newMale: ClothingConfig = {
        model: initialClothes.male.model,
        components: comps,
        drawables: appearanceData?.drawables || {},
        props: appearanceData?.props || {},
        hair: hairData,
      };

      setInitialClothes({
        ...initialClothes,
        male: newMale,
      });
      setIsGrabbingMale(false);
    }).catch((error) => {
      console.error('Failed to grab male appearance:', error);
      setIsGrabbingMale(false);
    });
  }, [initialClothes, setInitialClothes]);

  const handleGrabFemaleAppearance = useCallback(() => {
    setIsGrabbingFemale(true);
    TriggerNuiCallback('getAppearanceData', {}).then((appearanceData: any) => {
      const comps: Array<{ drawable: number; texture: number }> = [];
      let hairData = initialClothes.female.hair || { color: 0, highlight: 0, style: 0, texture: 0 };
      
      // Build components array from drawables
      if (appearanceData?.drawables) {
        DRAWABLE_KEYS.forEach((key, idx) => {
          const drawable = appearanceData.drawables[key];
          if (drawable) {
            comps[idx] = {
              drawable: Number(drawable.value ?? drawable.drawable ?? 0),
              texture: Number(drawable.texture ?? 0),
            };
          }
        });
        
        // Extract hair drawable data separately (style and texture)
        const hairDrawable = appearanceData.drawables.hair;
        if (hairDrawable) {
          hairData = {
            ...hairData,
            style: Number(hairDrawable.value ?? hairDrawable.drawable ?? 0),
            texture: Number(hairDrawable.texture ?? 0),
          };
        }
      }
      
      // Update hair colors from hairColour
      if (appearanceData?.hairColour) {
        hairData = {
          ...hairData,
          color: appearanceData.hairColour.Colour ?? 0,
          highlight: appearanceData.hairColour.highlight ?? 0,
        };
      }

      const newFemale: ClothingConfig = {
        model: initialClothes.female.model,
        components: comps,
        drawables: appearanceData?.drawables || {},
        props: appearanceData?.props || {},
        hair: hairData,
      };

      setInitialClothes({
        ...initialClothes,
        female: newFemale,
      });
      setIsGrabbingFemale(false);
    }).catch((error) => {
      console.error('Failed to grab female appearance:', error);
      setIsGrabbingFemale(false);
    });
  }, [initialClothes, setInitialClothes]);

  // Memoize component lists to prevent unnecessary re-renders
  const maleComponents = useMemo(() => (
    COMPONENT_NAMES.map((name, idx) => {
      const entry = getDrawableEntry(initialClothes.male, idx);
      return (
        <ComponentItem
          key={`male-comp-${idx}`}
          name={name}
          idx={idx}
          drawable={entry.drawable ?? 0}
          texture={entry.texture ?? 0}
          onDrawableChange={handleMaleComponentDrawable(idx)}
          onTextureChange={handleMaleComponentTexture(idx)}
        />
      );
    })
  ), [initialClothes.male, handleMaleComponentDrawable, handleMaleComponentTexture]);

  const maleProps = useMemo(() => (
    PROP_NAMES.map((name, realIdx) => {
      const idx = PROP_INDICES[realIdx];
      const entry = getPropEntry(initialClothes.male, realIdx);
      return (
        <PropItem
          key={`male-prop-${idx}`}
          name={name}
          idx={idx}
          realIdx={realIdx}
          drawable={entry.drawable ?? -1}
          texture={entry.texture ?? -1}
          onDrawableChange={handleMalePropDrawable(realIdx)}
          onTextureChange={handleMalePropTexture(realIdx)}
        />
      );
    })
  ), [initialClothes.male, handleMalePropDrawable, handleMalePropTexture]);

  const maleHair = useMemo(() => (
    HAIR_NAMES.map((name, idx) => {
      const key = HAIR_KEYS[idx];
      const isColor = key === 'color' || key === 'highlight';
      
      if (isColor) {
        return (
          <Box key={`male-hair-${key}`} style={{ marginBottom: '8px' }}>
            <ColourDropdown
              colourType="hair"
              index={initialClothes.male.hair?.[key] ?? 0}
              value={null}
              onChange={(value) => {
                const colorIndex = typeof value === 'object' && value !== null && 'index' in value
                  ? (value as any).index
                  : typeof value === 'number'
                    ? value
                    : 0;
                handleMaleHairChange(key)(colorIndex);
              }}
            />
          </Box>
        );
      }
      
      return (
        <HairItem
          key={`male-hair-${key}`}
          name={name}
          idx={idx}
          value={initialClothes.male.hair?.[key] ?? 0}
          onChange={handleMaleHairChange(key)}
        />
      );
    })
  ), [initialClothes.male.hair, handleMaleHairChange]);

  const femaleComponents = useMemo(() => (
    COMPONENT_NAMES.map((name, idx) => {
      const entry = getDrawableEntry(initialClothes.female, idx);
      return (
        <ComponentItem
          key={`female-comp-${idx}`}
          name={name}
          idx={idx}
          drawable={entry.drawable ?? 0}
          texture={entry.texture ?? 0}
          onDrawableChange={handleFemaleComponentDrawable(idx)}
          onTextureChange={handleFemaleComponentTexture(idx)}
        />
      );
    })
  ), [initialClothes.female, handleFemaleComponentDrawable, handleFemaleComponentTexture]);

  const femaleProps = useMemo(() => (
    PROP_NAMES.map((name, realIdx) => {
      const idx = PROP_INDICES[realIdx];
      const entry = getPropEntry(initialClothes.female, realIdx);
      return (
        <PropItem
          key={`female-prop-${idx}`}
          name={name}
          idx={idx}
          realIdx={realIdx}
          drawable={entry.drawable ?? -1}
          texture={entry.texture ?? -1}
          onDrawableChange={handleFemalePropDrawable(realIdx)}
          onTextureChange={handleFemalePropTexture(realIdx)}
        />
      );
    })
  ), [initialClothes.female, handleFemalePropDrawable, handleFemalePropTexture]);

  const femaleHair = useMemo(() => (
    HAIR_NAMES.map((name, idx) => {
      const key = HAIR_KEYS[idx];
      const isColor = key === 'color' || key === 'highlight';
      
      if (isColor) {
        return (
          <Box key={`female-hair-${key}`} style={{ marginBottom: '8px' }}>
            <ColourDropdown
              colourType="hair"
              index={initialClothes.female.hair?.[key] ?? 0}
              value={null}
              onChange={(value) => {
                const colorIndex = typeof value === 'object' && value !== null && 'index' in value
                  ? (value as any).index
                  : typeof value === 'number'
                    ? value
                    : 0;
                handleFemaleHairChange(key)(colorIndex);
              }}
            />
          </Box>
        );
      }
      
      return (
        <HairItem
          key={`female-hair-${key}`}
          name={name}
          idx={idx}
          value={initialClothes.female.hair?.[key] ?? 0}
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
          <Group mb="sm" spacing="xs" position="apart">
            <Group spacing="xs">
              <IconMars size={18} color="#4dabf7" />
              <Text c="white" fw={600} size="sm">Male</Text>
            </Group>
            <Button
              size="xs"
              variant="light"
              onClick={handleGrabMaleAppearance}
              loading={isGrabbingMale}
            >
              Grab Current
            </Button>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.male.model || ''}
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
          <Group mb="sm" spacing="xs" position="apart">
            <Group spacing="xs">
              <IconVenus size={18} color="#ff6b9d" />
              <Text c="white" fw={600} size="sm">Female</Text>
            </Group>
            <Button
              size="xs"
              variant="light"
              onClick={handleGrabFemaleAppearance}
              loading={isGrabbingFemale}
            >
              Grab Current
            </Button>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.female.model || ''}
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
