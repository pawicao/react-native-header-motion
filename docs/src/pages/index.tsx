import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroBg} aria-hidden="true">
        <MockupScreen variant="expanded" />
        <MockupScreen variant="collapsed" />
      </div>
      <div className={clsx('container', styles.heroContent)}>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/overview"
          >
            Get started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/pawicao/react-native-header-motion"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Progress-driven animations',
    description:
      'A single shared progress value from 0 to 1. Wire it into any Reanimated style you can imagine.',
    icon: '/img/icons/gauge-high.svg',
  },
  {
    title: 'Multi-scroll orchestration',
    description:
      'Keep one header in sync across tabs, pagers, or any combination of scrollables.',
    icon: '/img/icons/layer-group.svg',
  },
  {
    title: 'Navigation bridging',
    description:
      'Bridge header motion context into navigation-rendered headers with a simple render-prop pattern.',
    icon: '/img/icons/bridge.svg',
  },
  {
    title: 'Header panning',
    description:
      'Let users collapse the header by dragging on it directly, with momentum-based decay.',
    icon: '/img/icons/hand.svg',
  },
  {
    title: 'Custom scrollable factory',
    description:
      'Wrap FlashList, LegendList, or any scrollable with a single function call.',
    icon: '/img/icons/gears.svg',
  },
  {
    title: 'Bring your own motion',
    description:
      'You build the visuals, the library handles the motion plumbing.',
    icon: '/img/icons/palette.svg',
  },
];

function MockupScreen({ variant }: { variant: 'expanded' | 'collapsed' }) {
  const isExpanded = variant === 'expanded';
  return (
    <div
      className={clsx(
        styles.mockupWrapper,
        isExpanded ? styles.mockupWrapperLeft : styles.mockupWrapperRight
      )}
    >
      <div className={styles.mockupFrame}>
        <div className={styles.mockupStatusBar}>
          <div className={styles.mockupStatusLeft} />
          <div className={styles.mockupStatusRight}>
            <div className={styles.mockupStatusDot} />
            <div className={styles.mockupStatusDot} />
            <div className={styles.mockupStatusDot} />
          </div>
        </div>
        <div
          className={clsx(
            styles.mockupHeader,
            isExpanded
              ? styles.mockupHeaderExpanded
              : styles.mockupHeaderCollapsed
          )}
        >
          <div className={styles.mockupNavRow}>
            <div className={styles.mockupBackButton} />
            <div className={styles.mockupNavTitle} />
            <div className={styles.mockupNavAction} />
          </div>
          {isExpanded && (
            <div className={styles.mockupDynamicSection}>
              <div className={styles.mockupAvatar} />
              <div className={styles.mockupDynamicText}>
                <div
                  className={styles.mockupTextLine}
                  style={{ width: '60%' }}
                />
                <div
                  className={styles.mockupTextLine}
                  style={{ width: '40%', opacity: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.mockupContent}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={styles.mockupRow}>
              <div className={styles.mockupRowThumb} />
              <div className={styles.mockupRowLines}>
                <div
                  className={styles.mockupRowLine}
                  style={{ width: `${65 + (i % 3) * 12}%` }}
                />
                <div
                  className={styles.mockupRowLineSub}
                  style={{ width: `${40 + (i % 2) * 15}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureGrid}>
          {features.map((props) => (
            <FeatureCard key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  const iconUrl = useBaseUrl(icon);
  return (
    <div className="feature-card">
      <div className={styles.featureHeader}>
        <h3>{title}</h3>
        <span
          className={styles.featureIcon}
          style={{
            maskImage: `url(${iconUrl})`,
            WebkitMaskImage: `url(${iconUrl})`,
          }}
        />
      </div>
      <p>{description}</p>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
