import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import OnchainProviders from "~/providers/OnchainKit";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <OnchainProviders>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </OnchainProviders>
  );
};

export default api.withTRPC(MyApp);
