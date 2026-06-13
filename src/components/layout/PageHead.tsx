import Head from 'expo-router/head';

type PageHeadProps = {
  title: string;
};

export function PageHead({ title }: PageHeadProps) {
  return (
    <Head>
      <title>{title} | Caliper</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="alternate icon" href="/assets/images/favicon.png" type="image/png" />
    </Head>
  );
}
