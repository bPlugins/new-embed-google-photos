# Gallery for Google Photos — Setup & Testing Guide

## Photos Picker API

How to connect the plugin using your own Google credentials and test the new photo-picker flow. No app verification or Google approval is required.

> [!NOTE]
> **What changed**
> Google retired the old Photos *Library* API on **31 March 2025**, so the plugin can no longer auto-list your albums. It now uses Google's **Photos Picker API**: you pick photos in Google's own window, the plugin **imports the selected images into your WordPress Media Library**, and the gallery renders those local copies. Existing galleries created with the old version will appear empty until you re-pick their photos.

> [!TIP]
> **Why no Google approval is needed**
> You use **your own** Google Cloud OAuth app, and only **you** (the site admin) ever sign in — and only to pick photos. Because the images are copied to your Media Library, the token is used **only while importing**, never when visitors view the gallery. So the app can stay **unverified / in Testing** forever; you simply click past the "unverified app" screen for your own app.

---

## 1. Create a Google Cloud project & enable the Picker API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or pick an existing one).
2. Open **APIs & Services → Library**, search for **Photos Picker API**, and click **Enable**.

   > [!WARNING]
   > **Enable the Picker API — not the Library API**
   > The old "Google Photos Library API" is deprecated. You only need `photospicker.googleapis.com`.

---

## 2. Configure the OAuth consent screen

1. Open **APIs & Services → OAuth consent screen**.
2. Choose **User type: External** and fill in the app name, your support email, and developer email.
3. On the **Scopes** step, click **Add or remove scopes** and add this scope (paste it in the manual field if it isn't listed):
   ```
   https://www.googleapis.com/auth/photospicker.mediaitems.readonly
   ```
4. On the **Test users** step, add the Google account whose photos you'll use.
5. Set the **Publishing status** to **In Production** (recommended) or leave it as **Testing** — either one works. You still do not need to submit for verification.

> [!TIP]
> **In Production is recommended**
> Setting the app to **In Production** is the better choice because Google refresh tokens no longer expire after ~7 days — you won't have to regenerate the token to pick new photos. Even without verification, you simply click past the "unverified app" screen for your own app.

> [!NOTE]
> **Testing mode note**
> If you keep the app in **Testing** mode, Google refresh tokens expire after about 7 days. That only matters when you want to pick *new* photos — your already-imported galleries keep working because the images live in your Media Library. When a token expires, just repeat Step 3.

---

## 3. Create OAuth credentials & a refresh token

### 3a. Create the OAuth client

1. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Under **Authorized redirect URIs**, add:
   ```
   https://developers.google.com/oauthplayground
   ```
4. Click **Create** and copy your **Client ID** and **Client Secret**.

### 3b. Generate a refresh token (OAuth Playground)

1. Open the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the **gear icon** (top-right) → check **Use your own OAuth credentials** → paste your Client ID and Client Secret.
3. In the left **"Input your own scopes"** box, enter the picker scope and click **Authorize APIs**:
   ```
   https://www.googleapis.com/auth/photospicker.mediaitems.readonly
   ```
4. Sign in with your test-user Google account. When you see **"Google hasn't verified this app"**, click **Advanced → Go to … (unsafe)** and allow access. *(This is your own app — it's safe.)*
5. Back in the Playground, click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** value.

> [!CAUTION]
> **Keep these private**
> Your Client Secret and Refresh token are credentials. Only paste them into the plugin's settings on your own site; never expose them publicly.

---

## 4. Connect the plugin

1. In wp-admin, edit any post/page and add the **Gallery For Google Photos** block.
2. Open the block editor's **options menu (⋮) → Google Photos Block** sidebar (or click the "Open authorization" button on the block).
3. In the **Authorization** panel, paste your **Client ID**, **Client Secret**, and **Refresh Token**.
4. Click **Save Information**.

> [!TIP]
> **Connected**
> The plugin exchanges your refresh token for an access token **server-side** and stores it. The block's "Connect" prompt is replaced by the photo picker.

---

## 5. Pick photos & publish

1. On the block, click **Select from Google Photos**.
2. A Google Photos window opens — **select the photos** you want and confirm.
3. The plugin polls the session, then **imports each picked image into your Media Library** and shows the thumbnails in the editor.
4. Publish the page. Visitors see the local images in a responsive grid with a lightbox — no Google sign-in, no token, nothing that expires.
