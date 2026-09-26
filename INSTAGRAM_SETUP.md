# Instagram real-posting setup (one time)

The "Post Now" button posts a real Reel to **@aurentarot** using Meta's official
Instagram Graph API. There is **no** other safe way to post from code — no
password login, no browser automation (that gets accounts banned). So this
one-time setup is unavoidable. It's free.

When you finish, put two values in `.env`:

```
IG_BUSINESS_ACCOUNT_ID=...
IG_ACCESS_TOKEN=...
```

Restart the app. If both are present, "Post Now" goes live (and asks you to
confirm before every post). If not, it stays a safe simulation.

---

## Step 1 — Make @aurentarot a Professional account  (2 min, in the app)
Instagram app → Settings → **Account type and tools** → **Switch to professional
account** → choose **Creator** or **Business**. (Free. Reversible.)

## Step 2 — Link it to a Facebook Page  (5 min)
The Graph API requires the IG account to be connected to a Facebook Page.
- Create a Facebook Page if you don't have one: https://www.facebook.com/pages/create
- Instagram app → Settings → **Sharing to other apps → Facebook** → connect the Page.

## Step 3 — Create a Meta developer app  (10 min)
1. Go to https://developers.facebook.com/ → log in → **My Apps → Create App**.
2. Choose use case **"Other"** → type **Business**.
3. In the app dashboard, add the product **Instagram Graph API** (or "Instagram").
4. Note your **App ID** and **App Secret** (Settings → Basic).

## Step 4 — Get an access token + your IG account id  (15 min)
Easiest path is the Graph API Explorer:
1. https://developers.facebook.com/tools/explorer/
2. Select your app (top right).
3. Click **Generate Access Token**; approve these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
4. This gives a **short-lived** token (~1 hour). Exchange it for a **long-lived**
   token (~60 days) — paste your values into this URL in a browser:
   ```
   https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN
   ```
   Copy the returned `access_token` → that's your **IG_ACCESS_TOKEN**.
5. Find your Instagram business account id. In the Graph API Explorer, run:
   ```
   me/accounts            -> gives your Page id
   {PAGE_ID}?fields=instagram_business_account   -> gives the IG account id
   ```
   That id is your **IG_BUSINESS_ACCOUNT_ID**.

> Note: brand-new apps may be in **Development mode**. Publishing to your OWN
> account works in development mode as long as you're an admin/tester of the app,
> so you likely do NOT need full App Review just to post to @aurentarot. If Meta
> asks for review for `instagram_content_publish`, add yourself as a Tester under
> App Roles first.

## Step 5 — Make the rendered MP4 publicly reachable  (we do this together)
This is the one remaining piece. Instagram **pulls** the video from a public
`https://` URL — it cannot read a file from your Mac. When you post, the app
sends `item.publicVideoUrl` to Instagram.

Options (all free), to decide when you're ready:
- **Cloudflare R2** free tier — upload the MP4, use its public URL. No credit card
  for the free tier.
- **cloudflared / ngrok tunnel** — expose `content/rendered/` over a temporary
  public URL only while posting. Free; URL changes each run; Mac must stay on.

Tell me which you prefer and I'll wire the upload step so "Post Now" fills in
`publicVideoUrl` automatically. Until then, real posting will stop with a clear
message asking for a public video URL.

---

## Token upkeep
Long-lived tokens last ~60 days. Refresh before expiry with:
```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=CURRENT_TOKEN
```
Never commit the token. It lives only in `.env` (gitignored).
