import { FC, useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Box, Button, Modal, Stack, Text } from '@mantine/core';
import { Hexagon } from './micro/Hexagon';
import { IconCancel } from './icons/IconCancel';
import { IconSave } from './icons/IconSave';
import { IconLock } from './icons/IconLock';
import { IconToggle } from './icons/IconToggle';
import { IconHat, IconMask, IconGlasses, IconShirt, IconJacket, IconVest, IconPants, IconShoes } from './icons/ToggleIcons';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import { SendEvent } from '../Utils/eventsHandlers';
import { Send } from '../enums/events';
import type { TTab, TDrawables, TProps } from '../types/appearance';

const centerX: number = -0.3125; // -5vh converted to rem (-5/16)

const degToRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const pointIcon = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  limit: number
): [string, string] => {
  angle = angle + limit / 2 + limit;
  const radians = degToRad(angle);
  const x = centerX + radius * Math.cos(radians);
  const y = centerY + radius * Math.sin(radians);
  return [x.toPrecision(5), y.toPrecision(5)];
};

interface ToggleItem {
  id: string;
  type: 'props' | 'drawables';
  icon: string;
  hook?: {
    drawables?: Array<{
      component: number;
      variant: number;
      texture: number;
      id: string;
    }>;
  };
}

const toggleOrder: ToggleItem[] = [
  { id: 'hats', type: 'props', icon: 'IconHat' },
  { id: 'masks', type: 'drawables', icon: 'IconMask' },
  { id: 'glasses', type: 'props', icon: 'IconGlasses' },
  {
    id: 'shirts',
    type: 'drawables',
    icon: 'IconShirt',
    hook: {
      drawables: [
        { component: 3, variant: 15, texture: 0, id: 'torsos' },
        { component: 8, variant: 15, texture: 0, id: 'shirts' },
      ],
    },
  },
  {
    id: 'jackets',
    type: 'drawables',
    icon: 'IconJacket',
    hook: {
      drawables: [
        { component: 3, variant: 15, texture: 0, id: 'torsos' },
        { component: 11, variant: 15, texture: 0, id: 'jackets' },
      ],
    },
  },
  { id: 'vest', type: 'drawables', icon: 'IconVest' },
  { id: 'legs', type: 'drawables', icon: 'IconPants' },
  { id: 'shoes', type: 'drawables', icon: 'IconShoes' },
];

const toggleIconMap: { [key: string]: FC<{ size?: number }> } = {
  IconHat: IconHat,
  IconMask: IconMask,
  IconGlasses: IconGlasses,
  IconShirt: IconShirt,
  IconJacket: IconJacket,
  IconVest: IconVest,
  IconPants: IconPants,
  IconShoes: IconShoes,
};

