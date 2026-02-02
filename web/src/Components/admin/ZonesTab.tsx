import { FC, useState } from 'react';
import { Stack, Group, Text, Button, Select, Box, Badge, ActionIcon, Accordion } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconMapPin } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface Zone {
  id?: number;
  type: 'clothing' | 'barber' | 'tattoo' | 'surgeon' | 'outfits';
  coords: { x: number; y: number; z: number; w?: number };
  polyzone?: { x: number; y: number }[];
  showBlip: boolean;
  blipSprite?: number;
  blipColor?: number;
  blipScale?: number;
  blipName?: string;
  enablePed?: boolean;
  job?: string;
  gang?: string;
  name?: string;
}

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any;
}

interface ZonesTabProps {
  zones: Zone[];
  setZones: (zones: Zone[]) => void;
  onOpenZoneModal: (zone?: Zone) => void;
  appearanceSettings: { blips?: Record<string, { sprite?: number; color?: number; scale?: number; name?: string }> };
  locale: { [key: string]: string };
}

export const ZonesTab: FC<ZonesTabProps> = ({
  zones,
  setZones,
  onOpenZoneModal,
  appearanceSettings,
  locale,
}) => {
  const [expandedZoneType, setExpandedZoneType] = useState<string | null>(null);

  const getBlipDefaults = (type: Zone['type']) => {
    return (appearanceSettings?.blips && appearanceSettings.blips[type]) || {};
  };

  const typeColors: Record<Zone['type'], string> = {
    clothing: 'blue',
    barber: 'cyan',
    tattoo: 'violet',
    surgeon: 'pink',
    outfits: 'teal'
  };

  const typeLabels: Record<Zone['type'], string> = {
    clothing: locale.ADMIN_ZONE_TYPE_CLOTHING || 'Clothing',
    barber: locale.ADMIN_ZONE_TYPE_BARBER || 'Barber',
    tattoo: locale.ADMIN_ZONE_TYPE_TATTOO || 'Tattoo',
    surgeon: locale.ADMIN_ZONE_TYPE_SURGEON || 'Surgeon',
    outfits: locale.ADMIN_ZONE_TYPE_OUTFITS || 'Outfits'
  };

  const zoneTypes = ['clothing', 'barber', 'tattoo', 'surgeon', 'outfits'] as const;
  const groupedZones = zoneTypes.map(type => ({
    type,
    zones: zones.filter(z => z.type === type)
  })).filter(group => group.zones.length > 0);

  return (
    <Stack spacing="lg">
      <Group position="apart">
        <Text c="white" fw={500}>
          {locale.ADMIN_TAB_ZONES || 'Appearance Zones'}
        </Text>
        <Button onClick={() => onOpenZoneModal()}>
          <IconPlus size={16} style={{ marginRight: 8 }} />
          {locale.ADMIN_ADD_ZONE || 'Add Zone'}
        </Button>
      </Group>

      {zones.length === 0 ? (
        <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          {locale.ADMIN_MSG_NO_ZONES || 'No zones configured'}
        </Box>
      ) : (
        <Accordion
          chevronPosition="right"
          variant="separated"
          value={expandedZoneType}
          onChange={setExpandedZoneType}
          styles={{
            item: {
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '0.5rem',
            },
            control: {
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            },
          }}
        >
          {groupedZones.map((group) => (
            <Accordion.Item key={group.type} value={group.type}>
              <Accordion.Control>
                <Group position="apart" style={{ width: '100%', paddingRight: '1rem' }}>
                  <Group spacing="sm">
                    <Badge size="lg" color={typeColors[group.type]} variant="filled">
                      {typeLabels[group.type]}
                    </Badge>
                    <Badge size="sm" color="gray" variant="outline">
                      {group.zones.length} zone{group.zones.length !== 1 ? 's' : ''}
                    </Badge>
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack spacing="md">
                  {group.zones.map((zone, idx) => {
                    const uniqueKey = zone.id ? `zone-${zone.id}` : `${group.type}-temp-${idx}-${zones.indexOf(zone)}`;
                    return (
                      <Group
                        key={uniqueKey}
                        position="apart"
                        style={{
                          padding: '1rem',
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          borderRadius: 6,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <Group spacing="sm" mb={6}>
                            {zone.job && <Badge size="xs" color="green">{locale.ADMIN_BADGE_JOB || 'Job'}: {zone.job}</Badge>}
                            {zone.gang && <Badge size="xs" color="purple">{locale.ADMIN_BADGE_GANG || 'Gang'}: {zone.gang}</Badge>}
                            {!zone.showBlip && <Badge size="xs" color="gray">{locale.ADMIN_BADGE_BLIP_HIDDEN || 'Blip Hidden'}</Badge>}
                            {zone.enablePed && <Badge size="xs" color="orange">{locale.ADMIN_BADGE_PED || 'Ped Enabled'}</Badge>}
                            {zone.polyzone && <Badge size="xs" color="indigo">{zone.polyzone.length} {locale.ADMIN_MSG_POLYZONE_POINTS || 'points'}</Badge>}
                          </Group>
                          <Text c="white" size="sm" fw={500} mb={4}>
                            {zone.name || (locale.ADMIN_MSG_UNNAMED_ZONE || 'Unnamed Zone')}
                          </Text>
                          <Group spacing="xs">
                            <Text c="gray.4" size="xs">
                              <span style={{ fontWeight: 500 }}>Coords:</span> {zone.coords.x.toFixed(2)}, {zone.coords.y.toFixed(2)}, {zone.coords.z.toFixed(2)}
                            </Text>
                            {zone.coords.w !== undefined && zone.coords.w !== 0 && (
                              <Text c="gray.4" size="xs">
                                <span style={{ fontWeight: 500 }}>Heading:</span> {zone.coords.w.toFixed(1)}°
                              </Text>
                            )}
                          </Group>
                        </div>
                        <Group spacing="xs" ml="md">
                          <ActionIcon 
                            color="cyan"
                            variant="light"
                            onClick={() => {
                              TriggerNuiCallback('teleportToZone', {
                                x: zone.coords.x,
                                y: zone.coords.y,
                                z: zone.coords.z,
                                heading: zone.coords.w || 0
                              });
                            }}
                          >
                            <IconMapPin size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            color="blue"
                            variant="light"
                            onClick={() => {
                              onOpenZoneModal(zone);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            color="red"
                            variant="light"
                            onClick={() => {
                              TriggerNuiCallback('deleteZone', zone.id).then(() => {
                                setZones(zones.filter(z => z.id !== zone.id));
                              });
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Stack>
  );
};