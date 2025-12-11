import { DebugSection } from '../../types/debug';
import { DebugEventSend } from '../eventsHandlers';
import { Receive } from '../../enums/events';
import { toggleVisible } from './visibility';
import {
  debugAppearance,
  debugBlacklist,
  debugModels,
  debugOutfits,
  debugTattoos,
} from './debug_content';
import debugLocale from './debug_locale';

const appearanceTabs = [
  'heritage',
  'face',
  'hair',
  'clothes',
  'accessories',
  'makeup',
  'tattoos',
  'outfits',
];

const SendDebuggers: DebugSection[] = [
  {
    label: 'Appearance Menu',
    actions: [
      {
        type: 'button',
        label: 'Open Appearance Menu',
        action: () => {
          DebugEventSend('setLocale', debugLocale);
          DebugEventSend(Receive.data, {
            tabs: appearanceTabs,
            appearance: debugAppearance,
            allowExit: true,
            blacklist: debugBlacklist,
            tattoos: debugTattoos,
            outfits: debugOutfits,
            models: debugModels,
          });
          toggleVisible(true);
        },
      },
      {
        type: 'button',
        label: 'Close Appearance Menu',
        action: () => toggleVisible(false),
      },
    ],
  },
  {
    label: 'Admin Menu',
    actions: [
      {
        type: 'button',
        label: 'Open Admin Menu',
        action: () => {
          DebugEventSend('setLocale', debugLocale);
          DebugEventSend('setThemeConfig', {
            primaryColor: '#10b981',
            inactiveColor: '#4b5563',
            shape: 'hexagon',
          });
          DebugEventSend('setAppearanceSettings', {
            useTarget: true,
            enablePedsForShops: false,
            blips: {},
          });
          DebugEventSend('setModels', debugModels || []);
          DebugEventSend('setLockedModels', []);
          DebugEventSend('setTattoos', debugTattoos || []);
          DebugEventSend('setRestrictions', []);
          DebugEventSend('setOutfits', []);
          DebugEventSend('setZones', []);
          DebugEventSend('setVisibleAdminMenu', true);
        },
      },
      {
        type: 'button',
        label: 'Close Admin Menu',
        action: () => DebugEventSend('setVisibleAdminMenu', false),
      },
    ],
  },
];

export default SendDebuggers;
