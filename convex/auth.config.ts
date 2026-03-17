import { type AuthConfig } from 'convex/server'

const authConfig: AuthConfig = {
  providers: [
    {
      // Clerk Frontend API URL — found in Clerk Dashboard → JWT Templates → Convex → Issuer
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex',
    },
  ],
}

export default authConfig
