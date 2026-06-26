import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface FormProtectionOptions {
  recaptchaSiteKey?: string;
  action?: string;
}

interface FormProtectionResult {
  honeypotFields: {
    website_url: string;
    company_address: string;
    fax_number: string;
  };
  formTokenTime: string;
  getRecaptchaToken: () => Promise<string | null>;
  isRecaptchaLoaded: boolean;
}

/**
 * Custom hook for form spam protection
 * Includes honeypot fields, timing token, and reCAPTCHA integration
 */
export function useFormProtection(options: FormProtectionOptions = {}): FormProtectionResult {
  const { recaptchaSiteKey, action = 'submit' } = options;
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);

  // Generate form load timestamp (for bot detection)
  const [formTokenTime] = useState(() => btoa(String(Math.floor(Date.now() / 1000))));

  // Honeypot fields - these should remain empty (bots will fill them)
  const honeypotFields = {
    website_url: '',
    company_address: '',
    fax_number: '',
  };

  // Load reCAPTCHA script
  useEffect(() => {
    if (!recaptchaSiteKey) return;

    // Check if already loaded
    if (window.grecaptcha) {
      setIsRecaptchaLoaded(true);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsRecaptchaLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [recaptchaSiteKey]);

  // Get reCAPTCHA token
  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!recaptchaSiteKey || !isRecaptchaLoaded || !window.grecaptcha) {
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(recaptchaSiteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }, [recaptchaSiteKey, action, isRecaptchaLoaded]);

  return {
    honeypotFields,
    formTokenTime,
    getRecaptchaToken,
    isRecaptchaLoaded,
  };
}

/**
 * Helper function to add protection fields to form data
 */
export function addProtectionToFormData(
  formData: Record<string, any>,
  protection: FormProtectionResult,
  recaptchaToken?: string | null
): Record<string, any> {
  return {
    ...formData,
    ...protection.honeypotFields,
    _form_token_time: protection.formTokenTime,
    recaptcha_token: recaptchaToken || '',
  };
}
