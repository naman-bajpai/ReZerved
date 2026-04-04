'use client';

import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setApiTokenGetter } from '@/lib/api';

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
  if (!domain || !clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">
        <p>
          Missing <code className="text-foreground">NEXT_PUBLIC_AUTH0_DOMAIN</code> or{' '}
          <code className="text-foreground">NEXT_PUBLIC_AUTH0_CLIENT_ID</code>. Copy{' '}
          <code className="text-foreground">.env.local.example</code> to{' '}
          <code className="text-foreground">.env.local</code> and add Auth0 values.
        </p>
      </div>
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
