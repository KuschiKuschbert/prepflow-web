# NextAuth `error=auth0` Investigation

**Date:** December 12, 2025
**Status:** Investigating Root Cause

## Question

Why does NextAuth add `error=auth0` to the URL before redirecting to Auth0?

## Investigation Approach

1. **Check NextAuth Source Code** - Understand when errors are triggered
2. **Check Route Handler** - See how `/api/auth/signin/auth0` is processed
3. **Check Provider Configuration** - Verify callback URL is set correctly
4. **Check Validation Logic** - Understand callback URL validation

## Findings from NextAuth Source Code

### 1. Sign-In Route Handler (`node_modules/next-auth/src/core/routes/signin.ts`)

**Key Code:**

```typescript
if (provider.type === 'oauth') {
  try {
    const response = await getAuthorizationUrl({ options, query });
    return response;
  } catch (error) {
    logger.error('SIGNIN_OAUTH_ERROR', {
      error: error as Error,
      providerId: provider.id,
    });
    return { redirect: `${url}/error?error=OAuthSignin` };
  }
}
```

**Observation:** When `getAuthorizationUrl` fails, NextAuth returns `error=OAuthSignin`, NOT `error=auth0`.

### 2. Authorization URL Generation (`node_modules/next-auth/src/core/lib/oauth/authorization-url.ts`)

**Key Code:**

```typescript
const client = await openidClient(options);
const authorizationParams: AuthorizationParameters = params;
const url = client.authorizationUrl(authorizationParams);
return { redirect: url, cookies };
```

**Observation:** This function constructs the authorization URL. If it fails, it would throw an error caught by the signin route handler.

### 3. OpenID Client Creation (`node_modules/next-auth/src/core/lib/oauth/client.ts`)

**Key Code:**

```typescript
const client = new issuer.Client(
  {
    client_id: provider.clientId as string,
    client_secret: provider.clientSecret as string,
    redirect_uris: [provider.callbackUrl], // <-- Uses provider.callbackUrl
    ...provider.client,
  },
  provider.jwks,
);
```

**Observation:** The OpenID client uses `provider.callbackUrl` from the provider configuration. This is where our forced callback URL should be used.

### 4. Callback URL Validation (`node_modules/next-auth/src/core/lib/assert.ts`)

**Key Code:**

```typescript
const callbackUrlParam = req.query?.callbackUrl as string | undefined;
const url = parseUrl(req.origin);

if (callbackUrlParam && !isValidHttpUrl(callbackUrlParam, url.base)) {
  return new InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlParam}`);
}
```

**Observation:** NextAuth validates callback URLs against `req.origin` (request origin), not `NEXTAUTH_URL`.

## Hypothesis

The `error=auth0` is likely being set **before** NextAuth processes the sign-in request. Possible sources:

1. **Provider Not Found:** If NextAuth can't find the provider, it might return `error={providerId}`
2. **Provider Configuration Error:** If provider configuration is invalid, NextAuth might return provider-specific error
3. **Early Validation:** NextAuth might validate the provider before calling `getAuthorizationUrl`

## Next Steps

1. Check NextAuth index.ts to see how provider errors are handled
2. Check if provider lookup fails and returns `error={providerId}`
3. Add logging to see exactly when `error=auth0` is set
4. Check Vercel function logs for NextAuth error messages

## Test Results

### Direct Sign-In Endpoint Call

```bash
curl "https://www.prepflow.org/api/auth/signin/auth0?callbackUrl=/webapp" -I
```

**Result:**

- HTTP 302 redirect
- Location: `/api/auth/signin?callbackUrl=...&error=auth0`
- **Error is set BEFORE redirecting to Auth0**

### Browser Test

- Clicking "Sign in with Auth0" button **DOES work** and redirects to Auth0
- Error appears in URL when accessing `/webapp` directly
- Error is cosmetic - doesn't prevent login

## Conclusion

The `error=auth0` is being set by NextAuth **before** it attempts to generate the authorization URL. This suggests:

1. NextAuth is validating the provider configuration
2. Something in the validation is failing
3. But the actual authorization flow still works when button is clicked

**Likely Cause:** NextAuth is checking if the provider is properly configured before redirecting, and this check is failing, but the actual OAuth flow works fine.
