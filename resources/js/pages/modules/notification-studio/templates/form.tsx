'use client';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

import {
    ArrowLeft,
    Save,
    ChevronDown,
    Copy,
    Eye,
    Sparkles,
    Mail,
    Code,
    Type,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
} from 'lucide-react';

interface Template {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    event_type: string;
    subject: string;
    body: string;
    from_name: string | null;
    from_email: string | null;
    reply_to: string | null;
    cc: string | null;
    bcc: string | null;
    available_variables: string[] | null;
    is_active: boolean;
    is_default: boolean;
}

interface EventTypeInfo {
    label: string;
    category: string;
    description: string;
    variables: string[];
}

interface PageProps {
    template: Template | null;
    categories: Record<string, string>;
    eventTypes: Record<string, EventTypeInfo>;
    defaultTemplate: { subject: string; body: string } | null;
    selectedEventType: string | null;
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
    parent: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    student: 'bg-green-100 text-green-800 hover:bg-green-200',
    staff: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    enrollment: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    admission: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    approval: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    notification: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    general: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export default function EmailTemplateForm() {
    const { template, categories, eventTypes, defaultTemplate, selectedEventType, auth, flash } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const isEditing = !!template;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Notification Studio', href: '/notification-studio' },
        { title: 'Email Templates', href: '/notification-studio/templates' },
        { title: isEditing ? 'Edit Template' : 'Create Template', href: '#' },
    ];

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: template?.name || '',
        description: template?.description || '',
        category: template?.category || '',
        event_type: template?.event_type || selectedEventType || '',
        subject: template?.subject || defaultTemplate?.subject || '',
        body: template?.body || defaultTemplate?.body || '',
        from_name: template?.from_name || '',
        from_email: template?.from_email || '',
        reply_to: template?.reply_to || '',
        cc: template?.cc || '',
        bcc: template?.bcc || '',
        is_active: template?.is_active ?? true,
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState<{ subject: string; body: string } | null>(null);
    const [currentVariables, setCurrentVariables] = useState<string[]>(
        template?.available_variables || eventTypes[data.event_type]?.variables || []
    );
    const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Update variables when event type changes
    useEffect(() => {
        if (data.event_type && eventTypes[data.event_type]) {
            setCurrentVariables(eventTypes[data.event_type].variables);
            
            // Auto-fill category based on event type
            if (!data.category || data.category !== eventTypes[data.event_type].category) {
                setData('category', eventTypes[data.event_type].category);
            }
            
            // Auto-fill name based on event type label if creating new
            if (!isEditing && !data.name) {
                setData('name', eventTypes[data.event_type].label);
            }
        }
    }, [data.event_type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            patch(route('notification-studio.templates.update', template.id), {
                preserveScroll: true,
            });
        } else {
            post(route('notification-studio.templates.store'), {
                preserveScroll: true,
            });
        }
    };

    const insertVariable = (variable: string) => {
        const variableTag = `{{${variable}}}`;
        
        if (editorMode === 'html') {
            setData('body', data.body + variableTag);
        } else {
            // Insert at cursor position in contenteditable
            if (editorRef.current) {
                editorRef.current.focus();
                document.execCommand('insertText', false, variableTag);
            }
        }
        
        toast.success(`Variable {{${variable}}} inserted`);
    };

    const insertVariableInSubject = (variable: string) => {
        setData('subject', data.subject + `{{${variable}}}`);
        toast.success(`Variable {{${variable}}} inserted in subject`);
    };

    const copyVariable = (variable: string) => {
        navigator.clipboard.writeText(`{{${variable}}}`);
        toast.success(`Variable {{${variable}}} copied to clipboard`);
    };

    const loadDefaultTemplate = async () => {
        if (!data.event_type) {
            toast.error('Please select an event type first');
            return;
        }

        try {
            const response = await fetch(route('notification-studio.templates.get-default', { event_type: data.event_type }));
            const result = await response.json();
            
            if (result.template) {
                setData({
                    ...data,
                    subject: result.template.subject,
                    body: result.template.body,
                });
                toast.success('Default template loaded');
            } else {
                toast.info('No default template available for this event type');
            }
        } catch (error) {
            toast.error('Failed to load default template');
        }
    };

    const handlePreview = () => {
        // Generate sample preview with placeholder values
        const sampleData = generateSampleData(currentVariables);
        
        let parsedSubject = data.subject;
        let parsedBody = data.body;
        
        Object.entries(sampleData).forEach(([key, value]) => {
            parsedSubject = parsedSubject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
            parsedBody = parsedBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
        });
        
        setPreviewContent({ subject: parsedSubject, body: parsedBody });
        setShowPreview(true);
    };

