import { useEffect } from 'react';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import type { TMenuData } from '../types/appearance';

/**
 * Hook to listen for debug data events and populate the appearance store
 */
export const useDebugDataReceiver = () => {
  const {
    setTabs,
    setAppearance,
    setAllowExit,
    setBlacklist,
    setTattoos,
    setOutfits,
    setModels,
    setLockedModels,
    setLocale,
    setSelectedTab,
  } = useAppearanceStore();

  HandleNuiMessage<TMenuData>('data', (data) => {

    // Set all the data
      setModels(data.models);
      
      // Calculate modelIndex based on the model name
      let modelIndex = 0;
      if (data.appearance && data.models) {
        const foundIndex = data.models.indexOf(data.appearance.model);
        if (foundIndex !== -1) {
          modelIndex = foundIndex;
        }
      }
      
      // Ensure modelIndex is set in appearance
      setAppearance(
        data.appearance
          ? {
              ...data.appearance,
              modelIndex:
                typeof data.appearance.modelIndex === 'number'
                  ? data.appearance.modelIndex
                  : modelIndex,
            }
          : data.appearance
      );
      setAllowExit(data.allowExit);
      setBlacklist(data.blacklist);
      setTattoos(data.tattoos);
      setOutfits(data.outfits);

    // Create tabs from the tab names (locale will be loaded from cache via setLocale handler)
    const tabs = (Array.isArray(data.tabs) ? data.tabs : [data.tabs]).map((tabId) => ({
      id: tabId,
      label: tabId,
      icon: `Icon${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`,
      src: tabId,
    }));

    setTabs(tabs);
    
    // Set first tab as selected
    if (tabs.length > 0) {
      setSelectedTab(tabs[0]);
    }
  });

  // Handle locked models updates
  HandleNuiMessage<string[]>('setLockedModels', (data) => {
    setLockedModels(data || []);
  });
};
