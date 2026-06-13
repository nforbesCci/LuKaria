# HTTPS Setup for Local Development

This application now supports HTTPS for local development using self-signed SSL certificates.

## SSL Certificates

SSL certificates have been generated using `mkcert` and are stored in the `certificates/` directory:
- `localhost.pem` - SSL certificate
- `localhost-key.pem` - Private key
- `ca.crt` - Certificate Authority certificate
- `ca.key` - Certificate Authority private key

## Running the Application with HTTPS

### Development Mode
```bash
yarn dev:https
```
The application will be available at: `https://localhost:3000`

### Production Mode
```bash
yarn build
yarn start:https
```

## Browser Security Warning

When you first access the application via HTTPS, your browser will show a security warning because the certificate is self-signed. This is normal for local development.

### To Trust the Certificate:

1. **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
2. **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
3. **Safari**: Click "Show Details" → "visit this website"

### To Install the Certificate Authority (Optional):

For a better development experience, you can install the CA certificate to avoid browser warnings:

1. Open `certificates/ca.crt`
2. Install it as a trusted certificate authority in your system
3. Restart your browser

## Commands Available

- `yarn dev` - Run development server on HTTP (port 3001)
- `yarn dev:https` - Run development server on HTTPS (port 3000)
- `yarn start:https` - Run production server on HTTPS (port 3000)

## Security Notes

- The `certificates/` directory is excluded from git for security
- These certificates are only for local development
- Never use these certificates in production
- For production, use proper SSL certificates from a trusted CA

## Troubleshooting

If you encounter issues:

1. **Certificate errors**: Regenerate certificates with `npx mkcert create-cert --ca-key certificates/ca.key --ca-cert certificates/ca.crt --key certificates/localhost-key.pem --cert certificates/localhost.pem --domains localhost 127.0.0.1 ::1`
2. **Port conflicts**: The HTTPS server runs on port 3000 by default
3. **Browser cache**: Clear browser cache if you see mixed content warnings

## Environment Variables

Make sure your environment variables are configured for HTTPS:

```env
AUTH0_BASE_URL=https://localhost:3000
```