    const generateSampleData = (variables: string[]): Record<string, string> => {
        const sampleValues: Record<string, string> = {
            parent_name: 'John Doe',
            parent_email: 'john.doe@example.com',
            student_name: 'Jane Doe',
            student_id: 'STU-2024-001',
            staff_name: 'Mr. Smith',
            email: 'user@example.com',
            password: '********',
            school_name: 'ABC International School',
            login_url: 'https://school.example.com/login',
            support_email: 'support@school.example.com',
            grade: 'Grade 5',
            class: '5-A',
            roll_number: '25',
            academic_year: '2024-2025',
            department: 'Science',
            designation: 'Teacher',
            application_id: 'APP-2024-0042',
            grade_applied: 'Grade 5',
            submission_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            joining_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            reporting_to: 'Principal John',
            documents_needed: 'Birth Certificate, Previous Report Card',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            upload_link: 'https://school.example.com/upload',
            next_steps: 'Please complete the fee payment and submit remaining documents.',
            reason: 'All seats for the requested grade are currently filled.',
            waitlist_position: '3',
            approver_name: 'Administrator',
            requester_name: 'Staff Member',
            request_type: 'Leave Request',
            details: 'Requesting 3 days leave for personal reasons.',
            approval_link: 'https://school.example.com/approve/123',
            approved_by: 'Principal',
            approval_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            rejected_by: 'Administrator',
            rejection_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            comments: 'Approved. Please ensure handover is complete.',
            recipient_name: 'User',
            announcement_title: 'Important Announcement',
            announcement_body: 'This is a sample announcement content.',
            reminder_title: 'Reminder',
            reminder_body: 'This is a sample reminder content.',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            reset_link: 'https://school.example.com/reset-password/token123',
            expiry_time: '24 hours',
            verification_link: 'https://school.example.com/verify-email/token123',
        };

        const result: Record<string, string> = {};
        variables.forEach((variable) => {
            result[variable] = sampleValues[variable] || `{{${variable}}}`;
        });
        return result;
    };

