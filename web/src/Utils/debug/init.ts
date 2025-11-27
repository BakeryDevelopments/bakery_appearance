import { DebugAction } from '../../types/debug';
import { toggleVisible } from './visibility';
import { DebugEventSend } from '../eventsHandlers';
import { Receive } from '../../enums/events';
import {
    debugAppearance,
    debugBlacklist,
    debugModels,
    debugOutfits,
    debugTattoos,
} from './debug_content';
import type { TMenuData } from '../../types/appearance';
import debugLocale from './debug_locale';

/**
 * The initial debug actions to run on startup
 */
const InitDebug: DebugAction[] = [
    {
        label: 'Visible',
        action: () => toggleVisible(true),
        delay: 500,
    },
    {
        label: 'Data',
        action: () => {
            let tabs = [
                'heritage',
                'face',
                'hair',
                'clothes',
                'accessories',
                'makeup',
                'tattoos',
                'outfits',
            ];

            DebugEventSend<TMenuData>(Receive.data, {
                tabs: tabs,
                appearance: debugAppearance,
                allowExit: true,
                blacklist: debugBlacklist,
                tattoos: debugTattoos,
                outfits: debugOutfits,
                models: debugModels,
                locale: JSON.stringify(debugLocale),
            });
        },
        delay: 600,
    },
];

export default InitDebug;

export function InitialiseDebugSenders(): void {
    for (const debug of InitDebug) {
        setTimeout(() => {
            debug.action();
        }, debug.delay || 0);
    }
}

// Initialize debug receivers (event listeners, etc.)
export const InitialiseDebugReceivers = () => {
  // TODO: Implement debug receiver initialization
};
