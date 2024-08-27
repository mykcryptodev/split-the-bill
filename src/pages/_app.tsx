import { type AppType } from "next/app";
import { SnackbarProvider } from 'notistack';
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react";

import Layout from "~/components/Layout";
import { env } from "~/env";
import OnchainProviders from "~/providers/OnchainProviders";
import { api } from "~/utils/api";

import '@coinbase/onchainkit/styles.css';
import "~/styles/globals.css";

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always',
    loaded: (posthog) => {
      if (env.NODE_ENV === 'development') posthog.debug() // debug mode in development
    },
  })
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <PostHogProvider client={posthog}>
      <OnchainProviders>
        <SnackbarProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <div id="portal" />
        </SnackbarProvider>
      </OnchainProviders>
    </PostHogProvider>
  );
};

export default api.withTRPC(MyApp);
