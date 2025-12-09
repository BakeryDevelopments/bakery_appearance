import { FC, useState } from 'react';
import { Box, TextInput, Button, Stack, Text, Grid, Divider, Badge } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadBlend } from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';
import { useCustomization } from '../../Providers/CustomizationProvider';
import { IconLock } from '../icons/IconLock';

export const Heritage: FC = () => {
    const {
        appearance,
        models,
        lockedModels,
        blacklist,
        locale,
        isValid,
        setIsValid,
        setModel,
        setHeadBlend,
    } = useAppearanceStore();

    // Use store directly, no local cache for headBlend, modelIndex, or currentPed
    const data = (appearance?.headBlend || {}) as THeadBlend;
    const currentPedIndex = appearance?.modelIndex || 0;
    const currentPed = models?.[currentPedIndex] || '';
    const [modelSearch, setModelSearch] = useState('');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const { theme } = useCustomization();

    const updateParents = (key: keyof THeadBlend, value: number) => {
        if (currentPedIndex !== 0 && currentPedIndex !== 1) return;
        const newData = { ...data, [key]: value };
        setHeadBlend(newData);
    };

    const handleModelChange = (model: string, index: number) => {
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
        <Stack spacing="lg" 
        className="appearance-scroll"
        style={{
            padding: '0.25rem 0.75rem',
            height: "100%",
            maxHeight: "100%",
            overflowY: "auto",   // browser scroll only
            overflowX: "hidden",
            paddingBottom: "2rem",  // ⬅️ Add bottom padding here
        }}>
            {/* Model Selection */}
            <Box>
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.MODEL_TITLE || 'Model'}</Text>
                <Stack spacing="xs">
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <Text size="sm" c="dimmed">{locale?.OPTIONS_SUBTITLE || 'Options'}</Text>
                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: {models?.length || 0}</Text>
                    </Box>

                    {/* Current Model Display */}
                    <Box style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', position: 'relative' }}>
                        <Box
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '-1.7rem',
                                transform: 'translateX(-50%)',
                                opacity: !isValid.models ? 0.75 : 0,
                                pointerEvents: 'none',
                                animation: 'pulse 1.5s infinite',
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            <IconLock size={20} />
                        </Box>
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
                                        const { theme } = useCustomization();
                                    }
                                `}
                            </style>
                            <TextInput
                                placeholder={locale?.SEARCHMODEL_SUBTITLE || 'Search for a model...'}
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
                                {filteredModels.map((model, i) => {
                                    const isBlacklisted = blacklist?.models ? blacklist.models.includes(model) : false;
                                    return (
                                        <Button
                                            key={i}
                                            fullWidth
                                            variant="subtle"
                                            onClick={() => {
                                                handleModelChange(model, models?.indexOf(model) || i);
                                                setShowModelDropdown(false);
                                                setModelSearch('');
                                            }}
                                            disabled={isBlacklisted}
                                            styles={{
                                                root: {
                                                    justifyContent: 'space-between',
                                                    color: isBlacklisted ? 'rgba(255, 255, 255, 0.3)' : (model === currentPed ? '#5c7cfa' : 'rgba(255, 255, 255, 0.3)'),
                                                    backgroundColor: model === currentPed ? 'rgba(92, 124, 250, 0.1)' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor:  'rgba(255, 255, 255, 0.1)'
                                                    },
                                                    borderRadius: 0,
                                                    height: '2.25rem',
                                                    padding: '0 0.375rem',
                                                    cursor: isBlacklisted ? 'not-allowed' : 'pointer',
                                                    opacity: isBlacklisted ? 0.5 : 1
                                                }
                                            }}
                                        >
                                            <span>{model}</span>
                                            {isBlacklisted && <IconLock size={16} />}
                                        </Button>
                                    );
                                })}
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
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.MOTHER_SUBTITLE || 'Mother'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale?.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 46</Text>
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
                                        <Text size="sm" c="dimmed">{locale?.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 45</Text>
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
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.FATHER_SUBTITLE || 'Father'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale?.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 46</Text>
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
                                        <Text size="sm" c="dimmed">{locale?.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 45</Text>
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
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.THIRDPARENT_SUBTITLE || 'Third Parent'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale?.FACE_TITLE || 'Face'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 46</Text>
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
                                        <Text size="sm" c="dimmed">{locale?.SKIN_TITLE || 'Skin'}</Text>
                                        <Text size="sm" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: 45</Text>
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
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.RESEMBLENCE_TITLE || 'Resemblance'}</Text>
                        <Stack spacing="md">
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                    <Text size="sm" c="dimmed">{locale?.MOTHER_SUBTITLE || 'Mother'}</Text>
                                    <Text size="sm" c="dimmed">{locale?.FATHER_SUBTITLE || 'Father'}</Text>
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
                                            accentColor: theme.primaryColor,
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
                                            accentColor: theme.primaryColor,
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
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale?.SKINMIX_TITLE || 'Skin Mix'}</Text>
                        <Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                <Text size="sm" c="dimmed">{locale?.MOTHER_SUBTITLE || 'Mother'}</Text>
                                <Text size="sm" c="dimmed">{locale?.FATHER_SUBTITLE || 'Father'}</Text>
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
                                        accentColor: theme.primaryColor,
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
