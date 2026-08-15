import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'overview',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'installation',
      label: 'Installation',
    },
    {
      type: 'doc',
      id: 'quick-start',
      label: 'Quick Start',
    },
    {
      type: 'category',
      label: 'High-level API',
      collapsed: false,
      items: [
        'high-level/collapsible',
        'high-level/presets',
        'high-level/collapsible-tabs',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/dynamic-header-measurement',
        'guides/fixed-progress-threshold',
        'guides/animating-with-progress',
        'guides/default-scrollables',
        'guides/navigation-bridging',
        'guides/composing-with-native-headers',
        'guides/multiple-tabs-pages',
        'guides/header-panning',
        'guides/custom-scrollables',
        'guides/using-scroll-manager',
        'guides/offset-strategies',
        'guides/pull-to-refresh',
        'guides/overscroll',
        'guides/external-refs',
        'guides/consumer-scroll-handlers',
        'guides/short-scrollable-content',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Components',
          items: [
            'api/header-motion',
            'api/header-motion-header',
            'api/header-motion-header-dynamic',
            'api/header-motion-scrollview',
            'api/header-motion-flatlist',
            'api/header-motion-bridge',
            'api/header-motion-navigation-bridge',
            'api/header-motion-scroll-manager',
            'api/create-header-motion-scrollable',
          ],
        },
        {
          type: 'category',
          label: 'Hooks',
          items: [
            'api/use-motion-progress',
            'api/use-active-scroll-id',
            'api/use-header-motion-bridge',
            'api/use-scroll-manager',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Other',
      items: ['other/migration-from-v0', 'other/example-app', 'other/faq'],
    },
  ],
};

export default sidebars;
