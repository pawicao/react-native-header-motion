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
      <div className="container">
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
