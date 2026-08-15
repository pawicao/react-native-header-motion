import { useMemo } from 'react';
import {
  useCollapsibleTabsContextOrThrow,
  type CollapsibleTabDescriptor,
} from './context';

export interface UseCollapsibleTabsResult {
  /** The normalized tabs, in pager order. */
  tabs: readonly CollapsibleTabDescriptor[];
  /** Name of the currently active tab. */
  activeTab: string;
  /** Moves the pager to the given tab and makes it active. */
  goTo: (name: string) => void;
}

/**
 * Tab state and navigation for a `CollapsibleTabs` tree.
 *
 * Use it to build a custom tab bar (or any other tab-aware UI) in place of
 * `CollapsibleTabs.Bar`.
 *
 * @example
 * ```tsx
 * function MyTabBar() {
 *   const { tabs, activeTab, goTo } = useCollapsibleTabs();
 * }
 * ```
 */
export function useCollapsibleTabs(): UseCollapsibleTabsResult {
  const { tabs, activeTab, goTo } =
    useCollapsibleTabsContextOrThrow('useCollapsibleTabs');

  return useMemo(() => ({ tabs, activeTab, goTo }), [tabs, activeTab, goTo]);
}
