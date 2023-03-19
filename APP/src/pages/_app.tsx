import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider as ProviderSession } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";
import ProviderAppState from "../components/ProviderAppState";
import ProviderSerial from "../components/ProviderSerial";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ProviderSession session={session}>
        <ProviderAppState>
            <ProviderSerial>
                <Component {...pageProps} />
            </ProviderSerial>
        </ProviderAppState> 
    </ProviderSession>
  );
};

export default api.withTRPC(MyApp);
