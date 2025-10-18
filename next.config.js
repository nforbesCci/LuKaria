/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    MS365_CLIENT_ID: process.env.MS365_CLIENT_ID,
    MS365_CLIENT_SECRET: process.env.MS365_CLIENT_SECRET,
    MS365_TENANT_ID: process.env.MS365_TENANT_ID,
    MS365_EMAIL_FROM: process.env.MS365_EMAIL_FROM,
    MS365_EMAIL_TO: process.env.MS365_EMAIL_TO,
    MS365_SHAREPOINT_SITE_ID: process.env.MS365_SHAREPOINT_SITE_ID,
  },
}

module.exports = nextConfig
