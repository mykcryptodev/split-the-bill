import { type AppType } from "next/app";
import "~/styles/globals.css";

import Layout from "~/components/Layout";
import OnchainProviders from "~/providers/OnchainKit";
import { api } from "~/utils/api";

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
