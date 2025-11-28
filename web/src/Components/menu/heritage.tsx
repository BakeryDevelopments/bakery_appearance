import { FC, useState, useEffect } from 'react';
import { Box, TextInput, Button, Stack, Text, Grid, NumberInput } from '@mantine/core';
import { Divider } from '../micro/Divider';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadBlend } from '../../types/appearance';

// Styled Number Stepper Component
const NumberStepper: FC<{
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}> = ({ value, min, max, onChange }) => {
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
      <Button
        size="xs"
        variant="default"
        onClick={() => onChange(Math.max(min, value - 1))}
        onMouseEnter={() => setIsLeftHovered(true)}
        onMouseLeave={() => setIsLeftHovered(false)}
        style={{ 
          minWidth: '2rem',
          height: '2.125rem',
          padding: '0',
          backgroundColor: isLeftHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        ◂
      </Button>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0',
          textAlign: 'center',
          flex: 1,
          height: '2.125rem',
          width: '4rem',
          color: 'white',
          fontSize: '0.875rem',
          outline: 'none',
          borderRadius: '0.125rem'
        }}
      />
      <Button
        size="xs"
        variant="default"
        onClick={() => onChange(Math.min(max, value + 1))}
        onMouseEnter={() => setIsRightHovered(true)}
        onMouseLeave={() => setIsRightHovered(false)}
        style={{ 
          minWidth: '2rem',
          height: '2.125rem',
          padding: '0',
          backgroundColor: isRightHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        ▸
      </Button>
    </Box>
  );
};

export const Heritage: FC = () => {
    const {
        appearance,
        models,
        blacklist,
        locale,
        isValid,
        setIsValid,
        setModel,
        setHeadBlend,
    } = useAppearanceStore();

    const [data, setData] = useState<THeadBlend>(appearance?.headBlend || {} as THeadBlend);
    const [currentPedIndex, setCurrentPedIndex] = useState(appearance?.modelIndex || 0);
    const [currentPed, setCurrentPed] = useState(models?.[currentPedIndex] || '');
    const [modelSearch, setModelSearch] = useState('');
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Initialize head blend on mount
    useEffect(() => {
        if (appearance?.headBlend) {
            setData(appearance.headBlend);
            setHeadBlend(appearance.headBlend);
        }
    }, []);

    // Update current ped when index changes
    useEffect(() => {
        if (models) {
            setCurrentPed(models[currentPedIndex] || '');
        }
    }, [currentPedIndex, models]);

    const updateParents = (key: keyof THeadBlend, value: number) => {
        if (currentPedIndex !== 0 && currentPedIndex !== 1) return;

        const newData = { ...data, [key]: value };
        setData(newData);
        setHeadBlend(newData);
    };

    const handleModelChange = (model: string, index: number) => {
        setCurrentPed(model);
        setCurrentPedIndex(index);

        // Check if model is blacklisted
        const isModelValid = blacklist?.models
            ? !blacklist.models.includes(model)
            : true;

        setIsValid({ ...isValid, models: isModelValid, drawables: true });
        setModel(model);
    };

    // Filter models based on search
    const filteredModels = modelSearch.length > 0
        ? (models || []).filter(model =>
            model.toLowerCase().includes(modelSearch.toLowerCase())
        )
        : (models || []);

    const showParentOptions = currentPedIndex === 0 || currentPedIndex === 1;
    const [isLeftArrowHovered, setIsLeftArrowHovered] = useState(false);
    const [isRightArrowHovered, setIsRightArrowHovered] = useState(false);
    const [isModelBoxHovered, setIsModelBoxHovered] = useState(false);

    return (
        <Stack spacing="lg" style={{ padding: '0.25rem 0.75rem', width:'18rem', maxWidth:'400px' }}>
            {/* Model Selection */}
            <Box>
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.MODEL_TITLE || 'Model'}</Text>
                <Stack spacing="xs">
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <Text size="sm" c="dimmed">{locale.OPTIONS_SUBTITLE || 'Options'}</Text>
                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {models?.length || 0}</Text>
                    </Box>

                    {/* Current Model Display */}
                    <Box style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <Button
                            onClick={() => {
                                const newIndex = currentPedIndex > 0 ? currentPedIndex - 1 : (models?.length || 1) - 1;
                                const newModel = models?.[newIndex] || '';
                                handleModelChange(newModel, newIndex);
                            }}
                            onMouseEnter={() => setIsLeftArrowHovered(true)}
                            onMouseLeave={() => setIsLeftArrowHovered(false)}
                            size="xs"
                            variant="default"
                            style={{ 
                              minWidth: '2.125rem',
                              height: '2.25rem',
                              padding: '0',
                              backgroundColor: isLeftArrowHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: 'white',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                        >
                            ◂
                        </Button>
                        <Box
                            p="xs"
                            style={{
                                backgroundColor: isModelBoxHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                flex: 1,
                                minWidth: '12rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                height: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                            onMouseEnter={() => setIsModelBoxHovered(true)}
                            onMouseLeave={() => setIsModelBoxHovered(false)}
                        >
                            <Text size="sm" c="white" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentPed}</Text>
                        </Box>
                        <Button
                            onClick={() => {
                                const newIndex = currentPedIndex < (models?.length || 1) - 1 ? currentPedIndex + 1 : 0;
                                const newModel = models?.[newIndex] || '';
                                handleModelChange(newModel, newIndex);
                            }}
                            onMouseEnter={() => setIsRightArrowHovered(true)}
                            onMouseLeave={() => setIsRightArrowHovered(false)}
                            size="xs"
                            variant="default"
                            style={{ 
                              minWidth: '2.125rem',
                              height: '2.25rem',
                              padding: '0',
                              backgroundColor: isRightArrowHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: 'white',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                        >
                            ▸
                        </Button>
                    </Box>

                    {/* Model Search/Dropdown */}
                    {showModelDropdown && (
                        <Box
                            style={{
                                animation: 'slideDown 0.2s ease-out',
                                transformOrigin: 'top',
                                overflow: 'hidden'
                            }}
                        >
                            <style>
                                {`
                                    @keyframes slideDown {
                                        from {
                                            opacity: 0;
                                            transform: translateY(-10px);
                                            maxHeight: 0;
                                        }
                                        to {
                                            opacity: 1;
                                            transform: translateY(0);
                                            maxHeight: 300px;
                                        }
                                    }
                                `}
                            </style>
                            <TextInput
                                placeholder={locale.SEARCHMODEL_SUBTITLE || 'Search for a model...'}
                                value={modelSearch}
                                onChange={(e) => setModelSearch(e.currentTarget.value)}
                                mb="xs"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.4)'
                                        },
                                        '&:focus': {
                                            borderColor: 'rgba(92, 124, 250, 0.5)'
                                        }
                                    }
                                }}
                            />
                            <Box
                                style={{
                                    maxHeight: '13.75rem',
                                    overflow: 'auto',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '0.25rem'
                                }}
                            >
                                {filteredModels.map((model, i) => (
                                    <Button
                                        key={i}
                                        fullWidth
                                        variant="subtle"
                                        onClick={() => {
                                            handleModelChange(model, models?.indexOf(model) || i);
                                            setShowModelDropdown(false);
                                            setModelSearch('');
                                        }}
                                        styles={{
                                            root: {
                                                justifyContent: 'flex-start',
                                                color: model === currentPed ? '#5c7cfa' : 'white',
                                                backgroundColor: model === currentPed ? 'rgba(92, 124, 250, 0.1)' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                borderRadius: 0,
                                                height: '2.25rem',
                                                padding: '0 0.375rem'
                                            }
                                        }}
                                    >
                                        {model}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Stack>
            </Box>

            {/* Parent Options - Only for ped index 0 or 1 (mp_m_freemode_01, mp_f_freemode_01) */}
            {showParentOptions && (
                <>
                    <Divider />

                    {/* Mother */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.MOTHER_SUBTITLE || 'Mother'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 46</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.shapeFirst || 0}
                                        min={0}
                                        max={45}
                                        onChange={(val) => updateParents('shapeFirst', val)}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 45</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.skinFirst || 0}
                                        min={0}
                                        max={44}
                                        onChange={(val) => updateParents('skinFirst', val)}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>

                    {/* Father */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.FATHER_SUBTITLE || 'Father'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 46</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.shapeSecond || 0}
                                        min={0}
                                        max={45}
                                        onChange={(val) => updateParents('shapeSecond', val)}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 45</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.skinSecond || 0}
                                        min={0}
                                        max={44}
                                        onChange={(val) => updateParents('skinSecond', val)}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>

                    {/* Third Parent */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.THIRDPARENT_SUBTITLE || 'Third Parent'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 46</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.shapeThird || 0}
                                        min={0}
                                        max={45}
                                        onChange={(val) => updateParents('shapeThird', val)}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: 45</Text>
                                    </Box>
                                    <NumberStepper
                                        value={data.skinThird || 0}
                                        min={0}
                                        max={44}
                                        onChange={(val) => updateParents('skinThird', val)}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>

                    {/* Resemblance Mix */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.RESEMBLENCE_TITLE || 'Resemblance'}</Text>
                        <Stack spacing="md">
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                    <Text size="sm" c="dimmed">{locale.MOTHER_SUBTITLE || 'Mother'}</Text>
                                    <Text size="sm" c="dimmed">{locale.FATHER_SUBTITLE || 'Father'}</Text>
                                </Box>
                                <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                                        <Text size="sm" c="white" fw={500}>{Math.floor((data.shapeMix || 0) * 100)}%</Text>
                                    </Box>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={data.shapeMix || 0}
                                        onChange={(e) => updateParents('shapeMix', parseFloat(e.currentTarget.value))}
                                        style={{ 
                                            flex: 1, 
                                            accentColor: '#5c7cfa',
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
                                        <Text size="sm" c="white" fw={500}>{100 - Math.floor((data.shapeMix || 0) * 100)}%</Text>
                                    </Box>
                                </Box>
                            </Box>

                            <Box>
                                <Text size="sm" mb="0.625rem" ta="right" c="dimmed">Third</Text>
                                <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={data.thirdMix || 0}
                                        onChange={(e) => updateParents('thirdMix', parseFloat(e.currentTarget.value))}
                                        style={{ 
                                            flex: 1, 
                                            accentColor: '#5c7cfa',
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
                                        <Text size="sm" c="white" fw={500}>{Math.floor((data.thirdMix || 0) * 100)}%</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Skin Mix */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.SKINMIX_TITLE || 'Skin Mix'}</Text>
                        <Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                <Text size="sm" c="dimmed">{locale.MOTHER_SUBTITLE || 'Mother'}</Text>
                                <Text size="sm" c="dimmed">{locale.FATHER_SUBTITLE || 'Father'}</Text>
                            </Box>
                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                                    <Text size="sm" c="white" fw={500}>{Math.floor((data.skinMix || 0) * 100)}%</Text>
                                </Box>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={data.skinMix || 0}
                                    onChange={(e) => updateParents('skinMix', parseFloat(e.currentTarget.value))}
                                    style={{ 
                                        flex: 1, 
                                        accentColor: '#5c7cfa',
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
                                    <Text size="sm" c="white" fw={500}>{100 - Math.floor((data.skinMix || 0) * 100)}%</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
        </Stack>
    );
};

export default Heritage;
