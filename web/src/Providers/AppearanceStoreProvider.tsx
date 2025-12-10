import { createContext, useContext, ReactNode, FC, useState, useRef, useEffect } from 'react';
import { Send } from '../enums/events';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';

import type {
  TAppearance,
  TBlacklist,
  TDrawables,
  THairColour,
  THeadBlend,
  THeadOverlay,
  THeadStructure,
  TModel,
  TOutfit,
  TOutfitData,
  TProps,
  TTab,
  TToggles,
  TValue,
  TZoneTattoo,
  Blacklist,
  TTattoo,
  TJOBDATA,
} from '../types/appearance';

interface AppearanceStoreContextType {
  // State
  tabs: TTab[];
  locale: { [key: string]: string };
  selectedTab: TTab | undefined;
  isValid: Blacklist;
  allowExit: boolean;
  blacklist: TBlacklist | undefined;
  jobData: TJOBDATA;
  originalAppearance: TAppearance | undefined;
  models: TModel[] | undefined;
  lockedModels: string[];
  outfits: TOutfit[] | undefined;
  tattoos: TZoneTattoo[] | undefined;
  appearance: TAppearance | undefined;
  toggles: TToggles;

  // Setters
  setTabs: (tabs: TTab[]) => void;
  setLocale: (locale: { [key: string]: string }) => void;
  setSelectedTab: (tab: TTab | undefined) => void;
  setIsValid: (isValid: Blacklist) => void;
  setAllowExit: (allowExit: boolean) => void;
  setBlacklist: (blacklist: TBlacklist | undefined) => void;
  setJobData: (jobData: TJOBDATA) => void;
  setOriginalAppearance: (appearance: TAppearance | undefined) => void;
  setModels: (models: TModel[] | undefined) => void;
  setLockedModels: (lockedModels: string[]) => void;
  setAppearance: (appearance: TAppearance | undefined) => void;

  // Outfits methods
  setOutfits: (outfits: TOutfit[] | undefined) => void;
  saveOutfit: (label: string, job?: { name: string; rank: number } | null) => void;
  editOutfit: (outfit: TOutfit) => void;
  deleteOutfit: (id: number | string) => void;
  useOutfit: (outfit: TOutfitData) => void;
  importOutfit: (shareCode: string) => void;
  shareOutfit: (id: number | string) => void;
  itemOutfit: (outfit: TOutfitData, label: string) => void;

  // Tattoos methods
  setTattoos: (tattoos: TZoneTattoo[] | undefined) => void;
  setPlayerTattoos: (tattoos: TTattoo[]) => void;

  // Appearance methods
  cancelAppearance: () => void;
  saveAppearance: () => void;
  setModel: (model: TModel) => void;
  setHeadBlend: (headBlend: THeadBlend) => void;
  setHeadStructure: (headStructure: THeadStructure[keyof THeadStructure]) => void;
  setHeadOverlay: (overlay: THeadOverlay[keyof THeadOverlay]) => void;
  setEyeColour: (eyeColour: TValue) => void;
  setHairColour: (hairColour: THairColour) => void;
  setProp: (prop: TProps[keyof TProps], value: number, isTexture?: boolean) => void;
  setDrawable: (drawable: TDrawables[keyof TDrawables], value: number, isTexture?: boolean) => void;

  // Toggles methods
  toggleItem: (
    item: string,
    toggle: boolean,
    data: TDrawables[keyof TDrawables] | TProps[keyof TProps],
    hook: any,
    hookData: any
  ) => void;
}

const AppearanceStoreContext = createContext<AppearanceStoreContextType | null>(null);