    // Editor toolbar actions
    const execCommand = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            // Update data after command
            setTimeout(() => {
                if (editorRef.current) {
                    setData('body', editorRef.current.innerHTML);
                }
            }, 10);
        }
    };

    const handleEditorInput = () => {
        if (editorRef.current) {
            setData('body', editorRef.current.innerHTML);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Email Template' : 'Create Email Template'} />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border p-4 rounded-xl">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={route('notification-studio.templates.index')}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </Button>
                            <HeadingSmall
                                title={isEditing ? 'Edit Email Template' : 'Create Email Template'}
                                description={isEditing ? 'Modify your email template' : 'Create a new email template for notifications'}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePreview} className="gap-2">
                                <Eye className="w-4 h-4" />
                                Preview
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Template'}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-12 gap-6">
                            {/* Main Content */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                {/* Basic Info */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-green-600" />
                                        Template Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label htmlFor="event_type">Event Type *</Label>
                                            <Select
                                                value={data.event_type}
                                                onValueChange={(value) => setData('event_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(categories).map(([catKey, catLabel]) => (
                                                        <div key={catKey}>
                                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                                                {catLabel}
                                                            </div>
                                                            {Object.entries(eventTypes)
                                                                .filter(([_, info]) => info.category === catKey)
                                                                .map(([eventKey, info]) => (
                                                                    <SelectItem key={eventKey} value={eventKey}>
                                                                        {info.label}
                                                                    </SelectItem>
                                                                ))}
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.event_type} />
                                            {data.event_type && eventTypes[data.event_type] && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {eventTypes[data.event_type].description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={data.category}
                                                onValueChange={(value) => setData('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(categories).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <Badge className={`${categoryColors[key]} mr-2`}>
                                                                {label}
                                                            </Badge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.category} />
                                        </div>

                                        <div className="col-span-2">
                                            <Label htmlFor="name">Template Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Parent Welcome Email"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="col-span-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Brief description of when this template is used"
                                                rows={2}
                                            />
                                            <InputError message={errors.description} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Email Content */}
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Type className="w-5 h-5 text-green-600" />
                                            Email Content
                                        </h3>
                                        {!isEditing && data.event_type && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={loadDefaultTemplate}
                                                className="gap-2"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Load Default
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="subject">Subject Line *</Label>
                                            <Input
                                                id="subject"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                placeholder="Email subject - use {{variables}} for dynamic content"
                                            />
                                            <InputError message={errors.subject} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Email Body *</Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={editorMode === 'visual' ? 'default' : 'ghost'}
                                                        size="sm"
                                                        onClick={() => setEditorMode('visual')}
                                                    >
                                                        <Type className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={editorMode === 'html' ? 'default' : 'ghost'}
                                                        size="sm"
                                                        onClick={() => setEditorMode('html')}
                                                    >
                                                        <Code className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {editorMode === 'visual' ? (
                                                <div className="border rounded-lg overflow-hidden">
                                                    {/* Toolbar */}
                                                    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-neutral-800 border-b">
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}>
                                                            <Bold className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}>
                                                            <Italic className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')}>
                                                            <Underline className="w-4 h-4" />
                                                        </Button>
                                                        <div className="w-px h-6 bg-gray-300 mx-1" />
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', '<h1>')}>
                                                            <Heading1 className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', '<h2>')}>
                                                            <Heading2 className="w-4 h-4" />
                                                        </Button>
                                                        <div className="w-px h-6 bg-gray-300 mx-1" />
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')}>
                                                            <List className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertOrderedList')}>
                                                            <ListOrdered className="w-4 h-4" />
                                                        </Button>
                                                        <div className="w-px h-6 bg-gray-300 mx-1" />
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyLeft')}>
                                                            <AlignLeft className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyCenter')}>
                                                            <AlignCenter className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyRight')}>
                                                            <AlignRight className="w-4 h-4" />
                                                        </Button>
                                                        <div className="w-px h-6 bg-gray-300 mx-1" />
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8" 
                                                            onClick={() => {
                                                                const url = prompt('Enter URL:');
                                                                if (url) execCommand('createLink', url);
                                                            }}
                                                        >
                                                            <LinkIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    {/* Editor */}
                                                    <div
                                                        ref={editorRef}
                                                        contentEditable
                                                        className="min-h-[300px] p-4 focus:outline-none prose prose-sm dark:prose-invert max-w-none"
                                                        onInput={handleEditorInput}
                                                        dangerouslySetInnerHTML={{ __html: data.body }}
                                                    />
                                                </div>
                                            ) : (
                                                <Textarea
                                                    value={data.body}
                                                    onChange={(e) => setData('body', e.target.value)}
                                                    placeholder="<p>Enter your HTML email content here...</p>"
                                                    rows={15}
                                                    className="font-mono text-sm"
                                                />
                                            )}
                                            <InputError message={errors.body} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Advanced Settings */}
                                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                    <Card className="p-6">
                                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                                            <h3 className="text-lg font-semibold">Advanced Settings</h3>
                                            <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                        </CollapsibleTrigger>
                                        
                                        <CollapsibleContent className="mt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="from_name">From Name</Label>
                                                    <Input
                                                        id="from_name"
                                                        value={data.from_name}
                                                        onChange={(e) => setData('from_name', e.target.value)}
                                                        placeholder="School Name"
                                                    />
                                                    <InputError message={errors.from_name} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="from_email">From Email</Label>
                                                    <Input
                                                        id="from_email"
                                                        type="email"
                                                        value={data.from_email}
                                                        onChange={(e) => setData('from_email', e.target.value)}
                                                        placeholder="noreply@school.com"
                                                    />
                                                    <InputError message={errors.from_email} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="reply_to">Reply To</Label>
                                                    <Input
                                                        id="reply_to"
                                                        type="email"
                                                        value={data.reply_to}
                                                        onChange={(e) => setData('reply_to', e.target.value)}
                                                        placeholder="support@school.com"
                                                    />
                                                    <InputError message={errors.reply_to} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="cc">CC (comma separated)</Label>
                                                    <Input
                                                        id="cc"
                                                        value={data.cc}
                                                        onChange={(e) => setData('cc', e.target.value)}
                                                        placeholder="admin@school.com, principal@school.com"
                                                    />
                                                    <InputError message={errors.cc} />
                                                </div>

                                                <div className="col-span-2">
                                                    <Label htmlFor="bcc">BCC (comma separated)</Label>
                                                    <Input
                                                        id="bcc"
                                                        value={data.bcc}
                                                        onChange={(e) => setData('bcc', e.target.value)}
                                                        placeholder="records@school.com"
                                                    />
                                                    <InputError message={errors.bcc} />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
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
                                                {data.is_active ? 'Template is active and will be used' : 'Template is inactive'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </Card>

                                {/* Available Variables */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-2">Available Variables</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Click to insert, or copy to clipboard
                                    </p>
                                    
                                    {currentVariables.length > 0 ? (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                            {currentVariables.map((variable) => (
                                                <div
                                                    key={variable}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                                                >
                                                    <code className="text-sm text-green-600 dark:text-green-400">
                                                        {`{{${variable}}}`}
                                                    </code>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => insertVariable(variable)}
                                                                >
                                                                    <Type className="w-3 h-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert in body</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => insertVariableInSubject(variable)}
                                                                >
                                                                    <Mail className="w-3 h-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert in subject</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => copyVariable(variable)}
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Copy</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-4">
                                            Select an event type to see available variables
                                        </p>
                                    )}
                                </Card>

                                {/* Quick Help */}
                                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                                    <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
                                        Quick Tips
                                    </h3>
                                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            Use variables like <code className="bg-white/50 px-1 rounded">{'{{student_name}}'}</code> for dynamic content
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            Keep subject lines clear and under 60 characters
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            Test with Preview before saving
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            Load Default templates for quick setup
                                        </li>
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Preview Dialog */}
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Email Preview
                            </DialogTitle>
                        </DialogHeader>
                        {previewContent && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Subject</p>
                                    <p className="font-medium">{previewContent.subject}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-neutral-900 border rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2">Body</p>
                                    <div 
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: previewContent.body }}
                                    />
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <strong>Note:</strong> This preview uses sample data. Actual emails will contain real information.
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}

