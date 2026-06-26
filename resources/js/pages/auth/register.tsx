import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, CheckCircle, XCircle, Mail } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Country data with flag emojis, phone code, and validation patterns
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1', pattern: /^(\+1)?[ -]?\(?(\d{3})\)?[ -]?(\d{3})[ -]?(\d{4})$/ },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44', pattern: /^(\+44)?[ -]?\(?(\d{4})\)?[ -]?(\d{6})$/ },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1', pattern: /^(\+1)?[ -]?\(?(\d{3})\)?[ -]?(\d{3})[ -]?(\d{4})$/ },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61', pattern: /^(\+61)?[ -]?\(?(\d{2})\)?[ -]?(\d{4})[ -]?(\d{4})$/ },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49', pattern: /^(\+49)?[ -]?\(?(\d{3,5})\)?[ -]?(\d{4,8})$/ },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33', pattern: /^(\+33)?[ -]?\(?(\d{1,3})\)?[ -]?(\d{2})[ -]?(\d{2})[ -]?(\d{2})[ -]?(\d{2})$/ },
];

// Function to generate appropriate placeholder based on country
const getPhonePlaceholder = (countryCode: string) => {
  switch (countryCode) {
    case 'US':
    case 'CA':
      return '123-456-7890';
    case 'GB':
      return '1234 567890';
    case 'AU':
      return '12 3456 7890';
    case 'DE':
      return '12345 67890';
    case 'FR':
      return '1 23 45 67 89';
    default:
      return 'Phone number';
  }
};

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    country: string;
    school_name: string;
    otp: string;
};

// Verification status types
type VerificationStatus = 'unverified' | 'verifying' | 'verified' | 'failed';
type OTPStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'failed';

