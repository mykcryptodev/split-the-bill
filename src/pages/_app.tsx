import { type AppType } from "next/app";

import Layout from "~/components/Layout";
import OnchainProviders from "~/providers/OnchainProviders";
import { api } from "~/utils/api";
import { SnackbarProvider } from 'notistack';

import '@coinbase/onchainkit/styles.css';
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <OnchainProviders>
      <SnackbarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SnackbarProvider>
    </OnchainProviders>
  );
};

export default api.withTRPC(MyApp);
