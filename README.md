# Shared site-visit counter

The portfolio remains hosted on GitHub Pages. This small service stores one shared integer using a Cloudflare Worker and D1 database. It is implemented but is not deployed or connected in this package. The site displays a dash until you connect it, and "Unavailable" if the service fails. It never substitutes a fake or browser-local total.

## Set up from the Cloudflare dashboard

1. Sign in to your own Cloudflare account. A Workers Free plan is sufficient within its usage limits. You do not need to move your domain or website away from GitHub Pages.
2. Find **D1 SQL Database**, choose **Create database**, and name it `portfolio-visits`.
3. Open that database's **Console**. Copy all of `schema.sql`, paste it into the SQL editor, and run it. This creates a total of zero. Running this file again preserves the current total.
4. Find **Workers & Pages**, create a Worker, and name it `portfolio-visit-counter`. Start with the Hello World option if shown.
5. Open the Worker's code editor. Replace the default code with the complete contents of `worker.js`, then deploy.
6. Open the Worker's **Bindings** tab, choose **Add binding → D1 database**, set the variable name to **DB**, and select `portfolio-visits`. Save and deploy the change if prompted.
7. In the Worker's settings, add a text variable named **ALLOWED_ORIGINS** with the value `https://tnirob30.github.io` if this is your GitHub username. Use only the origin: no trailing slash or repository path. For a custom domain or another username, replace the value. Multiple allowed origins can be separated by commas.
8. Copy the Worker's actual public HTTPS URL from its dashboard. Open it in your browser: it should show `{"count":0}`. Opening this address reads the total and does not increment it. Do not invent a URL; use the one Cloudflare gives you.
9. Open the portfolio's `editor.html`, select **Display settings & counter**, and paste the Worker URL into **Visit counter endpoint**. Keep **Show the site visit counter** checked.
10. Download `content.js`, replace it in GitHub, and commit. Open the public website in visitor mode. Its footer should show the total. Reload: it should increase by one.

## Exactly what is counted

- Every successful page-load count request, including repeat visits, reloads, and returns from the browser back/forward cache.
- Counts are shared across browsers and devices and survive website deployments.
- Moving between sections, changing a gallery slide, and opening the editor do not add visits.
- Local files, localhost, the development preview, editor previews, and editing mode do not count. Entering editing mode after a visitor-mode load does not undo that first visit.
- No visitor identifiers or cookies are stored by this code. The database has one total, not one row per person. The hosting provider still receives the usual connection metadata, including IP addresses.
- This is a page-visit tally, not an audited count of unique people. Bots, blocked requests, network failures, or deliberate endpoint calls can affect totals. The CORS/origin checks reduce accidental cross-site requests; they are not bot authentication. No automatic retries are used, to avoid double-counting an uncertain request.
- The update uses one atomic SQL statement, avoiding lost increments when multiple people visit together.

## Troubleshooting

- **Dash:** no endpoint is configured yet.
- **Preview:** you are in editing mode or a local/test preview.
- **Unavailable:** check the Worker URL, the `DB` binding, database schema, allowed origin, deployment status, and plan limits.
- **Origin not allowed:** ALLOWED_ORIGINS must exactly match your website origin, including https. A project site still uses `https://USERNAME.github.io`, without `/repository/`.
- **Attach the D1 database:** the binding must be named `DB` (uppercase).
- Keep your Cloudflare password and tokens out of the website. No secret is needed in content.js.

## Official documentation (checked September 2026)

- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/d1/best-practices/remote-development/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

Free plans have limits and provider terms may change. This package does not create a Cloudflare account or deploy a service for you.