export const AppearanceNav: FC = () => {
  const {
    tabs,
    selectedTab,
    setSelectedTab,
    isValid,
    allowExit,
    locale,
    originalAppearance,
    appearance,
    toggles,
    toggleItem,
  } = useAppearanceStore();

  const [limit, setLimit] = useState<number>(0);
  const [showToggles, setShowToggles] = useState<boolean>(false);
  const [modal, setModal] = useState<'close' | 'save' | null>(null);
  const [iconComponents, setIconComponents] = useState<{ [key: string]: FC<any> }>({});

  // Animation for nav tabs
  useEffect(() => {
    const limitRef: number[] = [112, 107, 100, 100, 97, 93, 93];
    const timeout = setTimeout(() => {
      let target = 90;
      if (tabs.length < 8) {
        target = limitRef[tabs.length - 1];
      }

      // Animate from 0 to target
      let current = 0;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic in-out easing
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        current = eased * target;
        setLimit(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, 250);

    return () => clearTimeout(timeout);
  }, [tabs.length]);

  // Dynamically load tab icons
  useEffect(() => {
    const loadIcons = async () => {
      const components: { [key: string]: FC<any> } = {};

      for (const tab of tabs) {
        try {
          const iconModule = await import(`./icons/${tab.icon}.tsx`);
          components[tab.icon] = iconModule.default || iconModule[tab.icon];
        } catch (error) {
          console.warn(`Failed to load icon: ${tab.icon}`, error);
        }
      }

      setIconComponents(components);
    };

    if (tabs.length > 0) {
      loadIcons();
    }
  }, [tabs]);

  const innerSize = 7.5; // 120vh converted to rem (120/16)
  const innerRadius = innerSize / 2;

  const pieAngle = useMemo(() => {
    const tabCount = tabs.length < 8 ? 8 : tabs.length > 8 ? 8 : tabs.length;
    return limit / tabCount;
  }, [limit, tabs.length]);

  const allValid = useMemo(() => {
    return Object.values(isValid).every((value) => value === true);
  }, [isValid]);

  const handleToggleClick = (item: ToggleItem) => {
    if (!appearance) return;

    const data = appearance[item.type][item.id as keyof (TDrawables | TProps)];
    let hookData: any[] = [];

    if (item.hook?.drawables) {
      for (const d of item.hook.drawables) {
        hookData.push(appearance.drawables[d.id as keyof TDrawables]);
      }
    }

    if (data) {
      const currentToggle = toggles[item.id as keyof typeof toggles];
      toggleItem(item.id, !currentToggle, data, item.hook, hookData);
    }
  };

  const handleSaveOrClose = () => {
    if (modal === 'save') {
      if (appearance) {
        SendEvent(Send.save, appearance);
      }
    } else if (modal === 'close') {
      if (originalAppearance) {
        SendEvent(Send.cancel, originalAppearance);
      }
    }
    setModal(null);
  };

  return (
    <>
      {/* Main Navigation Tabs */}
      <Box
        component="nav"
        style={{
          position: 'relative',
          zIndex: 9999,
          width: 'fit-content',
          height: 'fit-content',
          borderRadius: '9999px',
        }}
      >
        {tabs.map((tab, index) => {
          const selected = selectedTab?.id === tab.id;
          const [x, y] = pointIcon(
            centerX,
            centerX,
            innerRadius,
            pieAngle * (index + 1) - pieAngle / 2,
            limit
          );
          const IconComponent = iconComponents[tab.icon];

          return (
            <Button
              key={tab.id}
              unstyled
              onClick={() => {
                if (!selected) {
                  setSelectedTab(tab);
                }
              }}
              style={{
                width: '10vh',
                height: '10vh',
                position: 'absolute',
                display: 'grid',
                placeItems: 'center',
                transformOrigin: 'center',
                overflow: 'visible',
                cursor: 'pointer',
                left: `${x}vh`,
                top: `${y}vh`,
                animation: 'scaleIn 0.75s ease-out',
                opacity: limit > 0 ? 1 : 0,
                transform: limit > 0 ? 'scale(1)' : 'scale(0)',
                transition: 'opacity 0.75s ease-out, transform 0.75s ease-out',
                background: 'transparent',
                border: 'none',
              }}
            >
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'transform 0.15s ease-in-out',
                }}
              >
                <Hexagon active={selected} />
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {IconComponent && (
                    <Suspense fallback={null}>
                      <IconComponent />
                    </Suspense>
                  )}
                </Box>
              </Box>
            </Button>
          );
        })}
      </Box>

      {/* Save/Cancel Buttons */}
      <Box
        style={{
          position: 'absolute',
          left: '2vh',
          bottom: '2vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Cancel Button */}
        {allowExit && (
          <Button
            unstyled
            onClick={() => setModal('close')}
            style={{
              width: '5vh',
              aspectRatio: '1',
              display: 'grid',
              placeItems: 'center',
              overflow: 'visible',
              position: 'absolute',
              transform: 'translate(120%, -95%)',
              animation: 'scaleIn 0.75s ease-out 1.25s backwards',
              background: 'transparent',
              border: 'none',
            }}
          >
            <Box
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                transition: 'transform 0.15s ease-in-out',
              }}
            >
              <Hexagon active={true} variant="error" strokeWidth="1vh" />
              <Box
                style={{
                  width: '3vh',
                  height: '100%',
                  position: 'absolute',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  transition: 'transform 0.15s ease-in-out'
                }}
                sx={{
                  '&:hover': {
                    transform: 'scale(1.25)',
                    transition: 'transform 0.15s ease-in-out'
                  },
                }}
              >
                <IconCancel />
              </Box>
            </Box>
          </Button>
        )}

        {/* Save Button */}
        <Button
          unstyled
          onClick={() => setModal('save')}
          style={{
            width: '10vh',
            aspectRatio: '1',
            display: 'grid',
            placeItems: 'center',
            overflow: 'visible',
            animation: 'scaleIn 0.75s ease-out 1s backwards',
            background: 'transparent',
            border: 'none',
          }}
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              transition: 'transform 0.15s ease-in-out',
            }}
          >
            <Hexagon active={true} variant="success" />
            <Box
              style={{
                width: '8vh',
                height: '100%',
                position: 'absolute',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                transition: 'transform 0.15s ease-in-out'
              }}
              sx={{
                '&:hover': {
                  transform: 'scale(1.5) ',
                  transition: 'transform 0.15s ease-in-out'
                },
              }}
            >
              {allValid ? <IconSave /> : <IconLock />}
            </Box>
          </Box>
        </Button>

        {/* Toggle Button */}
        <Button
          unstyled
          onClick={() => setShowToggles(!showToggles)}
          style={{
            height: '5.5vh',
            width: '5vh',
            position: 'absolute',
            display: 'grid',
            placeItems: 'center',
            transformOrigin: 'center',
            cursor: 'pointer',
            transform: 'translate(25%, -140%)',
            animation: 'scaleIn 0.75s ease-out 1s backwards',
            background: 'transparent',
            border: 'none',
          }}
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              transformOrigin: 'center',
              transition: 'transform 0.15s ease-in-out',
            }}
          >
            <Hexagon active={showToggles} strokeWidth="1vh" />
            <Box
              style={{
                width: '100%',
                height: 'fit-content',
                display: 'grid',
                position: 'absolute',
                placeItems: 'center',
                fill: 'white',
                color: 'white',
                transition: 'transform 0.15s ease-in-out'
              }}
              sx={{
                '&:hover': {
                  transform: 'scale(1.25)',
                  transition: 'transform 0.15s ease-in-out'
                },
              }}
            >
              <IconToggle />
            </Box>
          </Box>
        </Button>
      </Box>

      {/* Toggle Menu */}
      <Box
        style={{
          width: '7vh',
          left: '3vh',
          position: 'absolute',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1vh',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: -30,
        }}
      >
        {showToggles &&
          toggleOrder.map((item, i) => {
            const toggle = toggles[item.id as keyof typeof toggles];
            const ToggleIcon = toggleIconMap[item.icon];

            return (
              <Button
                key={item.id}
                unstyled
                onClick={() => handleToggleClick(item)}
                style={{
                  height: '7vh',
                  width: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  transformOrigin: 'center',
                  cursor: 'pointer',
                  animation: 'scaleIn 0.75s ease-out',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    transformOrigin: 'center',
                    transition: 'transform 0.15s ease-in-out',
                  }}
                  sx={{
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Hexagon active={toggle} />
                  <Box
                    style={{
                      width: '4vh',
                      height: '4vh',
                      display: 'grid',
                      position: 'absolute',
                      placeItems: 'center',
                      fill: 'white',
                      color: 'white',
                    }}
                  >
                    {ToggleIcon && <ToggleIcon size={32} />}
                  </Box>
                </Box>
              </Button>
            );
          })}
      </Box>

      {/* Modal */}
      <Modal
        opened={modal !== null}
        onClose={() => setModal(null)}
        centered
        withCloseButton={false}
        overlayProps={{
          opacity: 0.5,
          blur: 3,
        }}
        styles={{
          content: {
            background: 'rgba(0, 0, 0, 0.9)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.25rem',
            filter: 'drop-shadow(0 0 0.25rem rgba(0, 0, 0, 1))',
          },
          body: {
            padding: '1rem 2rem',
          },
        }}
      >
        <Stack spacing="2vh" align="center">
          <Box style={{ width: '100%', display: 'grid', placeItems: 'center' }}>
            <Text
              size="2vh"
              weight={600}
              transform="uppercase"
              style={{ fontSize: '2vh', fontWeight: 600, textTransform: 'uppercase' }}
            >
              {allValid || modal === 'close'
                ? modal === 'close'
                  ? locale.CLOSE_TITLE
                  : locale.SAVE_TITLE
                : locale.LOCKED_TITLE}
            </Text>
          </Box>

          <Box style={{ width: '100%', display: 'grid', placeItems: 'center' }}>
            <Text
              size="1.5vh"
              align="center"
              style={{
                fontSize: '1.5vh',
                opacity: 0.75,
                textAlign: 'center',
              }}
            >
              {allValid || modal === 'close'
                ? `${locale.CLOSE_SUBTITLE} ${modal === 'close' ? locale.CLOSELOSE_SUBTITLE : locale.SAVEAPPLY_SUBTITLE
                } ${locale.CLOSE2_SUBTITLE}`
                : locale.CANT_SAVE}
            </Text>
          </Box>

          <Box
            style={{
              width: '100%',
              height: '5vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2vh',
            }}
          >
            <Button
              onClick={() => setModal(null)}
              styles={{
                root: {
                  background: 'rgba(239, 68, 68, 0.5)',
                  border: '0.25vh solid rgba(239, 68, 68, 0.5)',
                  width: '10vh',
                  height: '5vh',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.7)',
                  },
                },
              }}
            >
              <Text>{allValid || modal === 'close' ? locale.CANCEL_TITLE : locale.OK_TITLE}</Text>
            </Button>

            {(allValid || modal === 'close') && (
              <Button
                onClick={handleSaveOrClose}
                styles={{
                  root: {
                    background: 'rgba(16, 185, 129, 0.5)',
                    border: '0.25vh solid rgba(16, 185, 129, 0.5)',
                    width: '10vh',
                    height: '5vh',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(16, 185, 129, 0.7)',
                    },
                  },
                }}
              >
                <Text>{modal === 'close' ? locale.CLOSE_TITLE : locale.SAVE_TITLE}</Text>
              </Button>
            )}
          </Box>
        </Stack>
      </Modal>

      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
};
