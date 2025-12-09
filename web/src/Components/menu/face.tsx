import { FC } from 'react';
import { Box, Button, Stack, Text, Grid, Divider } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadStructure, THeadOverlay, THeadOverlayTotal } from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';
import { useCustomization } from '../../Providers/CustomizationProvider';



export const Face: FC = () => {


    const {
        appearance,
        locale,
        setHeadStructure,
        setHeadOverlay,
    } = useAppearanceStore();

    // Use store directly, no local cache
    const data = (appearance?.headStructure as THeadStructure) || {};
    const headdata = (appearance?.headOverlay as THeadOverlay) || {};
    const headOverlayTotal = (appearance?.headOverlayTotal || {}) as THeadOverlayTotal;
    const { theme } = useCustomization();

    // No local state sync needed

    // Directly update store
    const updateHeadStructure = (newField: THeadStructure[keyof THeadStructure]) => {
        setHeadStructure(newField);
    };

    const updateHeadOverlay = (newOverlay: THeadOverlay[keyof THeadOverlay]) => {
        if (!newOverlay || !newOverlay.id) return;
        if (headdata && headdata[newOverlay.id]) {
            const current = headdata[newOverlay.id];
            let changed = false;
            if ('overlayValue' in newOverlay && newOverlay.overlayValue !== current.overlayValue) changed = true;
            if ('firstColour' in newOverlay && newOverlay.firstColour !== current.firstColour) changed = true;
            if ('secondColour' in newOverlay && newOverlay.secondColour !== current.secondColour) changed = true;
            if ('overlayOpacity' in newOverlay && newOverlay.overlayOpacity !== current.overlayOpacity) changed = true;
            if (!changed) return;
        }
        setHeadOverlay(newOverlay);
    };

    // Render
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
            {data && Object.keys(data).length > 0 ? (
                <>
                    {/* Ageing overlay block (guarded with optional chaining) */}
                    {headdata?.Ageing?.overlayValue != null && (
                        <>
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.AGEING_SUBTITLE || 'Ageing'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.DESIGN_SUBTITLE || 'Depth'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <NumberStepper
                                                        value={headdata.Ageing.overlayValue || 0}
                                                        min={0}
                                                        max={headOverlayTotal?.Ageing ?? 0}
                                                        onChange={(val) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Ageing || {}),
                                                                overlayValue: val,
                                                                id: 'Ageing',
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.OPACITY_SUBTITLE || 'Opacity'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={headdata.Ageing.overlayOpacity ?? 0}
                                                        onChange={(e) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Ageing || {}),
                                                                overlayOpacity: parseFloat(e.target.value),
                                                                id: 'Ageing',
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor: theme.primaryColor,
                                                            height: '0.375rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Blemishes */}
                    {headdata?.Blemishes?.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.BLEMISHES_SUBTITLE || 'Blemishes'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.DESIGN_SUBTITLE || 'Depth'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <NumberStepper
                                                        value={headdata.Blemishes.overlayValue || 0}
                                                        min={0}
                                                        max={headOverlayTotal?.Blemishes ?? 0}
                                                        onChange={(val) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Blemishes || {}),
                                                                overlayValue: val,
                                                                id: 'Blemishes',
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.OPACITY_SUBTITLE || 'Opacity'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={headdata.Blemishes.overlayOpacity ?? 0}
                                                        onChange={(e) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Blemishes || {}),
                                                                overlayOpacity: parseFloat(e.target.value),
                                                                id: 'Blemishes',
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor: '#5c7cfa',
                                                            height: '0.375rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}
                    {/* Cheeks */}
                    {data.Cheekbone_High && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.CHEEKS_TITLE || 'Cheeks'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONEHEIGHT_SUBTITLE || 'Bone Height'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Cheekbone_High.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Cheekbone_High || {}),
                                                            value: Number(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONEWIDTH_SUBTITLE || 'Depth'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Cheekbone_Width?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Cheekbone_Width || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Chin */}
                    {data.Chin_Bone_Lowering && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.CHIN_TITLE || 'Chin'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONELOWERING_SUBTITLE || 'Bone Height'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Chin_Bone_Lowering.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Chin_Bone_Lowering || {}),
                                                            value: Number(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONELENGTH_SUBTITLE || 'Depth'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Chin_Bone_Length?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Chin_Bone_Length || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>

                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right">
                                            {locale?.HOLE_SUBTITLE || 'Bone Height'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Chin_Hole.value ?? 0}
                                            onChange={(e) =>
                                                updateHeadStructure({
                                                    ...(data.Chin_Hole || {}),
                                                    value: Number(e.target.value),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Complextion */}
                    {headdata?.Complexion?.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.COMPLEXION_SUBTITLE || 'Complexion'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.DESIGN_SUBTITLE || 'Depth'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <NumberStepper
                                                        value={headdata.Complexion.overlayValue || 0}
                                                        min={0}
                                                        max={headOverlayTotal?.Complexion ?? 0}
                                                        onChange={(val) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Complexion || {}),
                                                                overlayValue: val,
                                                                id: 'Complexion',
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.OPACITY_SUBTITLE || 'Opacity'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={headdata.Complexion.overlayOpacity ?? 0}
                                                        onChange={(e) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.Complexion || {}),
                                                                overlayOpacity: parseFloat(e.target.value),
                                                                id: 'Complexion',
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor: '#5c7cfa',
                                                            height: '0.375rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}


                    {/* Eyebrow */}
                    {data.EyeBrow_Height && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.EYEBROW_TITLE || 'Eyebrow'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.HEIGHT_SUBTITLE || 'Width'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.EyeBrow_Height?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.EyeBrow_Height || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.DEPTH_SUBTITLE || 'Depth'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.EyeBrow_Forward?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.EyeBrow_Forward || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Eyes */}
                    {data.Eyes_Openning && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.EYES_TITLE || 'Eyes'}
                                </Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right">
                                            {locale?.SQUINT_SUBTITLE || 'Width'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Eyes_Openning?.value ?? 0}
                                            onChange={(e) =>
                                                updateHeadStructure({
                                                    ...(data.Eyes_Openning || {}),
                                                    value: parseFloat(e.target.value),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Jaw */}
                    {data.Jaw_Bone_Width && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.JAW_TITLE || 'Eyebrow'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONEWIDTH_SUBTITLE || 'Width'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Jaw_Bone_Width?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Jaw_Bone_Width || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONELENGTH_SUBTITLE || 'Depth'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Jaw_Bone_Back_Length?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Jaw_Bone_Back_Length || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Lips */}
                    {data.Lips_Thickness && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.LIPS_TITLE || 'Lips'}
                                </Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right">
                                            {locale?.THICKNESS_SUBTITLE || 'Thickness'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Lips_Thickness?.value ?? 0}
                                            onChange={(e) =>
                                                updateHeadStructure({
                                                    ...(data.Lips_Thickness || {}),
                                                    value: parseFloat(e.target.value),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Neck */}
                    {data.Neck_Thikness && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.NECKTHICK_TITLE || 'Lips'}
                                </Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right">
                                            {locale?.THICKNESS_SUBTITLE || 'Thickness'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Neck_Thikness?.value ?? 0}
                                            onChange={(e) =>
                                                updateHeadStructure({
                                                    ...(data.Neck_Thikness || {}),
                                                    value: parseFloat(e.target.value),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Nose (multiple controls) */}
                    {data.Nose_Width && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.NOSE_TITLE || 'Nose'}
                                </Text>

                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.WIDTH_SUBTITLE || 'Width'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Width?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Width || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.PEAKHEIGHT_SUBTITLE || 'Peak Height'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Height?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Peak_Height || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                {/* second row */}
                                <Box>
                                    <Grid gutter="sm" style={{ marginTop: '0.5rem' }}>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONEHEIGHT_SUBTITLE || 'Bone Height'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Bone_Height?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Bone_Height || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.PEAKLENGTH_SUBTITLE || 'Peak Length'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Length?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Peak_Length || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                {/* third row */}
                                <Box>
                                    <Grid gutter="sm" style={{ marginTop: '0.5rem' }}>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.BONETWIST_SUBTITLE || 'Bone Twist'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Bone_Twist?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Bone_Twist || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {locale?.PEAKLOWERING_SUBTITLE || 'Peak Lowering'}
                                                </Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Lowering?.value ?? 0}
                                                    onChange={(e) =>
                                                        updateHeadStructure({
                                                            ...(data.Nose_Peak_Lowering || {}),
                                                            value: parseFloat(e.target.value),
                                                        })
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Moles & Freckles */}
                    {headdata?.MolesFreckles?.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.MOLESFRECKLES_SUBTITLE || 'Moles $ Freckles'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.DESIGN_SUBTITLE || 'Depth'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <NumberStepper
                                                        value={headdata.MolesFreckles.overlayValue || 0}
                                                        min={0}
                                                        max={headOverlayTotal?.MolesFreckles ?? 0}
                                                        onChange={(val) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.MolesFreckles || {}),
                                                                overlayValue: val,
                                                                id: 'MolesFreckles',
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.OPACITY_SUBTITLE || 'Opacity'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={headdata.MolesFreckles.overlayOpacity ?? 0}
                                                        onChange={(e) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.MolesFreckles || {}),
                                                                overlayOpacity: parseFloat(e.target.value),
                                                                id: 'MolesFreckles',
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor: '#5c7cfa',
                                                            height: '0.375rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* SunDamage */}
                    {headdata?.SunDamage?.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                                    {locale?.SUNDAMAGE_SUBTITLE || 'Sun Damage'}
                                </Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.DESIGN_SUBTITLE || 'Depth'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <NumberStepper
                                                        value={headdata.SunDamage.overlayValue || 0}
                                                        min={0}
                                                        max={headOverlayTotal?.SunDamage ?? 0}
                                                        onChange={(val) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.SunDamage || {}),
                                                                overlayValue: val,
                                                                id: 'SunDamage',
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.4rem' }}>
                                                    <Text size="sm" c="dimmed" ta="right">
                                                        {locale?.OPACITY_SUBTITLE || 'Opacity'}
                                                    </Text>
                                                </Box>

                                                <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={headdata.SunDamage.overlayOpacity ?? 0}
                                                        onChange={(e) =>
                                                            updateHeadOverlay({
                                                                ...(headdata.SunDamage || {}),
                                                                overlayOpacity: parseFloat(e.target.value),
                                                                id: 'SunDamage',
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            accentColor: '#5c7cfa',
                                                            height: '0.375rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>
                    )}


                </>
            ) : (
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                    {locale?.NO_FACEMENU || "You can't modify your face"}
                </Text>
            )}
        </Stack>
    );
};

export default Face;
