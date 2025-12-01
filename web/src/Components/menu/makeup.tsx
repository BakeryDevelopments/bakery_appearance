import { FC } from 'react';
import { Box, Button, Stack, Text, Grid, Divider } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadOverlay, THeadOverlayTotal} from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';
import { ColourDropdown } from '../micro/ColourDropdown';


// Makeup Menu Component.

export const MakeupMenu: FC = () => {
    const { appearance, setHeadOverlay,setEyeColour, locale } = useAppearanceStore();

    const headOverlay = appearance?.headOverlay as THeadOverlay;
    const headOverlayTotal = appearance?.headOverlayTotal as THeadOverlayTotal;

    const updateHeadOverlay = (newOverlay: THeadOverlay[keyof THeadOverlay]) => {
        setHeadOverlay(newOverlay);
    };

    return (
        <Stack spacing="lg"
            className="appearance-scroll"
            style={{
                padding: '0.25rem 0.75rem',
                width: '18rem',
                maxWidth: '400px',
                height: "100%",
                maxHeight: "100%",
                overflowY: "auto",   // browser scroll only
                overflowX: "hidden",
                paddingBottom: "2rem",  // ⬅️ Add bottom padding here
            }}>

            {headOverlay && Object.keys(headOverlay).length > 0 ? (
                <>
                    {headOverlay.Blush.overlayValue != null && (
                        <>

                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.BLUSH_TITLE || 'Blush'}</Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Design'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.Blush}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={headOverlay.Blush.overlayValue || 0}
                                        min={0}
                                        max={headOverlayTotal.Blush}
                                        onChange={(value: number) => {
                                            if (headOverlay && headOverlay.Blush) {
                                                updateHeadOverlay({
                                                    ...(headOverlay.Blush || {}),
                                                    overlayValue: value,
                                                })
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Grid gutter="sm">
                                <Grid.Col span={6}>

                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Blush.firstColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Blush) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Blush || {}),
                                                        firstColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Blush.secondColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Blush) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Blush || {}),
                                                        secondColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>
                            </Grid>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                    <Text size="sm" c="dimmed" ta="right">
                                        {locale.OPACITY_SUBTITLE || 'Opacity'}
                                    </Text>
                                </Box>
                                <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="range"
                                        min={-1}
                                        max={1}
                                        step={0.01}
                                        value={headOverlay.Blush.overlayOpacity ?? 0}
                                        onChange={(e) =>
                                            setHeadOverlay({
                                                ...(headOverlay.Blush || {}),
                                                overlayOpacity: parseFloat(e.target.value),
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
                        </>
                    )}

                    {headOverlay.EyeColour != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.EYES_TITLE || 'Contact Lenses'}</Text>

                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                    </Box>
                                    <ColourDropdown
                                        colourType="eye"
                                        index={headOverlay.EyeColour.value || 0}
                                        value={null}
                                        onChange={(value) => {
                                            const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                ? (value as any).index
                                                : typeof value === 'number'
                                                    ? value
                                                    : 0;
                                            if (headOverlay && headOverlay.EyeColour) {
                                                setEyeColour({
                                                    ...(headOverlay.EyeColour || {}),
                                                    value: firstColourValue,
                                                })
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                        </>
                    )}

                    {headOverlay.Lipstick.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.LIPSTICK_TITLE || 'Lipstick'}</Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Design'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.Lipstick}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={headOverlay.Lipstick.overlayValue || 0}
                                        min={0}
                                        max={headOverlayTotal.Lipstick}
                                        onChange={(value: number) => {
                                            if (headOverlay && headOverlay.Lipstick) {
                                                updateHeadOverlay({
                                                    ...(headOverlay.Lipstick || {}),
                                                    overlayValue: value,
                                                })
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Grid gutter="sm">
                                <Grid.Col span={6}>

                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Lipstick.firstColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Lipstick) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Lipstick || {}),
                                                        firstColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Lipstick.secondColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Lipstick) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Lipstick || {}),
                                                        secondColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>
                            </Grid>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                    <Text size="sm" c="dimmed" ta="right">
                                        {locale.OPACITY_SUBTITLE || 'Opacity'}
                                    </Text>
                                </Box>
                                <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="range"
                                        min={-1}
                                        max={1}
                                        step={0.01}
                                        value={headOverlay.Lipstick.overlayOpacity ?? 0}
                                        onChange={(e) =>
                                            setHeadOverlay({
                                                ...(headOverlay.Lipstick || {}),
                                                overlayOpacity: parseFloat(e.target.value),
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
                        </>
                    )}

                    {headOverlay.Makeup.overlayValue != null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.MAKEUP_TITLE || 'Makeup'}</Text>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Design'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.Makeup}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={headOverlay.Makeup.overlayValue || 0}
                                        min={0}
                                        max={headOverlayTotal.Makeup}
                                        onChange={(value: number) => {
                                            if (headOverlay && headOverlay.Makeup) {
                                                updateHeadOverlay({
                                                    ...(headOverlay.Makeup || {}),
                                                    overlayValue: value,
                                                })
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Grid gutter="sm">
                                <Grid.Col span={6}>

                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Makeup.firstColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Makeup) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Makeup || {}),
                                                        firstColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <Box>
                                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                            <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                        </Box>
                                        <ColourDropdown
                                            colourType="makeup"
                                            index={headOverlay.Makeup.secondColour || 0}
                                            value={null}
                                            onChange={(value) => {
                                                const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                                    ? (value as any).index
                                                    : typeof value === 'number'
                                                        ? value
                                                        : 0;
                                                if (headOverlay && headOverlay.Makeup) {
                                                    updateHeadOverlay({
                                                        ...(headOverlay.Makeup || {}),
                                                        secondColour: firstColourValue,
                                                    })
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid.Col>
                            </Grid>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                    <Text size="sm" c="dimmed" ta="right">
                                        {locale.OPACITY_SUBTITLE || 'Opacity'}
                                    </Text>
                                </Box>
                                <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="range"
                                        min={-1}
                                        max={1}
                                        step={0.01}
                                        value={headOverlay.Makeup.overlayOpacity ?? 0}
                                        onChange={(e) =>
                                            setHeadOverlay({
                                                ...(headOverlay.Makeup || {}),
                                                overlayOpacity: parseFloat(e.target.value),
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
                        </>
                    )}
                </>
            ) : (
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                    {locale.NO_MAKEUP || "You can't modify your makeup"}
                </Text>
            )}
        </Stack>
    )
};