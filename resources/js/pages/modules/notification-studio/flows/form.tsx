'use client';

import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

import {
    ArrowLeft,
    Save,
    GitBranch,
    Zap,
    Users,
    Mail,
    Clock,
    Check,
} from 'lucide-react';

interface Flow {
    id: number;
    name: string;
    description: string | null;
    trigger_event: string;
    recipients: string[];
    custom_emails: string[] | null;
    send_email: boolean;
    send_in_app: boolean;
    send_sms: boolean;
    email_template_id: number | null;
    email_template?: {
        id: number;
        name: string;
    };
    send_timing: 'immediate' | 'delayed' | 'scheduled';
    delay_minutes: number | null;
    schedule_time: string | null;
    is_active: boolean;
    priority: number;
}

interface Template {
    id: number;
    name: string;
    event_type: string;
    category: string;
}

interface TriggerEventInfo {
    label: string;
    category: string;
    description: string;
    recipients: string[];
    variables: string[];
}

interface PageProps {
    flow: Flow | null;
    templates: Template[];
    eventCategories: Record<string, string>;
    triggerEvents: Record<string, TriggerEventInfo>;
    recipientTypes: Record<string, string>;
}

const categoryColors: Record<string, string> = {
    enrollment: 'bg-green-100 text-green-800',
    admission: 'bg-pink-100 text-pink-800',
    parent: 'bg-blue-100 text-blue-800',
    staff: 'bg-purple-100 text-purple-800',
    approval: 'bg-amber-100 text-amber-800',
    general: 'bg-gray-100 text-gray-800',
};

