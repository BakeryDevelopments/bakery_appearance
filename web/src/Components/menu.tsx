import { FC, useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { Box, Text } from '@mantine/core';
import { Divider } from './micro/Divider';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import classes from './menu.module.css';

// Icon imports will be dynamic
const iconCache: Record<string, ComponentType> = {};

export const AppearanceMenu: FC = () => {
  const { selectedTab, locale } = useAppearanceStore();
  const [showContent, setShowContent] = useState(false);
  const [IconComponent, setIconComponent] = useState<ComponentType | null>(null);
  const [MenuComponent, setMenuComponent] = useState<ComponentType | null>(null);

  // Show content after initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1250);

    return () => clearTimeout(timer);
  }, []);

  // Load icon dynamically when tab changes
  useEffect(() => {
    if (selectedTab?.icon) {
      const loadIcon = async () => {
        try {
          // Check cache first
          if (iconCache[selectedTab.icon!]) {
            setIconComponent(() => iconCache[selectedTab.icon!]);
            return;
          }

          // Dynamic import
          const module = await import(`./icons/${selectedTab.icon}.tsx`);
          const Icon = module.default || module[Object.keys(module)[0]];
          iconCache[selectedTab.icon!] = Icon;
          setIconComponent(() => Icon);
        } catch (error) {
          console.error(`Failed to load icon: ${selectedTab.icon}`, error);
          setIconComponent(null);
        }
      };

      loadIcon();
    } else {
      setIconComponent(null);
    }
  }, [selectedTab?.icon]);

  // Load menu component dynamically when tab changes
  useEffect(() => {
    if (selectedTab?.src) {
      const loadMenu = async () => {
        try {
          const module = await import(`./menu/${selectedTab.src}.tsx`);
          const Menu = module.default || module[Object.keys(module)[0]];
          setMenuComponent(() => Menu);
        } catch (error) {
          console.error(`Failed to load menu: ${selectedTab.src}`, error);
          setMenuComponent(null);
        }
      };

      loadMenu();
    } else {
      setMenuComponent(null);
    }
  }, [selectedTab?.src]);

  if (!selectedTab) return null;

  const { id, label } = selectedTab;

  return (
    <Box
      className={classes.menuContainer}
      style={{
        width: '40vh',
        height: '100vh',
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        paddingRight: '2vh',
        paddingTop: '2vh',
      }}
    >
      <Box
        className={classes.scaleX}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          fontSize: '3vh',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        <Box style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Text
            key={`label-${id}`}
            className={classes.flyInRight}
            style={{ position: 'absolute' }}
          >
            {label} &#8205;
          </Text>
        </Box>

        <Text style={{ color: 'var(--mantine-color-blue-6)' }}>
          {locale.MENU_TITLE}
        </Text>

        <Box
          style={{
            width: '10vh',
            height: '3vh',
            display: 'grid',
            placeItems: 'center',
            paddingLeft: '1vh',
          }}
        >
          {IconComponent && (
            <Box
              key={`icon-${id}`}
              className={classes.flyInIcon}
              style={{ position: 'absolute' }}
            >
              <IconComponent />
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      <Box style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
        {showContent && MenuComponent && (
          <Box
            key={`menu-${id}`}
            className={classes.flyInContent}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '90%',
              position: 'absolute',
              gap: '1vh',
              overflow: 'auto',
              paddingRight: '1vh',
            }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <MenuComponent />
            </Suspense>
          </Box>
        )}
      </Box>
    </Box>
  );
};
