'use client';

import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setApiTokenGetter } from '@/lib/api';
import { isAuth0Configured } from '@/lib/auth0-config';

function ClearApiTokenOnMount() {
  useEffect(() => {
    setApiTokenGetter(null);
  }, []);
  return null;
}

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || '';
const redirectUri =
  process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/dashboard';

function TokenBridge({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      setApiTokenGetter(null);
      return;
    }

    setApiTokenGetter(async () => {
      try {
        return await getAccessTokenSilently({
          authorizationParams: {
            audience: audience || undefined,
            scope: 'openid profile email',
          },
        });
      } catch {
        return null;
      }
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!isAuth0Configured()) {
    return (
      <>
        <ClearApiTokenOnMount />
        {children}
      </>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience || undefined,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
      useRefreshTokens
    >
      <TokenBridge>{children}</TokenBridge>
    </Auth0Provider>
  );
}
