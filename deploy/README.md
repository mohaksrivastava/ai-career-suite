# deploy/

VM-side config templates referenced by `career-ops-build-guide.md`. These are
not used by the app at runtime — copy them onto the GCP VM during Phase 1 and
Phase 8 of the build guide.

| File | Destination on VM | Guide phase |
|---|---|---|
| `Caddyfile` | `/etc/caddy/Caddyfile` | 1.10, hardened in 8.3 |
| `career-ops-api.service` | `/etc/systemd/system/career-ops-api.service` | 1.11 |
| `career-ops-logrotate` | `/etc/logrotate.d/career-ops` | 8.4 |

Replace `your-domain.example.com` and `YOUR_UNIX_USER` before copying.
