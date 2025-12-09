import { FC, useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Group, Select, Slider, Stack, Text, TextInput } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import { useCustomization } from '../../Providers/CustomizationProvider';
import type { TTattoo, TZoneTattoo } from '../../types/appearance';
import { IconPlus } from '../icons/IconPlus';
import { IconCancel } from '../icons/IconCancel';

const Tattoos: FC = () => {
  const { tattoos: tattooOptions, appearance, locale, setPlayerTattoos } = useAppearanceStore();
  const { theme } = useCustomization();

  const resolveCollection = (zoneIndex: number, dlcIndex: number) =>
    tattooOptions?.[zoneIndex]?.dlcs?.[dlcIndex]?.label;

  const normalizeList = (list: TTattoo[]) =>
    (list || []).map((tattoo) => {
      const zoneIndex = tattoo?.zoneIndex ?? 0;
      const dlcIndex = tattoo?.dlcIndex ?? 0;
      const collection = tattoo?.tattoo?.dlc ?? resolveCollection(zoneIndex, dlcIndex);
      return {
        ...tattoo,
        zoneIndex,
        dlcIndex,
        tattoo: tattoo.tattoo ? { ...tattoo.tattoo, dlc: collection } : tattoo.tattoo,
        opacity: typeof tattoo.opacity === 'number' ? tattoo.opacity : 0.1,
      };
    });

  const [rows, setRows] = useState<TTattoo[]>(normalizeList((appearance?.tattoos as TTattoo[]) || []));
  const [dlcSearch, setDlcSearch] = useState<Record<number, string>>({});
  const [tattooSearch, setTattooSearch] = useState<Record<number, string>>({});
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    setRows(normalizeList((appearance?.tattoos as TTattoo[]) || []));
  }, [appearance?.tattoos, tattooOptions]);

  const commit = (updater: (prev: TTattoo[]) => TTattoo[]) => {
    setRows((prev) => {
      const next = normalizeList(updater(prev || []));
      setPlayerTattoos(next);
      return next;
    });
  };

  const findFirstTattoo = (): { zoneIndex: number; dlcIndex: number; tattoo: TTattoo['tattoo'] } | null => {
    if (!tattooOptions) return null;
    for (let z = 0; z < tattooOptions.length; z += 1) {
      const dlcs = tattooOptions[z]?.dlcs || [];
      for (let d = 0; d < dlcs.length; d += 1) {
        const firstTattoo = dlcs[d]?.tattoos?.[0];
        if (firstTattoo) {
          return { zoneIndex: z, dlcIndex: d, tattoo: { ...firstTattoo, dlc: dlcs[d].label } };
        }
      }
    }
    return null;
  };

  const handleAdd = () => {
    const starter = findFirstTattoo();
    if (!starter) return;
    commit((prev) => [
      ...prev,
      {
        zoneIndex: starter.zoneIndex,
        dlcIndex: starter.dlcIndex,
        tattoo: starter.tattoo as TTattoo['tattoo'],
        opacity: 0.1,
        id: Date.now() + Math.floor(Math.random() * 1000),
      },
    ]);
  };

  const handleRemove = (index: number) => {
    commit((prev) => prev.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  const handleZoneChange = (rowIndex: number, value: string | null) => {
    const nextZone = value ? Number(value) : 0;
    commit((prev) => {
      const next = [...prev];
      const row = { ...next[rowIndex] };
      row.zoneIndex = nextZone;
      row.dlcIndex = 0;
      const dlc = tattooOptions?.[nextZone]?.dlcs?.find((d) => (d.tattoos || []).length > 0);
      if (dlc) {
        row.dlcIndex = dlc.dlcIndex ?? 0;
        row.tattoo = dlc.tattoos?.[0] ? { ...dlc.tattoos[0], dlc: dlc.label } : row.tattoo;
      }
      row.opacity = 0.1;
      next[rowIndex] = row;
      return next;
    });
  };

  const handleDlcChange = (rowIndex: number, value: string | null) => {
    const nextDlc = value ? Number(value) : 0;
    commit((prev) => {
      const next = [...prev];
      const row = { ...next[rowIndex] };
      const dlc = tattooOptions?.[row.zoneIndex]?.dlcs?.[nextDlc];
      row.dlcIndex = nextDlc;
      if (dlc?.tattoos?.[0]) {
        row.tattoo = { ...dlc.tattoos[0], dlc: dlc.label };
      }
      row.opacity = 0.1;
      next[rowIndex] = row;
      return next;
    });
  };

  const handleTattooChange = (rowIndex: number, value: string | null) => {
    const nextIndex = value ? Number(value) : 0;
    commit((prev) => {
      const next = [...prev];
      const row = { ...next[rowIndex] };
      const dlc = tattooOptions?.[row.zoneIndex]?.dlcs?.[row.dlcIndex];
      const selected = dlc?.tattoos?.[nextIndex];
      if (selected) {
        row.tattoo = { ...selected, dlc: dlc?.label };
      }
      row.opacity = 0.1;
      next[rowIndex] = row;
      return next;
    });
  };

  const handleOpacityChange = (rowIndex: number, value: number) => {
    commit((prev) => {
      const next = [...prev];
      const row = { ...next[rowIndex] };
      row.opacity = value;
      next[rowIndex] = row;
      return next;
    });
  };

  const filteredDlcs = (zoneIndex: number, key: number) => {
    const search = (dlcSearch[key] || '').toLowerCase();
    const dlcs = tattooOptions?.[zoneIndex]?.dlcs || [];
    if (!search) return dlcs;
    return dlcs.filter((dlc) => dlc.label.toLowerCase().includes(search));
  };

  const filteredTattoos = (zoneIndex: number, dlcIndex: number, key: number) => {
    const search = (tattooSearch[key] || '').toLowerCase();
    const tattoos = tattooOptions?.[zoneIndex]?.dlcs?.[dlcIndex]?.tattoos || [];
    if (!search) return tattoos;
    return tattoos.filter((tattoo) => tattoo.label.toLowerCase().includes(search));
  };

  const zoneOptions = useMemo(
    () => (tattooOptions || []).map((zone, idx) => ({ label: zone.label, value: String(idx) })),
    [tattooOptions]
  );

  if (!tattooOptions || tattooOptions.length === 0) {
    return (
      <Stack spacing="md" className="appearance-scroll" style={{ padding: '0.25rem 0.75rem' }}>
        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
          {locale?.NO_TATTOOS || 'No tattoos available'}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack
      spacing="lg"
      className="appearance-scroll"
      style={{
        padding: '0.25rem 0.75rem',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: '2rem',
      }}
    >
      {rows.length > 0 ? (
        rows.map((row, i) => {
          const rowKey = row.id ?? i;
          const zone = tattooOptions?.[row.zoneIndex];
          const dlcs = filteredDlcs(row.zoneIndex, rowKey);
          const dlc = zone?.dlcs?.[row.dlcIndex];
          const tattoos = filteredTattoos(row.zoneIndex, row.dlcIndex, rowKey);
          const selectedTattooIndex = Math.max(0, dlc?.tattoos?.findIndex((t) => t.hash === row.tattoo?.hash) ?? 0);

          return (
            <Box key={rowKey} style={{ width: '100%' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text fw={600} tt="uppercase" size="sm" c="white">{`${locale?.TATTOO_TITLE || 'Tattoo'} ${i + 1}`}</Text>
                <Group spacing="xs">
                  <Text size="xs" c="dimmed">
                    {locale?.TOTAL_SUBTITLE || 'Total'}: {tattooOptions.length}
                  </Text>
                  {deleteIndex === i ? (
                    <Group spacing="xs">
                      <Button size="xs" variant="light" color="gray" onClick={() => setDeleteIndex(null)}>
                        <IconCancel size={16} />
                      </Button>
                      <Button size="xs" color="red" onClick={() => handleRemove(i)}>
                        {locale?.CONFIRMREM_SUBTITLE || 'Confirm'}
                      </Button>
                    </Group>
                  ) : (
                    <Button size="xs" variant="light" color="red" onClick={() => setDeleteIndex(i)}>
                      <IconCancel size={16} />
                      {locale?.REMOVETATTOO_TITLE || 'Remove Tattoo'}
                    </Button>
                  )}
                </Group>
              </Box>

              <Stack spacing="sm">
                <Select
                  label={locale?.ZONE_TITLE || 'Zone'}
                  data={zoneOptions}
                  value={String(row.zoneIndex)}
                  onChange={(val) => handleZoneChange(i, val)}
                  searchable
                />

                <Box>
                  <Group position="apart" mb={4}>
                    <Text size="xs" c="dimmed">DLC</Text>
                    <Text size="xs" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: {zone?.dlcs?.length || 0}</Text>
                  </Group>
                  <TextInput
                    placeholder="Search DLC"
                    value={dlcSearch[rowKey] || ''}
                    onChange={(e) => setDlcSearch({ ...dlcSearch, [rowKey]: e.currentTarget.value })}
                    mb={4}
                  />
                  <Select
                    placeholder={locale?.DLCOPT_TITLE || 'Select DLC'}
                    data={dlcs.map((item, idx) => ({ label: item.label, value: String(item.dlcIndex ?? idx) }))}
                    value={String(row.dlcIndex)}
                    onChange={(val) => handleDlcChange(i, val)}
                    searchable
                  />
                </Box>

                {dlc && (dlc.tattoos?.length ?? 0) > 0 ? (
                  <Box>
                    <Group position="apart" mb={4}>
                      <Text size="xs" c="dimmed">{locale?.TATTOO_TITLE || 'Tattoo'}</Text>
                      <Text size="xs" c="dimmed">{locale?.TOTAL_SUBTITLE || 'Total'}: {dlc.tattoos?.length || 0}</Text>
                    </Group>
                    <TextInput
                      placeholder={locale?.SEARCHTATTOO_SUBTITLE || 'Search tattoo'}
                      value={tattooSearch[rowKey] || ''}
                      onChange={(e) => setTattooSearch({ ...tattooSearch, [rowKey]: e.currentTarget.value })}
                      mb={4}
                    />
                    <Select
                      placeholder={locale?.TATTOOPTIONS_SUBTITLE || 'Tattoo Options'}
                      data={tattoos.map((tattoo, idx) => ({ label: tattoo.label, value: String(idx) }))}
                      value={String(selectedTattooIndex)}
                      onChange={(val) => handleTattooChange(i, val)}
                      searchable
                    />
                  </Box>
                ) : (
                  <Text size="xs" c="dimmed">{locale?.NO_TATTOOS || 'No tattoos available in this DLC'}</Text>
                )}

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>{locale?.TATTOO_OPACITY || 'Opacity'}</Text>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={row.opacity ?? 0.1}
                    onChange={(value) => handleOpacityChange(i, value)}
                    styles={{ thumb: { borderColor: theme.primaryColor }, track: { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Box>
              </Stack>

              <Divider my="sm" />
            </Box>
          );
        })
      ) : (
        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
          {locale?.NO_TATTOOS || 'No tattoos applied'}
        </Text>
      )}

      <Button
        className="btn"
        style={{ width: '100%', height: '3vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5vh' }}
        onClick={handleAdd}
      >
        <IconPlus />
        <Text size="sm" fw={600}>
          {locale?.ADDTATTOO_TITLE || 'Add Tattoo'}
        </Text>
      </Button>
    </Stack>
  );
};

export default Tattoos;
