import { FC } from 'react';
import { Box, Button, Stack, Text, Grid, Divider } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadStructure, THeadOverlay, THeadOverlayTotal, TDrawTotal } from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';


export const Props: FC = () => {
    const { locale, appearance, blacklist, setProp } = useAppearanceStore();
    const props = appearance?.props;
    const propTotal: TDrawTotal = appearance?.propTotal || {};



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
            {props && Object.keys(props).length > 0 ? (
                <>
                    {propTotal && propTotal?.hats?.total > 0 ? (
                        <>
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.HATS_TITLE || 'Hats'}</Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Face'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.hats.total}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.hats.value || 0}
                                                min={-1}
                                                max={propTotal.hats.total}
                                                blacklist={blacklist?.props?.hats?.values || null}
                                                onChange={(val: number) => {
                                                    if (props && props.hats) {
                                                        props.hats.texture = 0;
                                                        setProp(props.hats, val);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Skin'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.hats.textures}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.hats.texture || 0}
                                                min={0}
                                                max={propTotal.hats.textures}
                                                blacklist={
                                                    typeof props?.hats.value === 'number'
                                                        ? blacklist?.props?.hats?.textures?.[props.hats.value] || null
                                                        : null
                                                }
                                                onChange={(val: number) => {
                                                    if (props && props.hats) {
                                                        props.hats.texture = 0;
                                                        setProp(props.hats, val, true);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </>
                    ) : null}

                    {propTotal && propTotal?.glasses?.total > 0 ? (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.GLASSES_TITLE || 'glasses'}</Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Face'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.glasses.total}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.glasses.value || 0}
                                                min={-1}
                                                max={propTotal.glasses.total}
                                                blacklist={blacklist?.props?.glasses?.values || null}
                                                onChange={(val: number) => {
                                                    if (props && props.glasses) {
                                                        props.glasses.texture = 0;
                                                        setProp(props.glasses, val);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Skin'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.glasses.textures}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.glasses.texture || 0}
                                                min={0}
                                                max={propTotal.glasses.textures}
                                                blacklist={
                                                    typeof props?.glasses.value === 'number'
                                                        ? blacklist?.props?.glasses?.textures?.[props.glasses.value] || null
                                                        : null
                                                }
                                                onChange={(val: number) => {
                                                    if (props && props.glasses) {
                                                        props.glasses.texture = 0;
                                                        setProp(props.glasses, val, true);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </>
                    ) : null}

                    {propTotal && propTotal?.earrings?.total > 0 ? (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.EARRINGS_TITLE || 'earrings'}</Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Face'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.earrings.total}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.earrings.value || 0}
                                                min={-1}
                                                max={propTotal.earrings.total}
                                                blacklist={blacklist?.props?.earrings?.values || null}
                                                onChange={(val: number) => {
                                                    if (props && props.earrings) {
                                                        props.earrings.texture = 0;
                                                        setProp(props.earrings, val);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Skin'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.earrings.textures}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.earrings.texture || 0}
                                                min={0}
                                                max={propTotal.earrings.textures}
                                                blacklist={
                                                    typeof props?.earrings.value === 'number'
                                                        ? blacklist?.props?.earrings?.textures?.[props.earrings.value] || null
                                                        : null
                                                }
                                                onChange={(val: number) => {
                                                    if (props && props.earrings) {
                                                        props.earrings.texture = 0;
                                                        setProp(props.earrings, val, true);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </>
                    ) : null}

                    {propTotal && propTotal?.watches?.total > 0 ? (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.WATCHES_TITLE || 'watches'}</Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Face'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.watches.total}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.watches.value || 0}
                                                min={-1}
                                                max={propTotal.watches.total}
                                                blacklist={blacklist?.props?.watches?.values || null}
                                                onChange={(val: number) => {
                                                    if (props && props.watches) {
                                                        props.watches.texture = 0;
                                                        setProp(props.watches, val);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Skin'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.watches.textures}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.watches.texture || 0}
                                                min={0}
                                                max={propTotal.watches.textures}
                                                blacklist={
                                                    typeof props?.watches.value === 'number'
                                                        ? blacklist?.props?.watches?.textures?.[props.watches.value] || null
                                                        : null
                                                }
                                                onChange={(val: number) => {
                                                    if (props && props.watches) {
                                                        props.watches.texture = 0;
                                                        setProp(props.watches, val, true);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </>
                    ) : null}

                    {propTotal && propTotal?.bracelets?.total > 0 ? (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.BRACELETS_TITLE || 'bracelets'}</Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Face'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.bracelets.total}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.bracelets.value || 0}
                                                min={-1}
                                                max={propTotal.bracelets.total}
                                                blacklist={blacklist?.props?.bracelets?.values || null}
                                                onChange={(val: number) => {
                                                    if (props && props.bracelets) {
                                                        props.bracelets.texture = 0;
                                                        setProp(props.bracelets, val);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Box>
                                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Skin'}</Text>
                                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {propTotal.bracelets.textures}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={props?.bracelets.texture || 0}
                                                min={0}
                                                max={propTotal.bracelets.textures}
                                                blacklist={
                                                    typeof props?.bracelets.value === 'number'
                                                        ? blacklist?.props?.bracelets?.textures?.[props.bracelets.value] || null
                                                        : null
                                                }
                                                onChange={(val: number) => {
                                                    if (props && props.bracelets) {
                                                        props.bracelets.texture = 0;
                                                        setProp(props.bracelets, val, true);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </>
                    ) : null}

                </>

            ) :
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                    {locale.NO_ACCESSORIES || "You can't modify your accessories"}
                </Text>}



        </Stack>
    )
};

