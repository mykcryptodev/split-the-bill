import { Head, Html, Main, NextScript } from 'next/document';
import { type DocumentProps } from 'next/document';

const Document: React.FC<DocumentProps> = () => {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <meta name="theme-color" content="#42b17f" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
