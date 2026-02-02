import { FC, useState, useEffect, useMemo, Suspense } from 'react';
import { Box, Button, Modal, Stack, Text } from '@mantine/core';
import { CameraShape } from './micro/CameraShape';
import {
  IconCancel,
  IconSave,
  IconLock,
  IconToggle,
  IconHat,
  IconMask,
  IconGlasses,
  IconShirt,
  IconJacket,
  IconVest,
  IconPants,
  IconShoes,
  iconsMap,
} from './icons/Icons';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import { useCustomization } from '../Providers/CustomizationProvider';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
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

interface AppearanceNavProps {
  animateIn?: boolean;
}

export const AppearanceNav: FC<AppearanceNavProps> = ({ animateIn }) => {
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
  
  const { theme } = useCustomization();

  const hexToRgba = (hex: string, alpha = 0.2) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [limit, setLimit] = useState<number>(0);
  const [showToggles, setShowToggles] = useState<boolean>(false);
  const [modal, setModal] = useState<'close' | 'save' | null>(null);
  // Animation for nav tabs - triggered by animateIn or tabs loading
  useEffect(() => {
    if (animateIn && tabs.length > 0) {
      setLimit(0); // Reset animation
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
    }
  }, [animateIn, tabs.length]);

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
    setModal(null);
    
    if (modal === 'save') {
      if (appearance) {
        TriggerNuiCallback(Send.save, appearance);
      }
    } else if (modal === 'close') {
      if (originalAppearance) {
        TriggerNuiCallback(Send.cancel, originalAppearance);
      }
    }
  };

  return (
    <>
      {/* Main Navigation Tabs */}
      <Box
        component="nav"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -9999,
          width: '0',
          height: '0',
          pointerEvents: 'none',
        }}
      >
        {tabs.map((tab, index) => {
          const selected = selectedTab?.id === tab.id;
          const iconName = tab.icon || `Icon${tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}`;
          const IconComponent = iconsMap[iconName] || null;
          const [x, y] = pointIcon(
            0,  // center x
            0,  // center y
            40,  // radius in rem
            pieAngle * (tabs.length - index) - pieAngle / 2,
            limit
          );

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
                pointerEvents: 'auto',
                left: `${x}rem`,
                top: `${y}rem`,
                transform: 'translate(-50%, -50%)',
                animation: 'scaleIn 0.75s ease-out',
                opacity: limit > 0 ? 1 : 0,
                transition: 'opacity 0.75s ease-out, transform 0.75s ease-out',
                background: 'transparent',
                border: 'none',
              }}
            >
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <CameraShape
                  type={theme.shape || 'hexagon'}
                  stroke={selected ? theme.primaryColor : theme.inactiveColor}
                  fill={selected ? hexToRgba(theme.primaryColor, 0.2) : hexToRgba(theme.inactiveColor, 0.2)}
                  strokeWidth={2}
                />
                <Box
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  {IconComponent && (
                    <Suspense fallback={null}>
                      <IconComponent size={48} />
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
              <CameraShape type={theme.shape || 'hexagon'} stroke={'#ef4444'} fill={'rgba(239,68,68,0.2)'} strokeWidth={6} />
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
                <IconCancel size={24} />
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
            <CameraShape type={theme.shape || 'hexagon'} stroke={'#10b981'} fill={'rgba(16,185,129,0.2)'} strokeWidth={4} />
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
              {allValid ? <IconSave size={42} /> : <IconLock size={42} />}
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
            <CameraShape
              type={theme.shape || 'hexagon'}
              stroke={showToggles ? theme.primaryColor : theme.inactiveColor}
              fill={showToggles ? hexToRgba(theme.primaryColor, 0.2) : hexToRgba(theme.inactiveColor, 0.2)}
              strokeWidth={6}
            />
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
              <IconToggle size={24} />
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
                  <CameraShape
                    type={theme.shape || 'hexagon'}
                    stroke={toggle ? theme.primaryColor : theme.inactiveColor}
                    fill={toggle ? hexToRgba(theme.primaryColor, 0.2) : hexToRgba(theme.inactiveColor, 0.2)}
                    strokeWidth={4}
                  />
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

      {/* Modal - Custom Implementation */}
      {modal !== null && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            pointerEvents: 'auto',
            color: 'white',
          }}
          onClick={() => setModal(null)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
              padding: '2rem',
              minWidth: '400px',
              maxWidth: '600px',
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
                  ? locale?.CLOSE_TITLE || 'Close'
                  : locale?.SAVE_TITLE || 'Save'
                : locale?.LOCKED_TITLE || 'Locked'}
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
                ? `${locale?.CLOSE_SUBTITLE || 'Are you sure you want to'} ${modal === 'close' ? locale?.CLOSELOSE_SUBTITLE || 'close without saving' : locale?.SAVEAPPLY_SUBTITLE || 'save and apply changes'
                } ${locale?.CLOSE2_SUBTITLE || '?'}`
                : locale?.CANT_SAVE || 'You cannot save with locked items selected.'}
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
              <Text>{allValid || modal === 'close' ? locale?.CANCEL_TITLE || 'Cancel' : locale?.OK_TITLE || 'OK'}</Text>
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
                <Text>{modal === 'close' ? locale?.CLOSE_TITLE || 'Close' : locale?.SAVE_TITLE || 'Save'}</Text>
              </Button>
            )}
          </Box>

        </Stack>
          </Box>
        </Box>
      )}

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
