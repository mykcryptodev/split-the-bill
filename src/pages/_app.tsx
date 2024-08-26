import { type AppType } from "next/app";
import { SnackbarProvider } from 'notistack';

import Layout from "~/components/Layout";
import OnchainProviders from "~/providers/OnchainProviders";
import { api } from "~/utils/api";

import '@coinbase/onchainkit/styles.css';
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <OnchainProviders>
      <SnackbarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <div id="portal" />
      </SnackbarProvider>
    </OnchainProviders>
  );
};

export default api.withTRPC(MyApp);
