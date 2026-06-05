# FortniteAPI-Proxy

A simple Express proxy for Fortnite AES and mapping endpoints.

## Install

Install dependencies with pnpm:

```bash
pnpm install
```

## Run

```bash
pnpm start
```

The server listens on port `3000` by default.

## Endpoints

I dont know if these endpoints have ratelimits so just incase we set x-forwarded-for and x-real-ip

- `GET /` - returns API information and available endpoints
- `GET /health` - returns health status with timestamp
- `GET /api/aes` - proxies and reformats `https://fortnite-api.com/v2/aes`
- `GET /uedb/aes` - forwards to `https://uedb.dev/svc/api/v1/fortnite/aes`
- `GET /uedb/mappings` - forwards to `https://uedb.dev/svc/api/v1/fortnite/mappings`

Query parameters are forwarded to the upstream endpoints.
