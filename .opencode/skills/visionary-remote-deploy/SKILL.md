---
name: visionary-remote-deploy
description: Use when deploying Visionary to the remote Ubuntu server, replacing /root/visionary/.next, restarting PM2 nextjs-app, uploading .env.local, or diagnosing visionaryblog.cn 500 errors.
---

# Visionary Remote Deploy

Use this skill for this project's manual production deployment flow on the Ubuntu server `82.157.210.93`.

## Context

- Local project path: `/Users/bytedance/Desktop/project/visionary/visionary`
- Remote SSH user: `ubuntu`
- Remote host: `82.157.210.93`
- SSH key: `/Users/bytedance/.ssh/visionary_ubuntu_ed25519`
- Remote project path: `/root/visionary`
- PM2 process name: `nextjs-app`
- App port behind Nginx: `3000`
- Production domain: `https://visionaryblog.cn`

## Deploy .next

Prefer archive upload over direct `rsync` for `.next`; `.next` has many files and direct sync can be slow.

1. Build the local `.next` directory:

```bash
npm run build
```

2. Confirm local build exists:

```bash
du -sh "/Users/bytedance/Desktop/project/visionary/visionary/.next"
test -f "/Users/bytedance/Desktop/project/visionary/visionary/.next/BUILD_ID"
```

3. Create a compressed archive outside the workspace. Exclude the local Next image optimizer cache; it can contain macOS AppleDouble metadata or stale optimized variants that make browser image requests return `application/octet-stream` instead of an image.

```bash
tar --exclude='.next/cache/images' -czf "/var/folders/lp/6x2b3c_d53xbs75131fyc16h0000gn/T/opencode/visionary_next.tar.gz" -C "/Users/bytedance/Desktop/project/visionary/visionary" .next
du -sh "/var/folders/lp/6x2b3c_d53xbs75131fyc16h0000gn/T/opencode/visionary_next.tar.gz"
```

4. Upload the archive:

```bash
scp -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" "/var/folders/lp/6x2b3c_d53xbs75131fyc16h0000gn/T/opencode/visionary_next.tar.gz" ubuntu@82.157.210.93:/tmp/visionary_next.tar.gz
```

5. Extract to a temporary directory, then replace remote `.next`:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "rm -rf /tmp/visionary_next_extract && mkdir -p /tmp/visionary_next_extract && tar -xzf /tmp/visionary_next.tar.gz -C /tmp/visionary_next_extract && test -d /tmp/visionary_next_extract/.next && sudo rm -rf /root/visionary/.next && sudo mv /tmp/visionary_next_extract/.next /root/visionary/.next && sudo chown -R root:root /root/visionary/.next"
```

If Linux `tar` prints `Ignoring unknown extended header keyword 'LIBARCHIVE.xattr.com.apple.provenance'`, it is a macOS extended attribute warning and does not affect the deployed files.

6. Verify remote build:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo ls -ld /root/visionary/.next && sudo du -sh /root/visionary/.next && sudo test -f /root/visionary/.next/BUILD_ID && sudo wc -c /root/visionary/.next/BUILD_ID"
```

7. Clean temporary files:

```bash
rm -f "/var/folders/lp/6x2b3c_d53xbs75131fyc16h0000gn/T/opencode/visionary_next.tar.gz"
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "rm -f /tmp/visionary_next.tar.gz && rm -rf /tmp/visionary_next_extract /tmp/visionary_next_upload"
```

## Restart PM2

The active production PM2 process is under root's PM2 home, not ubuntu's.

1. Inspect both PM2 contexts if needed:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "pm2 list || true; sudo pm2 list || true"
```

2. Restart the production process from `/root/visionary`:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo bash -lc 'cd /root/visionary && pm2 restart nextjs-app --update-env && pm2 save && pm2 list'"
```