export const AppearanceStoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Basic state
  const [tabs, setTabs] = useState<TTab[]>([]);
  const [locale, setLocale] = useState<{ [key: string]: string }>({});
  const [selectedTab, setSelectedTab] = useState<TTab | undefined>(undefined);
  const [isValid, setIsValid] = useState<Blacklist>({ models: true, drawables: true });
  const [allowExit, setAllowExit] = useState<boolean>(true);
  const [blacklist, setBlacklist] = useState<TBlacklist | undefined>(undefined);
  const [lockedModels, setLockedModels] = useState<string[]>([]);
  const [jobData, setJobData] = useState<TJOBDATA>({ name: '', isBoss: false });
  const [originalAppearance, setOriginalAppearance] = useState<TAppearance | undefined>(undefined);
  const [models, setModels] = useState<TModel[] | undefined>(undefined);

  // Complex state
  const [outfits, setOutfits] = useState<TOutfit[] | undefined>(undefined);
  const [tattoos, setTattoos] = useState<TZoneTattoo[] | undefined>(undefined);
  const [appearance, setAppearance] = useState<TAppearance | undefined>(undefined);
  const [toggles, setToggles] = useState<TToggles>({
    hats: false,
    masks: false,
    glasses: false,
    shirts: false,
    jackets: false,
    vest: false,
    legs: false,
    shoes: false,
  });

  // Refs for preventing concurrent operations
  const isPropFetching = useRef(false);
  const isDrawableFetching = useRef(false);
  const isToggling = useRef(false);

  // Listen for locale updates from NUI
  HandleNuiMessage<{ [key: string]: string }>('setLocale', (data) => {
    setLocale(data);
  });

  HandleNuiMessage<TModel[]>('setModels', (data) => {
    setModels(data);
  });

  HandleNuiMessage<string[]>('setLockedModels', (data) => {
    setLockedModels(data || []);
  });

  HandleNuiMessage<TZoneTattoo[]>('setTattoos', (data) => {
    setTattoos(data);
  });

  // Outfits methods
  const saveOutfit = (label: string, job?: { name: string; rank: number } | null) => {
    if (!appearance) return;

    const outfit: TOutfitData = {
      drawables: appearance.drawables,
      props: appearance.props,
      headOverlay: appearance.headOverlay,
    };

    const data = { label, outfit, job };
    TriggerNuiCallback<any>(Send.saveOutfit, data, data).then((response) => {
      if (!response || !response.success) return;
      
      // Update outfits list with the response from server
      if (response.outfits) {
        setOutfits(response.outfits);
      }
    });
  };

  const editOutfit = (outfit: TOutfit) => {
    const { label, id } = outfit;
    const data = { label, id };
    TriggerNuiCallback<any>(Send.renameOutfit, data, data).then((updatedData) => {
      if (!updatedData) return;
      setOutfits(updatedData.outfits ?? outfits);
      setAppearance(updatedData.appearance ?? appearance);
    });
  };

  const deleteOutfit = (id: number | string) => {
    const data = { id };
    TriggerNuiCallback<any>(Send.deleteOutfit, data, data).then((updatedData) => {
      if (!updatedData) return;
      setOutfits(updatedData.outfits ?? outfits);
      setAppearance(updatedData.appearance ?? appearance);
    });
  };

  const useOutfit = (outfit: TOutfitData) => {
    TriggerNuiCallback<any>(Send.useOutfit, outfit, outfit).then((updatedData) => {
      if (!updatedData) return;
      setAppearance(updatedData.appearance ?? appearance);
      setOutfits(updatedData.outfits ?? outfits);
    });
  };

  const importOutfit = (shareCode: string) => {
    if (!shareCode || shareCode.length === 0) {
      console.error('Share code is required for outfit import');
      return;
    }

    const outfitName = `Imported Outfit ${(outfits?.length ?? 0) + 1}`;
    const data = { shareCode, outfitName };

    TriggerNuiCallback<any>('importOutfitByCode', data, data).then((updatedData) => {
      if (!updatedData) return;
      setOutfits(updatedData.outfits ?? outfits);
      setAppearance(updatedData.appearance ?? appearance);
    });
  };

  const shareOutfit = (id: number | string) => {
    // Get the share code from the server
    TriggerNuiCallback<any>('getOutfitShareCode', { id }, { id }).then((response) => {
      if (response && response.shareCode) {
        const shareCode = response.shareCode;
        
        // Use fallback method directly (more reliable in FiveM iframe)
        fallbackCopyToClipboard(shareCode);
      } else {
        alert('Failed to get share code for this outfit.');
      }
    });
  };

  const fallbackCopyToClipboard = (text: string) => {
    const clipElem = document.createElement('textarea');
    clipElem.value = text;
    clipElem.style.position = 'fixed';
    clipElem.style.opacity = '0';
    document.body.appendChild(clipElem);
    clipElem.select();
    try {
      document.execCommand('copy');
      alert(`✓ Share code copied to clipboard!\n\nCode: ${text}\n\nOthers can use this code to import your outfit.`);
    } catch (err) {
      alert(`Failed to copy. Your share code is: ${text}`);
    }
    document.body.removeChild(clipElem);
  };

  const itemOutfit = (outfit: TOutfitData, label: string) => {
    TriggerNuiCallback(Send.itemOutfit, { outfit, label });
  };

  // Tattoos methods
  const setPlayerTattoos = (playerTattoos: TTattoo[]) => {
    TriggerNuiCallback<boolean>(Send.setTattoos, playerTattoos).then((success) => {
      if (!success || !appearance) return;
      setAppearance({ ...appearance, tattoos: playerTattoos });
    });
  };

  // Appearance methods
  const cancelAppearance = () => {
    if (originalAppearance) {
      TriggerNuiCallback(Send.cancel, originalAppearance);
    }
  };

  const saveAppearance = () => {
    if (appearance) {
      TriggerNuiCallback(Send.save, appearance);
    }
  };

  const setModel = (model: TModel) => {
    TriggerNuiCallback<TAppearance>(Send.setModel, model).then((data) => {
      if (!data) return;

      // Update appearance with all new model data
      setAppearance(prev => {
        const index = models?.indexOf(model) ?? 0;
        return {
          ...data,
          modelIndex: typeof data.modelIndex === 'number' ? data.modelIndex : index,
        };
      });
    });

    if (tattoos) {
      TriggerNuiCallback<TZoneTattoo[]>(Send.getModelTattoos, []).then((newTattoos) => {
        setTattoos(newTattoos);
      });
    }
  };

  const setHeadBlend = (headBlend: THeadBlend) => {
    TriggerNuiCallback(Send.setHeadBlend, headBlend, 1).then(() => {
      setAppearance((prev) => prev ? { ...prev, headBlend } : prev);
    });
  };

  const setHeadStructure = (headStructure: THeadStructure[keyof THeadStructure]) => {
    TriggerNuiCallback(Send.setHeadStructure, headStructure, 1).then(() => {
      setAppearance((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.headStructure[headStructure.id!] = headStructure;
        return updated;
      });
    });
  };

  const setHeadOverlay = (overlay: THeadOverlay[keyof THeadOverlay]) => {
    if (!overlay || !overlay.id) {
      console.warn('[setHeadOverlay] Ignored update: missing overlay.id', overlay);
      return;
    }
    TriggerNuiCallback(Send.setHeadOverlay, overlay, 1).then(() => {
      setAppearance(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          headOverlay: {
            ...prev.headOverlay,
            [overlay.id]: overlay,
          },
        };
        return updated;
      });
    });
  };

  const setEyeColour = (eyeColour: TValue) => {
    TriggerNuiCallback(Send.setHeadOverlay, eyeColour);
  };

  const setHairColour = (hairColour: THairColour) => {
    TriggerNuiCallback(Send.setHeadOverlay, {
      hairColour: typeof hairColour?.Colour === 'number' && !isNaN(hairColour.Colour) ? hairColour.Colour : 0,
      hairHighlight: typeof hairColour?.highlight === 'number' && !isNaN(hairColour.highlight) ? hairColour.highlight : 0,
      id: 'hairColour',
    }, 1);
  };

  const setProp = (prop: TProps[keyof TProps], value: number, isTexture?: boolean) => {
    if (isPropFetching.current || !appearance) return;
    isPropFetching.current = true;

    if (isTexture) prop.texture = value;
    else prop.value = value;

    TriggerNuiCallback<number>(Send.setProp, {
      value: prop?.value ?? 0,
      index: prop?.index ?? 0,
      texture: prop?.texture ?? 0,
      isTexture: isTexture ?? false,
    }, 1).then((propTotal) => {
      setAppearance((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (!isTexture) {
          updated.propTotal[prop.id!].textures = propTotal;
          prop.texture = 0;
        }
        updated.props[prop.id!] = prop;
        return updated;
      });
      isPropFetching.current = false;
    });
  };

  const setDrawable = (drawable: TDrawables[keyof TDrawables], value: number, isTexture?: boolean) => {
    if (isDrawableFetching.current || !appearance) return;
    isDrawableFetching.current = true;

    // Create a copy to avoid mutating the input
    const updatedDrawable = { ...drawable };

    if (isTexture) updatedDrawable.texture = value;
    else updatedDrawable.value = value;

    TriggerNuiCallback<number>(Send.setDrawable, {
      value: updatedDrawable?.value ?? 0,
      index: updatedDrawable?.index ?? 0,
      texture: updatedDrawable?.texture ?? 0,
      isTexture: isTexture ?? false,
    }, 7).then((drawableTotal) => {
      setAppearance((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (!isTexture) {
          updated.drawTotal[updatedDrawable.id!].textures = drawableTotal;
          updatedDrawable.texture = 0;
        }
        updated.drawables[updatedDrawable.id!] = updatedDrawable;
        return updated;
      });
      isDrawableFetching.current = false;
    });
  };

  // Toggles methods
  const toggleItem = (
    item: string,
    toggle: boolean,
    data: TDrawables[keyof TDrawables] | TProps[keyof TProps],
    hook: any,
    hookData: any
  ) => {
    if (isToggling.current || !item) return;
    isToggling.current = true;

    TriggerNuiCallback<boolean>(Send.toggleItem, {
      item: item ?? '',
      toggle: !!toggle,
      data: data ?? {},
      hook: hook ?? null,
      hookData: hookData ?? null,
    }).then((state) => {
      setToggles((prev) => ({ ...prev, [item]: state }));
      isToggling.current = false;
    });
  };

  const value: AppearanceStoreContextType = {
    tabs,
    locale,
    selectedTab,
    isValid,
    allowExit,
    blacklist,
    jobData,
    originalAppearance,
    models,
    lockedModels,
    outfits,
    tattoos,
    appearance,
    toggles,
    setTabs,
    setLocale,
    setSelectedTab,
    setIsValid,
    setAllowExit,
    setBlacklist,
    setJobData,
    setOriginalAppearance,
    setModels,
    setLockedModels,
    setOutfits,
    saveOutfit,
    editOutfit,
    deleteOutfit,
    useOutfit,
    importOutfit,
    shareOutfit,
    itemOutfit,
    setTattoos,
    setPlayerTattoos,
    setAppearance,
    cancelAppearance,
    saveAppearance,
    setModel,
    setHeadBlend,
    setHeadStructure,
    setHeadOverlay,
    setEyeColour,
    setHairColour,
    setProp,
    setDrawable,
    toggleItem,
  };

  return (
    <AppearanceStoreContext.Provider value={value}>
      {children}
    </AppearanceStoreContext.Provider>
  );
};

export const useAppearanceStore = () => {
  const context = useContext(AppearanceStoreContext);
  if (!context) {
    throw new Error('useAppearanceStore must be used within AppearanceStoreProvider');
  }
  return context;
};
