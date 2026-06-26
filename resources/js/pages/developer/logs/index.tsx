import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    FileText,
    AlertCircle,
    AlertTriangle,
    Info,
    XCircle,
    Trash2,
    Search
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Error Logs',
        href: '/developer/logs',
    },
];

interface LogEntry {
    id: number;
    timestamp: string;
    level: string;
    content: string;
    tenant: string | null;
}

interface Props {
    logs: LogEntry[];
    filters: {
        level?: string;
        tenant?: string;
        date?: string;
    };
}

const levelColors: Record<string, string> = {
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    alert: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    emergency: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    debug: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

const levelIcons: Record<string, React.ComponentType<any>> = {
    error: XCircle,
    critical: AlertCircle,
    alert: AlertTriangle,
    emergency: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    debug: FileText,
};

export default function ErrorLogsIndex({ logs, filters }: Props) {
    const { auth } = usePage().props;

    const handleFilter = (key: string, value: string) => {
        router.get('/developer/logs', {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
            router.post('/developer/logs/clear', {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <>
            <Head title="Error Logs" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Error Logs</h1>
                        <p className="text-muted-foreground mt-2">
                            View and analyze application error logs
                        </p>
                    </div>
                    <Button variant="destructive" onClick={handleClear}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Logs
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select 
                                value={filters.level || 'all'} 
                                onValueChange={(value) => handleFilter('level', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="alert">Alert</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="debug">Debug</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select 
                                value={filters.tenant || 'all'} 
                                onValueChange={(value) => handleFilter('tenant', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tenants</SelectItem>
                                    {/* Tenant options would be populated dynamically */}
                                </SelectContent>
                            </Select>
                            <Select 
                                value={filters.date || 'today'} 
                                onValueChange={(value) => handleFilter('date', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Error Logs</CardTitle>
                        <CardDescription>
                            {logs.length} log entr{logs.length !== 1 ? 'ies' : 'y'} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {logs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>No log entries found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log) => {
                                    const LevelIcon = levelIcons[log.level] || FileText;
                                    return (
                                        <div 
                                            key={log.id} 
                                            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <LevelIcon className={`h-5 w-5 mt-0.5 ${
                                                        log.level === 'error' || log.level === 'critical' || log.level === 'emergency' 
                                                            ? 'text-red-500' 
                                                            : log.level === 'warning' || log.level === 'alert'
                                                            ? 'text-orange-500'
                                                            : 'text-blue-500'
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={levelColors[log.level] || levelColors.info}>
                                                                {log.level.toUpperCase()}
                                                            </Badge>
                                                            {log.tenant && (
                                                                <Badge variant="outline">
                                                                    Tenant: {log.tenant}
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(log.timestamp)}
                                                            </span>
                                                        </div>
                                                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-mono">
                                                            {log.content}
                                                        </pre>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => router.get(`/developer/logs/${log.id}`)}
                                                >
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
