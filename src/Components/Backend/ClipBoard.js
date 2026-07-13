import { useState } from 'react';
import { __ } from '@wordpress/i18n';

/**
 * Copy-to-clipboard shortcode box shown at the top of the block when it is
 * edited inside a Gallery (bpgpb_gallery) post.
 */
const ClipBoard = ({ shortcode }) => {
    const [hasCopied, setHasCopied] = useState(false);

    // navigator.clipboard only works in a secure context (HTTPS or localhost).
    // Local dev sites (http://*.local) fall back to the execCommand method.
    const copyText = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                // fall through to the legacy path below
            }
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (err) {
            ok = false;
        }
        document.body.removeChild(textarea);
        return ok;
    };

    const handleCopy = async () => {
        const ok = await copyText(shortcode);
        if (ok) {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <section className="clipBoard">
            <div className="clipBtnWrapper">
                <p className="clipBoard__label">
                    {__('Copy this shortcode and paste it into your post, page, or text widget content', 'embed-google-photos')}
                </p>
                <button className={`clipBoard__btn${hasCopied ? ' is-copied' : ''}`} onClick={handleCopy}>
                    <code className="clipBoard__code">{shortcode}</code>
                    <span className="clipBoard__action">
                        {hasCopied ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {__('Copied!', 'embed-google-photos')}
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                {__('Copy', 'embed-google-photos')}
                            </>
                        )}
                    </span>
                </button>
            </div>
        </section>
    );
};

export default ClipBoard;