// OTP Modal Component
const OTPModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
  onResend: () => void;
  status: OTPStatus;
  countdown: number;
  error?: string;
}> = ({ isOpen, onClose, email, otp, onOtpChange, onVerify, onResend, status, countdown, error }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="otp">Verification Code</Label>
            <div className="flex gap-2">
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                disabled={status === 'verified' || status === 'verifying'}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg font-semibold"
              />
            </div>
            {error && <div className="text-sm text-destructive mt-1">{error}</div>}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onVerify}
              disabled={otp.length !== 6 || status === 'verifying' || status === 'verified'}
            >
              {status === 'verifying' ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : status === 'verified' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onResend}
              disabled={countdown > 0 || status === 'sending'}
            >
              {status === 'sending' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        country: '',
        school_name: '',
        otp: '',
    });

    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneError, setPhoneError] = useState('');
    const [phoneValue, setPhoneValue] = useState('');
    const [emailStatus, setEmailStatus] = useState<VerificationStatus>('unverified');
    const [otpStatus, setOtpStatus] = useState<OTPStatus>('idle');
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    
    // Use ref to track verification timeout
    const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Set default country to first in the list
        if (!data.country) {
            setData('country', countries[0].code);
            setSelectedCountry(countries[0]);
        } else {
            // If country is already set, find and set the selected country
            const country = countries.find(c => c.code === data.country);
            if (country) {
                setSelectedCountry(country);
                
                // Extract phone number without country code for display
                if (data.phone.startsWith(country.phoneCode)) {
                    setPhoneValue(data.phone.replace(country.phoneCode, ''));
                } else if (data.phone) {
                    // If phone doesn't match current country code, keep it as is
                    setPhoneValue(data.phone);
                }
            }
        }
    }, [data.country, data.phone]);

    // Check form validity
    useEffect(() => {
        const isValid = data.name.trim() !== '' && 
                       data.email.trim() !== '' && 
                       data.school_name.trim() !== '' && 
                       data.phone.trim() !== '' && 
                       data.country.trim() !== '' &&
                       isValidEmail(data.email);
        setIsFormValid(isValid);
    }, [data.name, data.email, data.school_name, data.phone, data.country]);

    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && countdownRef.current) {
            clearTimeout(countdownRef.current);
        }
        
        return () => {
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, [countdown]);

    const handleCountryChange = (countryCode: string) => {
        const country = countries.find(c => c.code === countryCode);
        if (country) {
            setSelectedCountry(country);
            setData('country', country.code);
            
            // If phone already starts with the new country code, keep it
            if (data.phone.startsWith(country.phoneCode)) {
                setPhoneValue(data.phone.replace(country.phoneCode, ''));
            } else {
                // Otherwise, clear the phone input
                setPhoneValue('');
                setData('phone', '');
            }
            
            // Clear any previous phone error
            setPhoneError('');
        }
    };

    // Basic email validation
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Send OTP to email
    const sendOtp = async (email: string) => {
        if (!isValidEmail(email)) {
            setEmailStatus('failed');
            setEmailError('Please enter a valid email address');
            return false;
        }

        setOtpStatus('sending');
        setOtpError('');

        try {
            // Make a secure server-side request to send OTP
            const response = await fetch(route('send.otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setOtpStatus('sent');
                setCountdown(60); // 60 seconds countdown
                setEmailError('');
                return true;
            } else {
                setOtpStatus('idle');
                setOtpError(result.message || 'Failed to send OTP');
                return false;
            }
        } catch (error) {
            setOtpStatus('idle');
            setOtpError('OTP service unavailable');
            return false;
        }
    };

    // Verify OTP
    const verifyOtp = async (email: string, otp: string) => {
        if (!otp || otp.length < 6) {
            setOtpError('Please enter a valid OTP');
            return false;
        }

        setOtpStatus('verifying');
        setOtpError('');

        try {
            // Make a secure server-side request to verify OTP
            const response = await fetch(route('verify.otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ email, otp }),
            });

            const result = await response.json();

            if (response.ok && result.valid) {
                setOtpStatus('verified');
                setEmailStatus('verified');
                setOtpError('');
                return true;
            } else {
                setOtpStatus('sent');
                setOtpError(result.message || 'Invalid OTP code');
                return false;
            }
        } catch (error) {
            setOtpStatus('sent');
            setOtpError('OTP verification service unavailable');
            return false;
        }
    };

    const handlePhoneChange = (value: string) => {
        // Only allow numbers, spaces, hyphens, and parentheses
        const cleanedValue = value.replace(/[^\d\s\-()]/g, '');
        setPhoneValue(cleanedValue);
        
        // Add country code to the full phone number
        const fullPhone = selectedCountry.phoneCode + cleanedValue;
        setData('phone', fullPhone);
        
        // Validate phone format based on selected country
        if (cleanedValue && !selectedCountry.pattern.test(fullPhone)) {
            setPhoneError(`Please enter a valid ${selectedCountry.name} phone number`);
        } else {
            setPhoneError('');
        }
    };

    const handleEmailChange = (value: string) => {
        setData('email', value);
        
        // Reset verification status when email changes
        if (emailStatus !== 'unverified') {
            setEmailStatus('unverified');
            setOtpStatus('idle');
            setData('otp', '');
            setCountdown(0);
        }
        
        // Clear previous timeout if exists
        if (emailTimeoutRef.current) {
            clearTimeout(emailTimeoutRef.current);
        }
        
        // Basic validation
        if (!isValidEmail(value)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        
        setEmailError('');
    };

    const handleOtpChange = (value: string) => {
        // Only allow numbers
        const cleanedValue = value.replace(/\D/g, '');
        setData('otp', cleanedValue);
        
        // Auto-submit OTP when 6 digits are entered
        if (cleanedValue.length === 6 && otpStatus === 'sent') {
            verifyOtp(data.email, cleanedValue);
        }
    };

    const handleSendOtp = async () => {
        const success = await sendOtp(data.email);
        if (success) {
            setEmailStatus('verifying');
            setIsOtpModalOpen(true);
        }
    };

    const handleVerifyOtp = async () => {
        const success = await verifyOtp(data.email, data.otp);
        if (success) {
            // Close modal after a short delay to show success state
            setTimeout(() => {
                setIsOtpModalOpen(false);
            }, 1500);
        }
    };

    const handleResendOtp = async () => {
        await handleSendOtp();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!isFormValid) {
            setEmailError('Please fill all required fields correctly');
            return;
        }
        
        // Validate phone format
        if (data.phone && !selectedCountry.pattern.test(data.phone)) {
            setPhoneError(`Please enter a valid ${selectedCountry.name} phone number`);
            return;
        }
        
        // If email is not verified, send OTP and show modal
        if (emailStatus !== 'verified') {
            const success = await sendOtp(data.email);
            if (success) {
                setEmailStatus('verifying');
                setIsOtpModalOpen(true);
            }
            return;
        }
        
        // If email is verified, submit the form
        submitForm();
    };

    const submitForm = () => {
        post(route('demo.request'), {
            onFinish: () => reset('phone'),
        });
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (emailTimeoutRef.current) {
                clearTimeout(emailTimeoutRef.current);
            }
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, []);

    return (
        <AuthLayout title="Get Started Now" description="Enter your school details below to Get Started Now & Book A Demo">
            <Head title="Sign Up" />
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-6">

                    <div className='grid grid-cols-2 gap-4'>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="organization"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Name"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="school_name">School Name</Label>
                            <Input
                                id="school_name"
                                type="text"
                                required
                                tabIndex={2}
                                value={data.school_name}
                                onChange={(e) => setData('school_name', e.target.value)}
                                disabled={processing}
                                placeholder="School name"
                            />
                            <InputError message={errors.school_name} />
                        </div>
                    </div>  

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                disabled={processing || otpStatus === 'verified'}
                                placeholder="email@example.com"
                                className={emailStatus === 'verified' ? 'pr-10 border-green-500' : 
                                        emailStatus === 'verifying' ? 'pr-10 border-yellow-500' : 
                                        emailStatus === 'failed' ? 'pr-10 border-destructive' : ''}
                            />
                            <div className="absolute right-3 top-3">
                                {emailStatus === 'verifying' && (
                                    <LoaderCircle className="h-4 w-4 animate-spin text-yellow-500" />
                                )}
                                {emailStatus === 'verified' && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {emailStatus === 'failed' && (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                )}
                            </div>
                        </div>
                        {emailError && <div className="text-sm text-destructive mt-1">{emailError}</div>}
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <div className="relative">
                                <select
                                    id="country"
                                    required
                                    tabIndex={6}
                                    autoComplete="country"
                                    value={data.country}
                                    onChange={(e) => handleCountryChange(e.target.value)}
                                    disabled={processing}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.flag} {country.name} ({country.phoneCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <InputError message={errors.country} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">
                                Phone Number
                            </Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">
                                    {selectedCountry.flag}
                                </span>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    tabIndex={4}
                                    autoComplete="tel"
                                    value={phoneValue}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    disabled={processing}
                                    placeholder={getPhonePlaceholder(selectedCountry.code)}
                                    className="rounded-l-none"
                                />
                            </div>
                            {phoneError && <div className="text-sm text-destructive mt-1">{phoneError}</div>}
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button type="submit" className="mt-2 w-full bg-[#116B11]" tabIndex={10} disabled={processing || !isFormValid}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Next
                        </Button>
                        <Button type="submit" className="mt-2 w-full" tabIndex={10} disabled={processing || !isFormValid}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Book A Demo
                        </Button>
                    </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={11}>
                        Log in
                    </TextLink>
                </div>
            </form>

            <OTPModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                email={data.email}
                otp={data.otp}
                onOtpChange={handleOtpChange}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                status={otpStatus}
                countdown={countdown}
                error={otpError}
            />
        </AuthLayout>
    );
}