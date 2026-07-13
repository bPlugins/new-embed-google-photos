import { gutenbergTabIcon, phpTabIcon, shortcodeTabIcon } from './icons';

const slug = 'embed-google-photos';

export const dashboardInfo = (info) => {
    const { version, adminUrl } = info;

    return {
        name: 'Gallery For Google Photos',
        displayName: 'Gallery For Google Photos - Embed Google Photos Galleries',
        description: 'Embed stunning Google Photos galleries directly into your WordPress site — grid, masonry and carousel layouts, captions, hover effects and a built-in lightbox.',
        slug,
        version,
        isPremium: false,
        hasPro: false,
        displayOurPlugins: true,
        media: {
            logo: `https://ps.w.org/${slug}/assets/icon-128x128.png`,
            banner: `https://ps.w.org/${slug}/assets/banner-772x250.png`,
            thumbnail: `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${slug}.png`,
        },
        pages: {
            org: `https://wordpress.org/plugins/${slug}/`,
            docs: `https://bplugins.com/docs/${slug}/`,
            pricing: `https://bplugins.com/products/${slug}/pricing`,
        },
        freemius: {
            product_id: 18779, // TODO: replace with the Freemius product ID.
            plan_id: 0, // TODO: replace with the Freemius (pro) plan ID.
            public_key: 'pk_REPLACE_ME', // TODO: replace with the Freemius public key.
        },
        adminUrl,
        startButton: {
            label: 'Create a Gallery',
            url: `${adminUrl}post-new.php?post_type=bpgpb_gallery`,
        },
    };
};

export const demoInfo = {
    allInOneLabel: 'See All Demos',
    allInOneLink: `https://wordpress.org/plugins/${slug}/`,
    demos: [
        { icon: '', title: 'Grid', type: 'iframe', url: `https://wordpress.org/plugins/${slug}/` },
        { icon: '', title: 'Masonry', type: 'iframe', url: `https://wordpress.org/plugins/${slug}/` },
        { icon: '', title: 'Carousel', type: 'iframe', url: `https://wordpress.org/plugins/${slug}/` },
    ],
};

export const settingsInfo = {};

export const pricingInfo = {
    logo: `https://ps.w.org/${slug}/assets/icon-256x256.png`, // Optional
    pluginId: 18779, // TODO: replace with the Freemius product ID.
    planId: 0, // TODO: replace with the Freemius (pro) plan ID.
    licenses: [
        1,
        3,
        null
    ],
    button: {
        label: 'Buy Now ➜'
    },
    featured: {
        selected: 3, // choose from licenses item
    }
};

export const welcomeInfo = (adminUrl) => ({
    keywords: ['Grid', 'Masonry', 'Carousel', 'Lightbox'],
    keywordsLabel: 'Layouts',
    gettingStarted: {
        tabs: [
            {
                key: 'gutenberg',
                label: 'Gutenberg',
                icon: gutenbergTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Add the Google Photos block',
                        body: 'Open the block editor on any post or page. Click the <strong>+</strong> icon or type <strong>/google-photos</strong> to insert the Embed Google Photos block.',
                        link: { url: `${adminUrl}post-new.php`, label: 'Open Editor' },
                    },
                    {
                        num: 2,
                        title: 'Connect & pick photos',
                        body: 'Authorize your Google account in the block sidebar, then click <strong>Select from Google Photos</strong> to import images and videos.',
                    },
                    {
                        num: 3,
                        title: 'Style & publish',
                        body: 'Choose a layout, captions and hover effects from the settings, then click <strong>Publish</strong>.',
                    },
                ],
            },
            {
                key: 'shortcode',
                label: 'ShortCode',
                icon: shortcodeTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Create a Gallery',
                        body: 'Go to <strong>Google Photos &rsaquo; Add New Gallery</strong>, pick your photos and configure the layout, then publish.',
                        link: { url: `${adminUrl}post-new.php?post_type=bpgpb_gallery`, label: 'Add New Gallery' },
                    },
                    {
                        num: 2,
                        title: 'Copy the shortcode',
                        body: 'In <strong>Google Photos &rsaquo; All Galleries</strong>, copy the shortcode from the <strong>ShortCode</strong> column.',
                        link: { url: `${adminUrl}edit.php?post_type=bpgpb_gallery`, label: 'All Galleries' },
                    },
                    {
                        num: 3,
                        title: 'Paste anywhere',
                        body: 'Paste the shortcode (e.g. <code>[google_photos id=123]</code>) into any post, page, widget or Shortcode block.',
                    },
                ],
            },
            {
                key: 'php',
                label: 'Theme / PHP',
                icon: phpTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Create a Gallery',
                        body: 'Go to <strong>Google Photos &rsaquo; Add New Gallery</strong>, configure it and publish. Note the gallery ID shown in the list table.',
                        link: { url: `${adminUrl}edit.php?post_type=bpgpb_gallery`, label: 'All Galleries' },
                    },
                    {
                        num: 2,
                        title: 'Open your template',
                        body: 'Open the theme template file where you want the gallery — for example <code>single.php</code>, <code>page.php</code> or a template part.',
                    },
                    {
                        num: 3,
                        title: 'Render via do_shortcode',
                        body: 'Add <code>&lt;?php echo do_shortcode(\'[google_photos id=123]\'); ?&gt;</code> (replace <em>123</em> with your gallery ID) to render it on the front end.',
                    },
                ],
            },
        ],
    },
    changelogsLimit: 6,
    changelogsReadMoreLabel: 'View More Changelogs',
    changelogs: [
        {
            version: '1.1.0',
            type: 'new',
            list: [
                'New: Modern admin dashboard.',
                'New: Shortcode support — [google_photos id=..].',
                'New: Hover effects (zoom, overlay, caption slide-in) with Style-tab controls.',
                'New: Lightbox extras — caption, thumbnails bar and slideshow autoplay.',
                'New: Caption typography and color controls.',
                'Fix: Caption date now reads the Picker API createTime.',
            ],
        },
    ],
    proFeatures: [
        'Extra layouts: Justified / Mosaic',
        'Album auto-sync (new photos appear automatically)',
        'Embed via shared album URL',
        'Password-protected galleries',
        'Download protection & watermark',
        'Elementor and page-builder widgets',
    ],
});
