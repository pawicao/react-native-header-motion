import { createContext, useContext, type RefObject } from 'react';
import type { CollapsibleTabsPagerController } from './pagerAdapters';
import type { CollapsiblePreset } from './types';

export const CollapsiblePresetsContext = createContext<
  readonly CollapsiblePreset[] | null
>(null);

export function useCollapsiblePresetsOrThrow(
  componentName: string
): readonly CollapsiblePreset[] {
  const presets = useContext(CollapsiblePresetsContext);
  if (!presets) {
    throw new Error(
      `${componentName} must be used within <Collapsible /> or <CollapsibleTabs />. ` +
        'If you are rendering inside a navigation header, use <Collapsible.NavigationHeader /> so the collapsible context crosses the tree boundary.'
    );
  }

  return presets;
}

/** A tab entry after normalization — `label` falls back to `name`. */
export interface CollapsibleTabDescriptor {
  name: string;
  label: string;
}

export interface CollapsibleTabsContextValue {
  tabs: readonly CollapsibleTabDescriptor[];
  activeTab: string;
  goTo: (name: string) => void;
  initialIndex: number;
  controllerRef: RefObject<CollapsibleTabsPagerController | null>;
  onPagerIndexChange: (index: number) => void;
}

export const CollapsibleTabsContext =
  createContext<CollapsibleTabsContextValue | null>(null);

export function useCollapsibleTabsContextOrThrow(
  componentName: string
): CollapsibleTabsContextValue {
  const ctxValue = useContext(CollapsibleTabsContext);
  if (!ctxValue) {
    throw new Error(
      `${componentName} must be used within <CollapsibleTabs />. ` +
        'If you are rendering inside a navigation header, use <Collapsible.NavigationHeader /> so the tabs context crosses the tree boundary.'
    );
  }

  return ctxValue;
}
