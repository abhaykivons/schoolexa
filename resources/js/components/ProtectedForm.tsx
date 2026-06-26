import React, { useEffect, useState } from 'react';

interface ProtectedFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent, recaptchaToken: string | null) => void;
  className?: string;
  recaptchaSiteKey?: string;
  recaptchaAction?: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * A protected form wrapper that includes:
 * - Honeypot fields (hidden fields that bots fill)
 * - Timing token (detects if form was submitted too fast)
 * - reCAPTCHA v3 integration (optional)
 */
export function ProtectedForm({
  children,
  onSubmit,
  className = '',
  recaptchaSiteKey,
  recaptchaAction = 'submit',
}: ProtectedFormProps) {
  const [formLoadTime] = useState(() => Math.floor(Date.now() / 1000));
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);

  // Load reCAPTCHA script if site key is provided
  useEffect(() => {
    if (!recaptchaSiteKey) return;

    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsRecaptchaLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => setIsRecaptchaLoaded(true));
    };
    document.head.appendChild(script);
  }, [recaptchaSiteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let recaptchaToken: string | null = null;

    // Get reCAPTCHA token if available
    if (recaptchaSiteKey && isRecaptchaLoaded && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
          action: recaptchaAction,
        });
      } catch (error) {
        console.error('reCAPTCHA error:', error);
      }
    }

    onSubmit(e, recaptchaToken);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Honeypot fields - hidden from users, bots will fill these */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          placeholder="Website URL"
        />
        <input
          type="text"
          name="company_address"
          tabIndex={-1}
          autoComplete="off"
          placeholder="Company Address"
        />
        <input
          type="text"
          name="fax_number"
          tabIndex={-1}
          autoComplete="off"
          placeholder="Fax Number"
        />
      </div>

      {/* Timing token - to detect bots that submit too fast */}
      <input type="hidden" name="_form_token_time" value={btoa(String(formLoadTime))} />

      {children}
    </form>
  );
}

export default ProtectedForm;