If the process must be recreated instead of restarted:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo bash -lc 'cd /root/visionary && pm2 delete nextjs-app || true && pm2 start npm --name \"nextjs-app\" -- start && pm2 save && pm2 list'"
```

3. Verify the app is serving locally:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo pm2 list && curl -I --max-time 10 http://127.0.0.1:3000/ || true"
```

Expected healthy response includes `HTTP/1.1 200 OK`.

## Avatar/Image Cache Fix

If avatars render as broken images while the source COS image is accessible, compare default curl and browser-style requests to `/_next/image`. A bad copied image cache can make browser requests return a tiny AppleDouble payload:

```text
Content-Type: application/octet-stream
Content-Length: 163
AppleDouble encoded Macintosh file
```

Clear the remote Next image optimizer cache and restart PM2:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo rm -rf /root/visionary/.next/cache/images && sudo pm2 restart nextjs-app --update-env"
```

Then retest with browser image headers. A healthy response should be `image/webp`, `image/png`, or another real image type, not `application/octet-stream`.

## Upload Environment File

If `/api/auth/login` returns 500 after redeploy, check PM2 logs first. The known failure mode is missing environment variables:

```text
Access denied for user 'root'@'localhost' (using password: NO)
[ioredis] NOAUTH Authentication required
```

This means the app is missing `DATABASE_*` and/or `REDIS_*` variables. The local `.env.local` contains the required variables. Do not print secrets in the final response.

Upload and install it:

```bash
scp -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" "/Users/bytedance/Desktop/project/visionary/visionary/.env.local" ubuntu@82.157.210.93:/tmp/visionary.env.local
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo bash -lc 'mv /tmp/visionary.env.local /root/visionary/.env.local && chown root:root /root/visionary/.env.local && chmod 600 /root/visionary/.env.local && cd /root/visionary && pm2 restart nextjs-app --update-env && pm2 save && pm2 list'"
```

Verify without exposing values:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 'sudo bash -lc '\''ls -l /root/visionary/.env.local; for k in DATABASE_HOST DATABASE_USER DATABASE_PASSWORD DATABASE_NAME REDIS_HOST REDIS_PASSWORD SECRET_KEY; do v=$(printenv "$k"); if [ -n "$v" ]; then printf "%s=set\n" "$k"; else printf "%s=missing\n" "$k"; fi; done'\'''
```

Note: `printenv` may still show missing because Next.js loads `.env.local` internally, not necessarily into the parent shell. A better functional test is the login endpoint below.

## Logs And Verification

Fetch app logs:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo pm2 logs nextjs-app --lines 200 --nostream"
```

Fetch Nginx logs:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo journalctl -u nginx --no-pager -n 100 || true; sudo tail -n 100 /var/log/nginx/error.log 2>/dev/null || true"
```

Test the login endpoint with invalid credentials. A healthy backend returns 401, not 500:

```bash
ssh -i "/Users/bytedance/.ssh/visionary_ubuntu_ed25519" ubuntu@82.157.210.93 "sudo bash -lc 'curl -sS -o /tmp/login_check.out -w \"%{http_code}\n\" -X POST http://127.0.0.1:3000/api/auth/login -H \"Content-Type: application/json\" --data '\''{\"username\":\"__invalid__\",\"password\":\"__invalid__\",\"isRemember\":false}'\''; cat /tmp/login_check.out'"
```

Expected output:

```text
401
{"status":401,"message":"用户名或密码错误"}
```

Do not test login with an empty `{}` body when verifying production health. That can trigger `Bind parameters must not contain undefined` because the route currently does not validate missing `username` or `password` before executing SQL.

## Safety Notes

- Never print `.env.local` values or paste secrets into chat.
- Use remote temporary paths under `/tmp`, then move into `/root/visionary` with `sudo`.
- Keep `/root/visionary/.env.local` permission at `600`.
- Prefer `pm2 restart nextjs-app --update-env` when the process exists.
- Use delete/start only when recreating the PM2 process is intentional.
