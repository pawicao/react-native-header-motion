import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'React Native Header Motion',
  tagline: 'Scroll-driven animated headers for React Native',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://pawicao.github.io',
  baseUrl: '/react-native-header-motion/',

  organizationName: 'pawicao',
  projectName: 'react-native-header-motion',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/pawicao/react-native-header-motion/tree/main/docs/',
          lastVersion: 'current',
          versions: {
            current: {
              label: '1.x',
              badge: true,
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Header Motion',
      logo: {
        alt: 'React Native Header Motion',
        src: 'img/headermotion-logo-light.svg',
        srcDark: 'img/headermotion-logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'html',
          position: 'right',
          value: `<a href="https://github.com/pawicao/react-native-header-motion" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" style="display:flex;align-items:center;padding:0 8px;color:inherit;opacity:0.8;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>`,
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/docs/overview',
            },
            {
              label: 'Installation',
              to: '/docs/installation',
            },
            {
              label: 'Quick Start',
              to: '/docs/quick-start',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/pawicao/react-native-header-motion/issues',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/react-native-header-motion',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pawicao/react-native-header-motion',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Oskar Pawica.<br/><span class="footer__built-with">Docs built with Docusaurus.</span>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
