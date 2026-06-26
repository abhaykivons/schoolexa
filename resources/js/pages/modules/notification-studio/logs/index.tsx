'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import {
    Search,
    ArrowLeft,
    FileText,
    Filter,
    X,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    Eye,
    RefreshCw,
    Download,
    Calendar,
    Mail,
    User,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notification Studio', href: '/notification-studio' },
    { title: 'Notification Logs', href: '/notification-studio/logs' },
];

interface NotificationLog {
    id: number;
    trigger_event: string;
    recipient_type: string;
    recipient_email: string;
    recipient_name: string | null;
    subject: string | null;
    body: string | null;
    status: 'pending' | 'sent' | 'failed' | 'queued';
    error_message: string | null;
    email_sent: boolean;
    in_app_sent: boolean;
    sms_sent: boolean;
    scheduled_at: string | null;
    sent_at: string | null;
    variables: Record<string, any> | null;
    created_at: string;
    notification_flow?: {
        id: number;
        name: string;
    };
    email_template?: {
        id: number;
        name: string;
    };
}

interface PageProps {
    logs: {
        data: NotificationLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: {
        total: number;
        sent: number;
        failed: number;
        pending: number;
    };
    triggerEvents: Record<string, { label: string; category: string; }>;
    statusLabels: Record<string, string>;
    filters: {
        status?: string;
        event?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    queued: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const statusIcons: Record<string, any> = {
    pending: Clock,
    sent: CheckCircle,
    failed: XCircle,
    queued: Send,
};

export default function NotificationLogsIndex() {
    const { logs, stats, triggerEvents, statusLabels, filters, auth, flash } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || 'all');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
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
            if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
            if (selectedEvent && selectedEvent !== 'all') params.event = selectedEvent;
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;

            router.get(route('notification-studio.logs.index'), params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, selectedStatus, selectedEvent, fromDate, toDate]);

    const handleRetry = (log: NotificationLog) => {
        router.post(route('notification-studio.logs.retry', log.id), {}, {
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedEvent('all');
        setFromDate('');
        setToDate('');
        router.get(route('notification-studio.logs.index'));
    };

    const hasActiveFilters = search || 
        (selectedStatus && selectedStatus !== 'all') || 
        (selectedEvent && selectedEvent !== 'all') ||
        fromDate || toDate;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Logs" />
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
                                    title="Notification Logs"
                                    description="Track all sent notifications and their status"
                                />
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="gap-2"
                            >
                                <a href={route('notification-studio.logs.export', filters)}>
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </a>
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Sent</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-200" />
                                </div>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Failed</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-200" />
                                </div>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-yellow-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-200" />
                                </div>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card className="p-4 bg-gray-50 dark:bg-neutral-800 border-0">
                            <div className="flex flex-col lg:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search by email, name, or subject..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 bg-white dark:bg-neutral-900"
                                    />
                                </div>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full lg:w-[140px] bg-white dark:bg-neutral-900">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {Object.entries(statusLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                    <SelectTrigger className="w-full lg:w-[180px] bg-white dark:bg-neutral-900">
                                        <SelectValue placeholder="All Events" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Events</SelectItem>
                                        {Object.entries(triggerEvents).map(([key, info]) => (
                                            <SelectItem key={key} value={key}>{info.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full lg:w-[150px] bg-white dark:bg-neutral-900"
                                        placeholder="From"
                                    />
                                    <Input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full lg:w-[150px] bg-white dark:bg-neutral-900"
                                        placeholder="To"
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="icon" onClick={clearFilters}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Logs Table */}
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                                        <TableHead className="w-[180px]">Date</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                                    <FileText className="w-10 h-10 opacity-50" />
                                                    <p>No notification logs found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => {
                                            const StatusIcon = statusIcons[log.status];
                                            const eventInfo = triggerEvents[log.trigger_event];

                                            return (
                                                <TableRow key={log.id} className="group">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {format(new Date(log.created_at), 'MMM d, yyyy')}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {format(new Date(log.created_at), 'h:mm a')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {eventInfo?.label || log.trigger_event}
                                                        </span>
                                                        {log.notification_flow && (
                                                            <p className="text-xs text-gray-500">
                                                                via {log.notification_flow.name}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {log.recipient_name || 'Unknown'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {log.recipient_email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm truncate max-w-[200px]">
                                                            {log.subject || '-'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${statusColors[log.status]} font-normal gap-1`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusLabels[log.status]}
                                                        </Badge>
                                                        {log.error_message && (
                                                            <p className="text-xs text-red-500 mt-1 truncate max-w-[150px]">
                                                                {log.error_message}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setSelectedLog(log)}
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            {log.status === 'failed' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRetry(log)}
                                                                    title="Retry"
                                                                >
                                                                    <RefreshCw className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {logs.data.length} of {logs.total} logs
                                </p>
                                <div className="flex gap-1">
                                    {logs.links?.map((link: any, index: number) => (
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

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Notification Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg ${
                                selectedLog.status === 'sent' ? 'bg-green-50 border border-green-200' :
                                selectedLog.status === 'failed' ? 'bg-red-50 border border-red-200' :
                                'bg-yellow-50 border border-yellow-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {selectedLog.status === 'sent' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {selectedLog.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                                        {selectedLog.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                                        <span className="font-medium capitalize">{selectedLog.status}</span>
                                    </div>
                                    {selectedLog.sent_at && (
                                        <span className="text-sm text-gray-500">
                                            Sent: {format(new Date(selectedLog.sent_at), 'MMM d, yyyy h:mm a')}
                                        </span>
                                    )}
                                </div>
                                {selectedLog.error_message && (
                                    <p className="text-sm text-red-600 mt-2">{selectedLog.error_message}</p>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Event</p>
                                    <p className="font-medium">
                                        {triggerEvents[selectedLog.trigger_event]?.label || selectedLog.trigger_event}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedLog.created_at), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Recipient</p>
                                    <p className="font-medium">{selectedLog.recipient_name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{selectedLog.recipient_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Recipient Type</p>
                                    <p className="font-medium capitalize">{selectedLog.recipient_type}</p>
                                </div>
                            </div>

                            {/* Email Content */}
                            {selectedLog.subject && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Subject</p>
                                    <p className="font-medium">{selectedLog.subject}</p>
                                </div>
                            )}

                            {selectedLog.body && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Email Content</p>
                                    <div
                                        className="p-4 bg-gray-50 rounded-lg border prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                                    />
                                </div>
                            )}

                            {/* Variables */}
                            {selectedLog.variables && Object.keys(selectedLog.variables).length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Variables Used</p>
                                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs overflow-auto">
                                        <pre>{JSON.stringify(selectedLog.variables, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedLog.status === 'failed' && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => {
                                            handleRetry(selectedLog);
                                            setSelectedLog(null);
                                        }}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Retry Notification
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

