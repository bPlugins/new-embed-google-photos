=== Gallery For Google Photos ===
Contributors:abuhayat, bplugins, btechnologies
Donate link: https://www.buymeacoffee.com/abuhayat
Tags: block, photos, google photos, gallery, Gutenberg block
Requires at least: 6.5+
Tested up to: 7.0
Stable tag: 1.2.0
Requires PHP: 7.1
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Embed stunning Google Photos galleries directly into your WordPress site with the Embed Google Photos plugin.

== Description ==

The Embed Google Photos plugin offers a seamless solution for integrating beautiful Google Photos galleries directly into your WordPress website. With its intuitive interface and robust functionality, this plugin simplifies the process of showcasing your photos and galleries in a visually stunning way. Whether you're a photographer, blogger, or business owner, this plugin provides a convenient and efficient way to share your visual content with your audience. With features like customizable layouts, responsive design, and easy-to-use settings, you can effortlessly create and manage your Google Photos galleries with ease. Say goodbye to complex embedding codes and manual updates – streamline your workflow and enhance your website's visual appeal with the Embed Google Photos plugin.

**[Demos](https://bplugins.com/products/embed-google-photos/#demos)** | **[Documentation](https://bplugins.com/docs/embed-google-photos/)**  

= Features =
- Display all photos from Google Photos.
- Show all albums contained within Google Photos.
- Display photos from specific albums.
- Customize the layout columns with various options.
- Set image aspect ratios.
- Customize the "Load More" button's color, typography, border, and padding.
- Add borders to images.

= How to use =
- First, install the Embed Google Photos plugin.
- Add the Embed Google Photos from the block category called "Widgets" in the Gutenberg editor.
- You can change block settings from the right-side settings sidebar.
- Enjoy!

* For installation help click on Installation Tab
 

= Feedback =
- Liked that plugin? Hate it? Want a new feature? [Send me some feedback](mailto:support@bplugins.com 'Send feedback')


== Installation ==

= From Gutenberg Editor: =
1. Go to the WordPress Block/Gutenberg Editor
2. Search For **Embed Google Photos**
3. Click on the **Embed Google Photos** to add the block

= Download & Upload: =
1. Download the **Embed Google Photos** plugin (*.zip file*)
2. In your admin area, go to the Plugins menu and click on **Add New**
3. Click on **Upload Plugin** and choose the **`embed-google-photos.zip`** file and click on **Install Now**
4. Activate the plugin and Enjoy!

= Manually: =
1. Download and upload the **Embed Google Photos** plugin to the **`/wp-content/plugins/`** directory
2. Activate the plugin through the Plugins menu in WordPress


== Frequently Asked Questions ==

= Is Embed Google Photos block free? =

Yes, Embed Google Photos block is a free Gutenberg block plugin.

= Can I show all Google Photos? =

Yes, you can display all Google Photos.

= Can I show just the album list? =

Yes, you can display the entire album list.

= Can I show photos from a specific album only? =

Yes, you can display all images from a specific album.

= Can I filter images and videos? =

Yes, you can filter both images and videos.

= Can I show my favorite images? =

Yes, you can display your favorite images.

= Does it work with any WordPress theme? =

Yes, it will work with any standard WordPress theme.

= Can I change block settings? =

Yes, you can change block settings from the Gutenberg block editor's right sidebar.

= How many times can I reuse a block? =

You can use unlimited times as you want.

= Where can I get support? =

You can post your questions on the [support forum here](https://wordpress.org/support/plugin/embed-google-photos/)


== External Services ==

This plugin connects to the following external services. Understanding what is sent, and when, helps clarify how your data is handled.

= Google Photos (Google OAuth 2.0 + Google Photos Picker API) =

What it is and why it is used: This plugin is a Google Photos gallery. To let you pick photos and videos from your own Google Photos account and display them on your site, it connects to Google's APIs on your server. This connection only happens after you enter your own Google API credentials (Client ID, Client Secret, Refresh Token) in the plugin settings and use the "Select Photos" flow; it is required for the plugin to function.

Which endpoints are contacted and what data is sent:
* https://oauth2.googleapis.com/token — your Client ID, Client Secret and Refresh Token are sent to exchange them for a short-lived access token.
* https://photospicker.googleapis.com/v1 — the access token is sent (as a Bearer token) to create a picker session, check its status, and list the media items you selected. The selected photos/videos are then downloaded to your own WordPress Media Library.

When it happens: only in wp-admin, triggered by an authenticated administrator connecting an account or clicking "Select Photos". No data is sent from your visitors' browsers, and the OAuth credentials/tokens never reach the frontend.

Your credentials and tokens are stored only on your own server (in your WordPress database) and are sent only to Google. This plugin does not transmit them to bPlugins or any other third party.

Google's terms and privacy policy:
* Terms of Service: https://policies.google.com/terms
* Privacy Policy: https://policies.google.com/privacy
* Google APIs Terms of Service: https://developers.google.com/terms

= Schema.org vocabulary (https://schema.org) =

What it is and why it is used: On the frontend the plugin outputs Schema.org "ImageObject" structured data (JSON-LD) for each gallery image so search engines such as Google can better understand and index your images (Google Images / rich results, improving SEO).

What data is sent: None. The address "https://schema.org" appears only as the standard `@context` identifier inside the JSON-LD markup — it is a vocabulary name, not a network request. The plugin does not connect to, load anything from, or send any data to schema.org. All image data stays on your own server.

Terms & privacy: https://schema.org/docs/terms.html

== Screenshots ==

1. Settings
2. Default
3. Favorite
4. Only Photos
5. Only Videos
6. Specific Album
7. Ratio Square
8. Ratio Landscape
9. Ratio Horizontal
10. Ratio Potrait


== Changelog ==

= 1.2.0 - 14 July, 2026 =
* New: Lazy-load with a blurred low-res placeholder — images fade in as you scroll and off-screen images don't download until needed (faster pages, less mobile data, better CLS).
* New: Responsive images (srcset) — each device downloads the image size it actually needs instead of one large file for all (much less data on mobile, faster LCP).
* New: Schema.org ImageObject structured data (JSON-LD) for gallery images, so search engines can index them for Google Images / rich results.
* New: Per-image alt text editing in the block (Image Alt Text panel), seeded from the Media Library — improves accessibility and image SEO.
* Doc: Documented external services (Google Photos API and the Schema.org vocabulary) in the readme.
* New: Video support — pick images and videos together; videos show a poster with a play icon and open in the lightbox.
* New: Media Type filter (All Media / Photos / Videos) applied to the selected media.
* New: Layout options — Grid, Masonry, and Carousel (Swiper) with autoplay, loop, navigation arrows and pagination dots.
* New: Load More and numbered Pagination with configurable items-per-page and button text.
* New: Captions — show the image Title or Date, either below the image or as a hover overlay.
* New: Image Aspect Ratio and Image Border controls now apply to the gallery.
* Improved: Redesigned Authorization sidebar with field validation, loading state, and success/error messages.
* Improved: Modern connect / select-photos card design and buttons.
* Improved: Clearing all credential fields and saving now disconnects the account; the block updates without a page reload.
* Improved: Server-side credential verification — invalid credentials now show a clear message instead of being saved silently.
* Dev: Migrated the build to @wordpress/scripts (build/ folder) with a shared editor/frontend render (view.js + render.php).
* Fixed: Block not appearing in the inserter due to an async transpile crash in the editor script.
* Fixed: Carousel now works correctly in both the editor and the frontend.

= 1.1.0 - 5 July, 2026 =
* Security: fixed unauthenticated exposure of the Google Photos OAuth token (including the refresh_token) in the block's public output and the token AJAX handler.
* Security: the frontend token endpoint now returns only the short-lived access token.
* Security: added a capability check to the refresh-token handler.
* Hardening: added isset()/wp_unslash() input guards and removed extract() from block rendering.
* Tested up to WordPress 7.0.

= 1.0.9 - 28 Dec, 2024 =
* Frontend useAjax use.

= 1.0.8 - 12 Dec, 2024 =
* Extra code remove.

= 1.0.7 - 8 Dec, 2024 =
* Some issues problem.

= 1.0.6 - 27 Nov, 2024 =
* No publicly documented resource for your compressed content
* Undocumented use of a 3rd Party / external service

= 1.0.5 - 21 Nov,24 =
* Trademark issues solved

= 1.0.4 - 9 Oct, 2024 =
* Solved the problem where album list images were not found.

= 1.0.3 - 12 sept, 2024 =
* Fixed the popup image resolution.

= 1.0.2 - 16 July, 2024 =
* Load more button update.

= 1.0.1 - 18 May,2024 =
* Authorization issues fixed.

= 1.0.0 =
* Initial Release


== Upgrade Notice ==

= 1.2.0 - 14 July, 2026 =
* Adds lazy-load with blur placeholder, responsive images (srcset), Schema.org image markup, per-image alt text, video support, Masonry & Carousel layouts, Load More/Pagination, captions, and a redesigned authorization flow.

= 1.1.0 - 5 July, 2026 =
* Security release: update immediately. Fixes exposure of Google Photos OAuth credentials (including the refresh_token) to unauthenticated visitors.

= 1.0.9 - 28 Dec, 2024 =
* Frontend useAjax use.

= 1.0.8 - 12 Dec, 2024 =
* Extra code remove.

= 1.0.7 - 8 Dec, 2024 =
* Some issues problem.

= 1.0.6 - 27 Nov, 2024 =
* No publicly documented resource for your compressed content
* Undocumented use of a 3rd Party / external service

= 1.0.5 - 21 Nov,24 =
* Trademark issues solved

= 1.0.4 - 9 Oct, 2024 =
* Solved the problem where album list images were not found.

= 1.0.3 - 12 sept, 2024 =
* Fixed the popup image resolution.

= 1.0.2 - 16 July, 2024 =
* Load more button update.

= 1.0.1 - 18 May,2024 =
* Authorization issues fixed.

= 1.0.0 =
* Initial Release

 