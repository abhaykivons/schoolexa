'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Copy,
    Power,
    GitBranch,
    Filter,
    X,
    ArrowLeft,
    Zap,
    Mail,
    Clock,
    Users,
    Play,
    Wand2,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notification Studio', href: '/notification-studio' },
    { title: 'Notification Flows', href: '/notification-studio/flows' },
];

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
    created_at: string;
}

interface PageProps {
    flows: {
        data: Flow[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    eventCategories: Record<string, string>;
    triggerEvents: Record<string, {
        label: string;
        category: string;
        description: string;
        recipients: string[];
        variables: string[];
    }>;
    recipientTypes: Record<string, string>;
    filters: {
        category?: string;
        search?: string;
        status?: string;
    };
}

const categoryColors: Record<string, string> = {
    enrollment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    admission: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    parent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    staff: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function NotificationFlowsIndex() {
    const { flows, eventCategories, triggerEvents, recipientTypes, filters, auth, flash } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [isInitialMount, setIsInitialMount] = useState(true);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        // Skip the initial mount to prevent resetting page on first render
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        const timeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
            if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

            router.get(route('notification-studio.flows.index'), params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, selectedCategory, selectedStatus]);

    const handleDelete = (flow: Flow) => {
        Swal.fire({
            title: 'Delete Flow?',
            text: `Are you sure you want to delete "${flow.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('notification-studio.flows.destroy', flow.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleToggleStatus = (flow: Flow) => {
        router.patch(route('notification-studio.flows.toggle-status', flow.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDuplicate = (flow: Flow) => {
        router.post(route('notification-studio.flows.duplicate', flow.id), {}, {
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        router.get(route('notification-studio.flows.index'));
    };

    const hasActiveFilters = search || (selectedCategory && selectedCategory !== 'all') || (selectedStatus && selectedStatus !== 'all');

    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeedDefaults = () => {
        Swal.fire({
            title: 'Generate Default Flows?',
            text: 'This will create default notification flows for common events. Existing flows will not be affected.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, generate!',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsSeeding(true);
                router.post(route('notification-studio.flows.seed-defaults'), {}, {
                    preserveScroll: true,
                    onFinish: () => setIsSeeding(false),
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Flows" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="space-y-6 bg-white dark:bg-neutral-900 border p-6 rounded-xl">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={route('notification-studio.index')}>
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                </Button>
                                <HeadingSmall
                                    title="Notification Flows"
                                    description="Automate notifications based on events"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handleSeedDefaults}
                                    disabled={isSeeding}
                                >
                                    <Wand2 className="w-4 h-4" />
                                    {isSeeding ? 'Generating...' : 'Generate Defaults'}
                                </Button>
                                <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Link href={route('notification-studio.flows.create')}>
                                        <Plus className="w-4 h-4" />
                                        New Flow
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card className="p-4 bg-gray-50 dark:bg-neutral-800 border-0">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search flows..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 bg-white dark:bg-neutral-900"
                                    />
                                </div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-neutral-900">
                                        <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {Object.entries(eventCategories).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full sm:w-[140px] bg-white dark:bg-neutral-900">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="icon" onClick={clearFilters}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Flows Table */}
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                                        <TableHead className="w-[280px]">Flow</TableHead>
                                        <TableHead>Trigger Event</TableHead>
                                        <TableHead>Recipients</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead>Timing</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flows.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-3 text-gray-500">
                                                    <GitBranch className="w-12 h-12 opacity-50" />
                                                    <p className="text-lg">No notification flows found</p>
                                                    <p className="text-sm">Get started by creating a flow or generating defaults</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleSeedDefaults}
                                                            disabled={isSeeding}
                                                            className="gap-2"
                                                        >
                                                            <Wand2 className="w-4 h-4" />
                                                            {isSeeding ? 'Generating...' : 'Generate Defaults'}
                                                        </Button>
                                                        <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                                                            <Link href={route('notification-studio.flows.create')}>
                                                                <Plus className="w-4 h-4" />
                                                                Create Flow
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        flows.data.map((flow) => {
                                            const eventInfo = triggerEvents[flow.trigger_event];
                                            const category = eventInfo?.category || 'general';

                                            return (
                                                <TableRow key={flow.id} className="group">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{flow.name}</span>
                                                            {flow.description && (
                                                                <span className="text-sm text-gray-500 truncate max-w-[250px]">
                                                                    {flow.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${categoryColors[category]} font-normal`}>
                                                            <Zap className="w-3 h-3 mr-1" />
                                                            {eventInfo?.label || flow.trigger_event}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm">
                                                                {flow.recipients.map(r => recipientTypes[r] || r).join(', ')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {flow.email_template ? (
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm">{flow.email_template.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">None</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm capitalize">
                                                                {flow.send_timing}
                                                                {flow.delay_minutes && ` (${flow.delay_minutes}m)`}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={flow.is_active ? 'default' : 'secondary'}
                                                            className={flow.is_active
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                            }
                                                        >
                                                            {flow.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('notification-studio.flows.edit', flow.id)}>
                                                                        <Pencil className="w-4 h-4 mr-2" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDuplicate(flow)}>
                                                                    <Copy className="w-4 h-4 mr-2" />
                                                                    Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleToggleStatus(flow)}>
                                                                    <Power className="w-4 h-4 mr-2" />
                                                                    {flow.is_active ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(flow)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {flows.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {flows.data.length} of {flows.total} flows
                                </p>
                                <div className="flex gap-1">
                                    {flows.links?.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

