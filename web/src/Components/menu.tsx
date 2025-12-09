import { FC, useState, useEffect, lazy, Suspense, ComponentType, useRef } from 'react';
import { Box, Text, Divider } from '@mantine/core';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import { useCustomization } from '../Providers/CustomizationProvider';
import classes from './menu.module.css';

// Icon imports will be dynamic
const iconCache: Record<string, ComponentType> = {};

interface AppearanceMenuProps {
  animateIn?: boolean;
  isVisible?: boolean;
}

export const AppearanceMenu: FC<AppearanceMenuProps> = ({ animateIn, isVisible }) => {
  const { selectedTab, locale } = useAppearanceStore();
  const { theme } = useCustomization();
  const [showContent, setShowContent] = useState(false);
  const hasAnimatedRef = useRef(false);
  const [IconComponent, setIconComponent] = useState<ComponentType | null>(null);
  const [MenuComponent, setMenuComponent] = useState<ComponentType | null>(null);



  // Show content after delay: 1500ms on first load, 100ms thereafter
  useEffect(() => {
    if (selectedTab) {
      setShowContent(false);
      const isInitial = !hasAnimatedRef.current;
      const delay = isInitial ? 2000 : 100;
      if (isInitial) {
        hasAnimatedRef.current = true;
      }
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [selectedTab]);

    // Trigger initial animation when animateIn becomes true for the first time
  useEffect(() => {
    if (animateIn && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
    }
  }, [animateIn]);

  // Reset initial animation flag when UI hides
  useEffect(() => {
    if (!isVisible) {
      hasAnimatedRef.current = false;
    }
  }, [isVisible]);

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
        width: '35vh',
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

        <Text style={{ color: theme.primaryColor }}>
          {locale?.MENU_TITLE || 'Menu'}
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

      {showContent && (
        <Divider
          size="xl"
          color="dark"
          style={{ background: 'rgba(0,0,0,0.5)', height: '0px', width: '100%' }}
          className={classes.flyInContent}
        />
      )}
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