export default function NotificationFlowForm() {
    const pageProps = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;
    const { flow, templates = [], eventCategories = {}, triggerEvents = {}, recipientTypes = {}, auth, flash } = pageProps;

    const isEditing = !!flow;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Notification Studio', href: '/notification-studio' },
        { title: 'Notification Flows', href: '/notification-studio/flows' },
        { title: isEditing ? 'Edit Flow' : 'Create Flow', href: '#' },
    ];

    // Local state for recipients to avoid infinite loops
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>(flow?.recipients || []);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: flow?.name || '',
        description: flow?.description || '',
        trigger_event: flow?.trigger_event || '',
        recipients: flow?.recipients || [],
        custom_emails: flow?.custom_emails?.join(', ') || '',
        send_email: flow?.send_email ?? true,
        send_in_app: flow?.send_in_app ?? false,
        send_sms: flow?.send_sms ?? false,
        email_template_id: flow?.email_template_id?.toString() || 'none',
        send_timing: flow?.send_timing || 'immediate',
        delay_minutes: flow?.delay_minutes?.toString() || '',
        schedule_time: flow?.schedule_time || '',
        is_active: flow?.is_active ?? true,
        priority: flow?.priority?.toString() || '0',
    });

    const selectedEventInfo = useMemo(() => {
        if (data.trigger_event && triggerEvents && triggerEvents[data.trigger_event]) {
            return triggerEvents[data.trigger_event];
        }
        return null;
    }, [data.trigger_event, triggerEvents]);

    const filteredTemplates = useMemo(() => {
        if (!templates || templates.length === 0) return [];
        if (!selectedEventInfo) return templates;
        
        const filtered = templates.filter(t => 
            t.event_type === data.trigger_event || 
            t.category === selectedEventInfo.category
        );
        return filtered.length > 0 ? filtered : templates;
    }, [templates, data.trigger_event, selectedEventInfo]);

    // Sync selectedRecipients with form data
    useEffect(() => {
        setData('recipients', selectedRecipients);
    }, [selectedRecipients]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Auto-fill name when trigger event changes (only for new flows)
    useEffect(() => {
        if (!isEditing && data.trigger_event && selectedEventInfo && !data.name) {
            setData('name', `${selectedEventInfo.label} Notification`);
        }
    }, [data.trigger_event, selectedEventInfo, isEditing]);

    const handleRecipientToggle = useCallback((recipient: string) => {
        setSelectedRecipients(prev => {
            if (prev.includes(recipient)) {
                return prev.filter(r => r !== recipient);
            } else {
                return [...prev, recipient];
            }
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!data.name.trim()) {
            toast.error('Please enter a flow name');
            return;
        }
        if (!data.trigger_event) {
            toast.error('Please select a trigger event');
            return;
        }
        if (selectedRecipients.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        // Prepare form data
        const submitData = {
            name: data.name,
            description: data.description,
            trigger_event: data.trigger_event,
            recipients: selectedRecipients,
            custom_emails: data.custom_emails ? data.custom_emails.split(',').map(e => e.trim()).filter(Boolean) : [],
            send_email: data.send_email,
            send_in_app: data.send_in_app,
            send_sms: data.send_sms,
            email_template_id: data.email_template_id && data.email_template_id !== 'none' ? parseInt(data.email_template_id) : null,
            send_timing: data.send_timing,
            delay_minutes: data.delay_minutes ? parseInt(data.delay_minutes) : null,
            schedule_time: data.schedule_time || null,
            is_active: data.is_active,
            priority: parseInt(data.priority) || 0,
        };

        if (isEditing && flow) {
            router.put(route('notification-studio.flows.update', flow.id), submitData, {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (typeof firstError === 'string') {
                        toast.error(firstError);
                    }
                },
            });
        } else {
            router.post(route('notification-studio.flows.store'), submitData, {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (typeof firstError === 'string') {
                        toast.error(firstError);
                    }
                },
            });
        }
    };

    // Safe render check
    if (!eventCategories || !triggerEvents || !recipientTypes) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Loading..." />
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Notification Flow' : 'Create Notification Flow'} />
            <div className="flex flex-col min-h-screen">
                <Header user={auth?.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={route('notification-studio.flows.index')}>
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                </Button>
                                <HeadingSmall
                                    title={isEditing ? 'Edit Notification Flow' : 'Create Notification Flow'}
                                    description="Define when and to whom notifications are sent"
                                />
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Flow'}
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Main Content */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    {/* Basic Info */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <GitBranch className="w-5 h-5 text-blue-600" />
                                            Flow Information
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="trigger_event">Trigger Event *</Label>
                                                <Select
                                                    value={data.trigger_event || undefined}
                                                    onValueChange={(value) => setData('trigger_event', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select when this flow triggers" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(eventCategories).map(([catKey, catLabel]) => {
                                                            const categoryEvents = Object.entries(triggerEvents)
                                                                .filter(([_, info]) => info.category === catKey);
                                                            
                                                            if (categoryEvents.length === 0) return null;
                                                            
                                                            return (
                                                                <div key={catKey}>
                                                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                                                        {catLabel}
                                                                    </div>
                                                                    {categoryEvents.map(([eventKey, info]) => (
                                                                        <SelectItem key={eventKey} value={eventKey}>
                                                                            <div className="flex items-center gap-2">
                                                                                <Zap className="w-4 h-4 text-amber-500" />
                                                                                {info.label}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.trigger_event} />
                                                {selectedEventInfo && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {selectedEventInfo.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="name">Flow Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="e.g., Parent Enrollment Notification"
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div>
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Brief description of this notification flow"
                                                    rows={2}
                                                />
                                                <InputError message={errors.description} />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Recipients */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-600" />
                                            Recipients
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label className="mb-3 block">Who should receive this notification? *</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {Object.entries(recipientTypes).map(([key, label]) => {
                                                        const isSelected = selectedRecipients.includes(key);
                                                        const isRecommended = selectedEventInfo?.recipients?.includes(key) ?? false;

                                                        return (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                onClick={() => handleRecipientToggle(key)}
                                                                className={`
                                                                    p-3 rounded-lg border-2 text-left transition-all
                                                                    ${isSelected 
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                                        isSelected 
                                                                            ? 'bg-blue-500 border-blue-500' 
                                                                            : 'border-gray-300'
                                                                    }`}>
                                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                    </div>
                                                                    <span className="font-medium">{label}</span>
                                                                </div>
                                                                {isRecommended && (
                                                                    <Badge variant="outline" className="mt-2 text-xs">
                                                                        Recommended
                                                                    </Badge>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <InputError message={errors.recipients} />
                                            </div>

                                            {selectedRecipients.includes('custom') && (
                                                <div>
                                                    <Label htmlFor="custom_emails">Custom Email Addresses</Label>
                                                    <Input
                                                        id="custom_emails"
                                                        value={data.custom_emails}
                                                        onChange={(e) => setData('custom_emails', e.target.value)}
                                                        placeholder="admin@school.com, principal@school.com"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Separate multiple emails with commas
                                                    </p>
                                                    <InputError message={errors.custom_emails} />
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Email Template */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                            Email Configuration
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Send Email</Label>
                                                    <p className="text-sm text-gray-500">Send notification via email</p>
                                                </div>
                                                <Switch
                                                    checked={data.send_email}
                                                    onCheckedChange={(checked) => setData('send_email', checked)}
                                                />
                                            </div>

                                            {data.send_email && (
                                                <div>
                                                    <Label htmlFor="email_template_id">Email Template</Label>
                                                    <Select
                                                        value={data.email_template_id || 'none'}
                                                        onValueChange={(value) => setData('email_template_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an email template" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">No template (manual)</SelectItem>
                                                            {filteredTemplates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="w-4 h-4" />
                                                                        {template.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.email_template_id} />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        <Link
                                                            href={route('notification-studio.templates.create')}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Create a new template
                                                        </Link>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Timing */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            Timing
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label>When to send?</Label>
                                                <div className="grid grid-cols-3 gap-3 mt-2">
                                                    {[
                                                        { value: 'immediate', label: 'Immediately', desc: 'Send right away' },
                                                        { value: 'delayed', label: 'Delayed', desc: 'Wait X minutes' },
                                                        { value: 'scheduled', label: 'Scheduled', desc: 'At specific time' },
                                                    ].map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => setData('send_timing', option.value as any)}
                                                            className={`
                                                                p-3 rounded-lg border-2 transition-all text-center
                                                                ${data.send_timing === option.value
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}
                                                            `}
                                                        >
                                                            <p className="font-medium">{option.label}</p>
                                                            <p className="text-xs text-gray-500">{option.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {data.send_timing === 'delayed' && (
                                                <div>
                                                    <Label htmlFor="delay_minutes">Delay (minutes)</Label>
                                                    <Input
                                                        id="delay_minutes"
                                                        type="number"
                                                        min="1"
                                                        value={data.delay_minutes}
                                                        onChange={(e) => setData('delay_minutes', e.target.value)}
                                                        placeholder="e.g., 30"
                                                    />
                                                    <InputError message={errors.delay_minutes} />
                                                </div>
                                            )}

                                            {data.send_timing === 'scheduled' && (
                                                <div>
                                                    <Label htmlFor="schedule_time">Schedule Time</Label>
                                                    <Input
                                                        id="schedule_time"
                                                        type="time"
                                                        value={data.schedule_time}
                                                        onChange={(e) => setData('schedule_time', e.target.value)}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Notification will be sent at this time daily
                                                    </p>
                                                    <InputError message={errors.schedule_time} />
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    {/* Status */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Status</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Active</p>
                                                <p className="text-sm text-gray-500">
                                                    {data.is_active ? 'Flow will trigger on events' : 'Flow is disabled'}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>
                                    </Card>

                                    {/* Priority */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Priority</h3>
                                        <div>
                                            <Label htmlFor="priority">Execution Priority</Label>
                                            <Input
                                                id="priority"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={data.priority}
                                                onChange={(e) => setData('priority', e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Higher priority flows execute first (0-100)
                                            </p>
                                        </div>
                                    </Card>

                                    {/* Available Variables */}
                                    {selectedEventInfo && selectedEventInfo.variables && (
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-2">Available Variables</h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                These variables can be used in your email template
                                            </p>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {selectedEventInfo.variables.map((variable) => (
                                                    <div
                                                        key={variable}
                                                        className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                                                    >
                                                        <code className="text-sm text-blue-600 dark:text-blue-400">
                                                            {`{{${variable}}}`}
                                                        </code>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    )}

                                    {/* Quick Tips */}
                                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
                                            Quick Tips
                                        </h3>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                Choose an email template matching your event
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                Use "Immediate" timing for urgent notifications
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                Higher priority flows run first if multiple match
                                            </li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
