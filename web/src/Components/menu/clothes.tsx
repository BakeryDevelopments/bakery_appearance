import { FC } from 'react';
import { Box, Stack, Text, Grid, Divider } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { THeadStructure, TDrawTotal } from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';


export const ClothesMenu: FC = () => {
    const { appearance, blacklist, locale,disableConfig, setDrawable } = useAppearanceStore();

    const drawTotal: TDrawTotal | null = appearance?.drawTotal || null;
    const drawables: THeadStructure = appearance?.drawables || {};

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

                
            {!disableConfig?.Components?.masks === true && drawTotal && drawTotal?.masks?.total > 0 ? (
                <>
                    <Box>
                        <Text fw={"bold"} mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.MASK_TITLE || 'Mask'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Design'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.masks.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.masks.value || 0}
                                        min={0}
                                        max={drawTotal.masks.total - 1}
                                        blacklist={blacklist?.drawables?.masks?.values || null}
                                        onChange={(val: number) => {
                                            drawables.masks.texture = 0;
                                            setDrawable(drawables.masks, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.masks.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.masks.texture || 0}
                                        min={0}
                                        max={drawTotal.masks.textures - 1}
                                        blacklist={blacklist?.drawables?.masks?.textures?.[drawables.masks.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.masks, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.jackets === true && drawTotal && drawTotal?.jackets?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.JACKET_TITLE || 'Jacket'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.jackets.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.jackets.value || 0}
                                        min={0}
                                        max={drawTotal.jackets.total - 1}
                                        blacklist={blacklist?.drawables?.jackets?.values || null}
                                        onChange={(val: number) => {
                                            drawables.jackets.texture = 0;
                                            setDrawable(drawables.jackets, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.jackets.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.jackets.texture || 0}
                                        min={0}
                                        max={drawTotal.jackets.textures - 1}
                                        blacklist={blacklist?.drawables?.jackets?.textures?.[drawables.jackets.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.jackets, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.shirts === true && drawTotal && drawTotal?.shirts?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.SHIRT_TITLE || 'Jacket'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.shirts.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.shirts.value || 0}
                                        min={0}
                                        max={drawTotal.shirts.total - 1}
                                        blacklist={blacklist?.drawables?.shirts?.values || null}
                                        onChange={(val: number) => {
                                            drawables.shirts.texture = 0;
                                            setDrawable(drawables.shirts, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.shirts.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.shirts.texture || 0}
                                        min={0}
                                        max={drawTotal.shirts.textures - 1}
                                        blacklist={blacklist?.drawables?.shirts?.textures?.[drawables.shirts.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.shirts, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.torsos === true && drawTotal && drawTotal?.torsos?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.ARMS_TITLE || 'Arms'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.torsos.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.torsos.value || 0}
                                        min={0}
                                        max={drawTotal.torsos.total - 1}
                                        blacklist={blacklist?.drawables?.torsos?.values || null}
                                        onChange={(val: number) => {
                                            drawables.torsos.texture = 0;
                                            setDrawable(drawables.torsos, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.torsos.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.torsos.texture || 0}
                                        min={0}
                                        max={drawTotal.torsos.textures - 1}
                                        blacklist={blacklist?.drawables?.torsos?.textures?.[drawables.torsos.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.torsos, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.vest === true && drawTotal && drawTotal?.vest?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.VEST_TITLE || 'Vest'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.vest.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.vest.value || 0}
                                        min={0}
                                        max={drawTotal.vest.total - 1}
                                        blacklist={blacklist?.drawables?.vest?.values || null}
                                        onChange={(val: number) => {
                                            drawables.vest.texture = 0;
                                            setDrawable(drawables.vest, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.vest.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.vest.texture || 0}
                                        min={0}
                                        max={drawTotal.vest.textures - 1}
                                        blacklist={blacklist?.drawables?.vest?.textures?.[drawables.vest.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.vest, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.legs === true && drawTotal && drawTotal?.legs?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.LEGS_TITLE || 'Legs'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.legs.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.legs.value || 0}
                                        min={0}
                                        max={drawTotal.legs.total - 1}
                                        blacklist={blacklist?.drawables?.legs?.values || null}
                                        onChange={(val: number) => {
                                            drawables.legs.texture = 0;
                                            setDrawable(drawables.legs, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.legs.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.legs.texture || 0}
                                        min={0}
                                        max={drawTotal.legs.textures - 1}
                                        blacklist={blacklist?.drawables?.legs?.textures?.[drawables.legs.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.legs, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.shoes === true && drawTotal && drawTotal?.shoes?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.SHOES_TITLE || 'Shoes'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.shoes.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.shoes.value || 0}
                                        min={0}
                                        max={drawTotal.shoes.total - 1}
                                        blacklist={blacklist?.drawables?.shoes?.values || null}
                                        onChange={(val: number) => {
                                            drawables.shoes.texture = 0;
                                            setDrawable(drawables.shoes, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.shoes.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.shoes.texture || 0}
                                        min={0}
                                        max={drawTotal.shoes.textures - 1}
                                        blacklist={blacklist?.drawables?.shoes?.textures?.[drawables.shoes.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.shoes, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.bags === true && drawTotal && drawTotal?.bags?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.BAGS_TITLE || 'Bags'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.bags.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.bags.value || 0}
                                        min={0}
                                        max={drawTotal.bags.total - 1}
                                        blacklist={blacklist?.drawables?.bags?.values || null}
                                        onChange={(val: number) => {
                                            drawables.bags.texture = 0;
                                            setDrawable(drawables.bags, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.bags.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.bags.texture || 0}
                                        min={0}
                                        max={drawTotal.bags.textures - 1}
                                        blacklist={blacklist?.drawables?.bags?.textures?.[drawables.bags.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.bags, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.neck === true && drawTotal && drawTotal?.neck?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.NECK_TITLE || 'Necklace'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.neck.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.neck.value || 0}
                                        min={0}
                                        max={drawTotal.neck.total - 1}
                                        blacklist={blacklist?.drawables?.neck?.values || null}
                                        onChange={(val: number) => {
                                            drawables.neck.texture = 0;
                                            setDrawable(drawables.neck, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.neck.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.neck.texture || 0}
                                        min={0}
                                        max={drawTotal.neck.textures - 1}
                                        blacklist={blacklist?.drawables?.neck?.textures?.[drawables.neck.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.neck, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}

            {!disableConfig?.Components?.decals === true && drawTotal && drawTotal?.decals?.total > 0 ? (
                <>
                    <Divider />
                    <Box>
                        <Text fw="bold" mb="sm" ta="right" tt="uppercase" size="md" c="white">{locale?.DECALS_TITLE || 'Decals'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Face'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.decals.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.decals.value || 0}
                                        min={0}
                                        max={drawTotal.decals.total - 1}
                                        blacklist={blacklist?.drawables?.decals?.values || null}
                                        onChange={(val: number) => {
                                            drawables.decals.texture = 0;
                                            setDrawable(drawables.decals, val);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="gray.4">{locale?.DESIGN_SUBTITLE || 'Skin'}</Text>
                                        <Text size="sm" c="gray.4">{locale?.TOTAL_SUBTITLE || 'Total'}: {drawTotal.decals.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables.decals.texture || 0}
                                        min={0}
                                        max={drawTotal.decals.textures - 1}
                                        blacklist={blacklist?.drawables?.decals?.textures?.[drawables.decals.value] || null}
                                        onChange={(val: number) => {
                                            setDrawable(drawables.decals, val, true);
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                </>
            ) : null}


        </Stack>
    )
}
