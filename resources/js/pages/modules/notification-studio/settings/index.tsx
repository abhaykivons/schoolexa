'use client';

import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

import {
    ArrowLeft,
    Save,
    Settings,
    Mail,
    Server,
    Shield,
    CheckCircle,
    XCircle,
    Send,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
} from 'lucide-react';

interface EmailSettingsData {
    id: number;
    mail_driver: string;
    smtp_host: string | null;
    smtp_port: number | null;
    smtp_username: string | null;
    smtp_encryption: string;
    mailgun_domain: string | null;
    mailgun_endpoint: string | null;
    ses_key: string | null;
    ses_region: string | null;
    from_name: string | null;
    from_email: string | null;
    reply_to_email: string | null;
    is_active: boolean;
    is_verified: boolean;
    verified_at: string | null;
    last_test_at: string | null;
    last_test_result: string | null;
    has_smtp_password: boolean;
    has_mailgun_secret: boolean;
    has_ses_secret: boolean;
    has_postmark_token: boolean;
}

interface PageProps {
    settings: EmailSettingsData | null;
    mailDrivers: Record<string, string>;
    encryptionTypes: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notification Studio', href: '/notification-studio' },
    { title: 'Email Settings', href: '/notification-studio/settings' },
];

export default function EmailSettingsPage() {
    const { settings, mailDrivers = {}, encryptionTypes = {}, auth, flash } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const [showTestDialog, setShowTestDialog] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        mail_driver: settings?.mail_driver || 'smtp',
        smtp_host: settings?.smtp_host || '',
        smtp_port: settings?.smtp_port?.toString() || '587',
        smtp_username: settings?.smtp_username || '',
        smtp_password: '',
        smtp_encryption: settings?.smtp_encryption || 'tls',
        mailgun_domain: settings?.mailgun_domain || '',
        mailgun_secret: '',
        mailgun_endpoint: settings?.mailgun_endpoint || 'api.mailgun.net',
        ses_key: settings?.ses_key || '',
        ses_secret: '',
        ses_region: settings?.ses_region || 'us-east-1',
        postmark_token: '',
        from_name: settings?.from_name || '',
        from_email: settings?.from_email || '',
        reply_to_email: settings?.reply_to_email || '',
        is_active: settings?.is_active ?? false,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            smtp_port: data.smtp_port ? parseInt(data.smtp_port) : null,
        };

        router.post(route('notification-studio.settings.store'), submitData, {
            preserveScroll: true,
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (typeof firstError === 'string') {
                    toast.error(firstError);
                }
            },
        });
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Please enter a test email address');
            return;
        }

        setIsTesting(true);

        try {
            const response = await fetch(route('notification-studio.settings.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ test_email: testEmail }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setShowTestDialog(false);
                setTestEmail('');
                router.reload({ only: ['settings'] });
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error('Failed to send test email');
        } finally {
            setIsTesting(false);
        }
    };

    const handleToggleStatus = () => {
        router.patch(route('notification-studio.settings.toggle-status'), {}, {
            preserveScroll: true,
        });
    };

    // Safe render check
    if (!mailDrivers || !encryptionTypes) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Email Settings" />
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Settings" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth?.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={route('notification-studio.index')}>
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                </Button>
                                <HeadingSmall
                                    title="Email Settings"
                                    description="Configure your email server to send notifications"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {settings && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowTestDialog(true)}
                                        className="gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Test Email
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </div>

                        {/* Status Banner */}
                        {settings && (
                            <Card className={`p-4 ${settings.is_active ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {settings.is_active ? (
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {settings.is_active ? 'Email Settings Active' : 'Email Settings Inactive'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {settings.is_active 
                                                    ? 'Notifications will be sent using your configured email server.' 
                                                    : 'Enable to use your email server for sending notifications.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {settings.is_verified && (
                                            <Badge className="bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                        <Switch
                                            checked={settings.is_active}
                                            onCheckedChange={handleToggleStatus}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Main Settings */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    {/* Mail Driver Selection */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Server className="w-5 h-5 text-blue-600" />
                                            Mail Provider
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="mail_driver">Email Service Provider</Label>
                                                <Select
                                                    value={data.mail_driver}
                                                    onValueChange={(value) => setData('mail_driver', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select provider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(mailDrivers).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.mail_driver} />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* SMTP Settings */}
                                    {data.mail_driver === 'smtp' && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                SMTP Configuration
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 md:col-span-1">
                                                    <Label htmlFor="smtp_host">SMTP Host *</Label>
                                                    <Input
                                                        id="smtp_host"
                                                        value={data.smtp_host}
                                                        onChange={(e) => setData('smtp_host', e.target.value)}
                                                        placeholder="smtp.gmail.com"
                                                    />
                                                    <InputError message={errors.smtp_host} />
                                                </div>

                                                <div className="col-span-2 md:col-span-1">
                                                    <Label htmlFor="smtp_port">SMTP Port *</Label>
                                                    <Input
                                                        id="smtp_port"
                                                        type="number"
                                                        value={data.smtp_port}
                                                        onChange={(e) => setData('smtp_port', e.target.value)}
                                                        placeholder="587"
                                                    />
                                                    <InputError message={errors.smtp_port} />
                                                </div>

                                                <div className="col-span-2 md:col-span-1">
                                                    <Label htmlFor="smtp_username">Username</Label>
                                                    <Input
                                                        id="smtp_username"
                                                        value={data.smtp_username}
                                                        onChange={(e) => setData('smtp_username', e.target.value)}
                                                        placeholder="your@email.com"
                                                    />
                                                    <InputError message={errors.smtp_username} />
                                                </div>

                                                <div className="col-span-2 md:col-span-1">
                                                    <Label htmlFor="smtp_password">
                                                        Password
                                                        {settings?.has_smtp_password && (
                                                            <span className="text-xs text-gray-500 ml-2">(already set)</span>
                                                        )}
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="smtp_password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={data.smtp_password}
                                                            onChange={(e) => setData('smtp_password', e.target.value)}
                                                            placeholder={settings?.has_smtp_password ? '••••••••' : 'Enter password'}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    <InputError message={errors.smtp_password} />
                                                </div>

                                                <div className="col-span-2">
                                                    <Label htmlFor="smtp_encryption">Encryption</Label>
                                                    <Select
                                                        value={data.smtp_encryption}
                                                        onValueChange={(value) => setData('smtp_encryption', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select encryption" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(encryptionTypes).map(([key, label]) => (
                                                                <SelectItem key={key} value={key}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.smtp_encryption} />
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Mailgun Settings */}
                                    {data.mail_driver === 'mailgun' && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                Mailgun Configuration
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="mailgun_domain">Mailgun Domain *</Label>
                                                    <Input
                                                        id="mailgun_domain"
                                                        value={data.mailgun_domain}
                                                        onChange={(e) => setData('mailgun_domain', e.target.value)}
                                                        placeholder="mg.yourdomain.com"
                                                    />
                                                    <InputError message={errors.mailgun_domain} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="mailgun_secret">
                                                        API Key *
                                                        {settings?.has_mailgun_secret && (
                                                            <span className="text-xs text-gray-500 ml-2">(already set)</span>
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id="mailgun_secret"
                                                        type="password"
                                                        value={data.mailgun_secret}
                                                        onChange={(e) => setData('mailgun_secret', e.target.value)}
                                                        placeholder={settings?.has_mailgun_secret ? '••••••••' : 'Enter API key'}
                                                    />
                                                    <InputError message={errors.mailgun_secret} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="mailgun_endpoint">API Endpoint</Label>
                                                    <Input
                                                        id="mailgun_endpoint"
                                                        value={data.mailgun_endpoint}
                                                        onChange={(e) => setData('mailgun_endpoint', e.target.value)}
                                                        placeholder="api.mailgun.net"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Use api.eu.mailgun.net for EU region
                                                    </p>
                                                    <InputError message={errors.mailgun_endpoint} />
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* AWS SES Settings */}
                                    {data.mail_driver === 'ses' && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                Amazon SES Configuration
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="ses_key">AWS Access Key ID *</Label>
                                                    <Input
                                                        id="ses_key"
                                                        value={data.ses_key}
                                                        onChange={(e) => setData('ses_key', e.target.value)}
                                                        placeholder="AKIA..."
                                                    />
                                                    <InputError message={errors.ses_key} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="ses_secret">
                                                        AWS Secret Access Key *
                                                        {settings?.has_ses_secret && (
                                                            <span className="text-xs text-gray-500 ml-2">(already set)</span>
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id="ses_secret"
                                                        type="password"
                                                        value={data.ses_secret}
                                                        onChange={(e) => setData('ses_secret', e.target.value)}
                                                        placeholder={settings?.has_ses_secret ? '••••••••' : 'Enter secret key'}
                                                    />
                                                    <InputError message={errors.ses_secret} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="ses_region">AWS Region</Label>
                                                    <Input
                                                        id="ses_region"
                                                        value={data.ses_region}
                                                        onChange={(e) => setData('ses_region', e.target.value)}
                                                        placeholder="us-east-1"
                                                    />
                                                    <InputError message={errors.ses_region} />
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Postmark Settings */}
                                    {data.mail_driver === 'postmark' && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                Postmark Configuration
                                            </h3>

                                            <div>
                                                <Label htmlFor="postmark_token">
                                                    Server API Token *
                                                    {settings?.has_postmark_token && (
                                                        <span className="text-xs text-gray-500 ml-2">(already set)</span>
                                                    )}
                                                </Label>
                                                <Input
                                                    id="postmark_token"
                                                    type="password"
                                                    value={data.postmark_token}
                                                    onChange={(e) => setData('postmark_token', e.target.value)}
                                                    placeholder={settings?.has_postmark_token ? '••••••••' : 'Enter API token'}
                                                />
                                                <InputError message={errors.postmark_token} />
                                            </div>
                                        </Card>
                                    )}

                                    {/* Sender Information */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            Sender Information
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="from_name">From Name *</Label>
                                                <Input
                                                    id="from_name"
                                                    value={data.from_name}
                                                    onChange={(e) => setData('from_name', e.target.value)}
                                                    placeholder="Your School Name"
                                                />
                                                <InputError message={errors.from_name} />
                                            </div>

                                            <div>
                                                <Label htmlFor="from_email">From Email *</Label>
                                                <Input
                                                    id="from_email"
                                                    type="email"
                                                    value={data.from_email}
                                                    onChange={(e) => setData('from_email', e.target.value)}
                                                    placeholder="notifications@yourschool.com"
                                                />
                                                <InputError message={errors.from_email} />
                                            </div>

                                            <div>
                                                <Label htmlFor="reply_to_email">Reply-To Email</Label>
                                                <Input
                                                    id="reply_to_email"
                                                    type="email"
                                                    value={data.reply_to_email}
                                                    onChange={(e) => setData('reply_to_email', e.target.value)}
                                                    placeholder="support@yourschool.com"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Where replies should be sent (optional)
                                                </p>
                                                <InputError message={errors.reply_to_email} />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    {/* Test Results */}
                                    {settings && settings.last_test_at && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4">Last Test</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {settings.last_test_result === 'Success' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                    <span className={settings.last_test_result === 'Success' ? 'text-green-600' : 'text-red-600'}>
                                                        {settings.last_test_result}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(settings.last_test_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Quick Help */}
                                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
                                            <Settings className="w-5 h-5 inline mr-2" />
                                            Quick Help
                                        </h3>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                <span><strong>Gmail:</strong> Use smtp.gmail.com, port 587, TLS. Enable "App passwords" in Google settings.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                <span><strong>Outlook:</strong> Use smtp.office365.com, port 587, TLS.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                <span><strong>SendGrid:</strong> Use smtp.sendgrid.net, port 587, TLS.</span>
                                            </li>
                                        </ul>
                                    </Card>

                                    {/* Security Note */}
                                    <Card className="p-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
                                            <Shield className="w-5 h-5 inline mr-2" />
                                            Security Note
                                        </h3>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            Your email credentials are encrypted and stored securely. Always use app-specific passwords or API keys instead of your main account password.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Test Email Dialog */}
            <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Test Email</DialogTitle>
                        <DialogDescription>
                            Enter an email address to receive a test email and verify your configuration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="test_email">Email Address</Label>
                        <Input
                            id="test_email"
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleTestEmail} disabled={isTesting}>
                            {isTesting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Test
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

