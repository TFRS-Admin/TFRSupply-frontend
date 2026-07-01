# Railway Deployment

## Purpose

This deployment setup builds the Vite React application into static assets and serves `dist` with Caddy. Caddy provides reliable static hosting and an SPA fallback so client-side routes resolve to `index.html` instead of returning 404s on refresh or direct navigation.

## Files

- `Dockerfile` builds the Vite app with Node and copies `dist` into a Caddy runtime image.
- `Caddyfile` serves `/usr/share/caddy`, compresses static responses, and falls back unknown routes to `/index.html`.

## Railway Project Setup

1. Create or open the Railway workspace that should host the TFRSupply frontend.
2. Create a new Railway project.
3. Choose **Deploy from GitHub repo**.
4. Select the TFRSupply frontend repository.
5. Confirm Railway detects the repository `Dockerfile` and uses Docker deployment.
6. Configure the required environment variables before the first production deploy.
7. Deploy the selected branch.

## GitHub Repo Connection

1. In Railway, open the project service settings.
2. Connect the GitHub repository if it is not already connected.
3. Select the production branch used for frontend deployments.
4. Enable automatic deploys only after the first manual deployment has been verified.
5. Keep pull request preview deploys optional until the deployment path is stable.

## Required Environment Variables

Vite environment variables are embedded at build time, so set these in Railway before building or redeploy after changing them:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_BASE44_APP_ID` | Yes | Base44 application identifier used by the frontend. |
| `VITE_BASE44_APP_BASE_URL` | Yes | Base URL for the Base44 app/API integration. |
| `VITE_BASE44_FUNCTIONS_VERSION` | If used | Set only when the deployed environment requires a specific functions version. |

Railway also injects `PORT` at runtime. The `Caddyfile` listens on `{$PORT:8080}`, which uses Railway's assigned port and falls back to `8080` for local container runs.

## Public Railway Domain

1. Open the Railway service.
2. Go to **Settings** → **Networking**.
3. Choose **Generate Domain**.
4. Wait for Railway to provision the public domain.
5. Use the generated `https://*.up.railway.app` URL for smoke testing.
6. Add a custom domain later only after the generated Railway domain is verified.

## Verification Checklist

After deployment, verify:

1. The Railway deployment logs show `npm run build` completing successfully.
2. The service starts Caddy without port binding errors.
3. The generated public domain loads the homepage.
4. A client-side route can be opened directly in a new browser tab without a 404.
5. Browser dev tools show static assets loading from the Railway domain.
6. Base44-dependent features use the configured `VITE_BASE44_*` values for the target environment.

Suggested smoke-test URLs:

- `/`
- `/police`
- `/police/light-bars`

## Rollback Notes

- Use Railway's deployment history to redeploy the last known-good deployment.
- If a bad environment variable caused the issue, update the variable and trigger a new deployment.
- If the Docker image builds but routes 404, inspect the `Caddyfile` fallback and confirm `dist/index.html` exists in the final image.
- If static assets fail to load, verify the Vite build completed and the runtime image copied `/app/dist` into `/usr/share/caddy`.
- Keep application rollback separate from product data, configurator, commerce, pricing, quote, or catalog migration changes.

## Local Container Verification

To verify the production container locally:

```bash
docker build -t tfrsupply-frontend .
docker run --rm -p 8080:8080 -e PORT=8080 tfrsupply-frontend
```

Then open `http://localhost:8080` and direct-route paths such as `http://localhost:8080/police`.
