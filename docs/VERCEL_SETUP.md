# Vercel + Datadog RUM Setup

This guide contains the necessary configurations for deploying on Vercel with Datadog RUM monitoring.

## Prerequisites

- [Vercel](https://vercel.com) account
- [Datadog](https://www.datadoghq.com) account
- Project configured with Next.js

## Datadog Configuration

### 1. Create Application in Datadog

1. Access the Datadog Dashboard
2. Navigate to **UX Monitoring** > **RUM Applications**
3. Click **New Application**
4. Configure:
   - **Application name**: Your project name
   - **Application type**: `Browser`
5. Note the **Application ID** and **Client Token**

### 2. Configure Allowed Origins

In the Datadog dashboard, configure allowed domains:

```
# Production
https://yourdomain.com

# Vercel Preview Deployments
https://*.vercel.app

# Local development
http://localhost:3000
```

## Vercel Configuration

### 1. Environment Variables

In the Vercel dashboard, go to **Settings** > **Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN` | `pub_xxxxxxxxxxxxxxxx` | Production, Preview |
| `NEXT_PUBLIC_DATADOG_APPLICATION_ID` | `xxxxxxxx-xxxx-xxxx-xxxx` | Production, Preview |
| `NEXT_PUBLIC_DATADOG_ENV` | `production` | Production |
| `NEXT_PUBLIC_DATADOG_ENV` | `preview` | Preview |
| `NEXT_PUBLIC_DATADOG_SITE` | `datadoghq.com` | All |
| `NEXT_PUBLIC_DATADOG_SERVICE` | `your-service-name` | All |
| `NEXT_PUBLIC_DATADOG_VERSION` | `1.0.0` | All |

### 2. Deploy Settings

Make sure the project is configured with:
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x or higher
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

## Configuration Verification

### 1. Test Deploy

Deploy and verify:

```bash
# Clone and configure the project
git clone <your-repo>
cd your-project

# Install dependencies
pnpm install

# Configure environment variables locally (optional)
cp .env.example .env.local

# Deploy
vercel --prod
```

### 2. Browser Validation

After deployment, open DevTools and verify:

```javascript
// In the browser console, should appear:
// "Datadog RUM initialized successfully"

// Check if Datadog is active:
console.log(window.DD_RUM)
```

### 3. Datadog Monitoring

Access the Datadog Dashboard and verify:
- **RUM** > **Applications** > Your app
- Data starts appearing in ~5 minutes
- Check Core Web Vitals metrics
- Confirm that Session Replay is working

## Troubleshooting

### Problem: Datadog doesn't initialize

**Possible causes:**
- Environment variables not configured
- Domain not in Allowed Origins
- Environment is not production/preview

**Solution:**
```bash
# Check env vars in Vercel
vercel env ls

# Check deployment logs
vercel logs <deployment-url>
```

### Problem: Bundle too large

**Solution:** The project already uses `datadog-rum-slim` automatically in production via webpack alias.

### Problem: CORS errors

**Solution:** Add all domains in Datadog:
- `https://*.vercel.app` for previews
- Your custom domain for production

## Collected Metrics

The setup automatically collects:

### Core Web Vitals
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

### User Experience
- Page views and navigation
- JavaScript errors
- User interactions (clicks, forms)
- Session recordings (100% sample rate)

### Performance
- Resource loading times
- API calls duration
- Bundle size impact

## Security & Privacy

### Privacy Settings
```typescript
// Already configured in DatadogProvider
defaultPrivacyLevel: 'mask-user-input' // Masks sensitive inputs
sessionReplaySampleRate: 100          // 100% of sessions recorded
```

### Collected Data
- Performance metrics
- Error tracking
- User interactions
- **DOES NOT** collect form data (masked)
- **DOES NOT** collect personal information

## Production Optimizations

### Bundle Size
- Uses `datadog-rum-slim` (90% smaller)
- Asynchronous loading
- Conditional initialization

### Performance
- Configurable sample rate
- Lazy loading of SDK
- Minimal impact on Core Web Vitals

### Monitoring
- Automatic alerts for errors
- Custom dashboard
- Weekly performance reports

## Useful Links

- [Datadog RUM Documentation](https://docs.datadoghq.com/real_user_monitoring/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
