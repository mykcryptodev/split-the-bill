import { type AppType } from "next/app";

import Layout from "~/components/Layout";
import OnchainProviders from "~/providers/OnchainProviders";
import { api } from "~/utils/api";

import "~/styles/globals.css";

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
