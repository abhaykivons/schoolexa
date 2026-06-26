import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    AlertTriangle,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    Calendar
} from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Downtime Management',
        href: '/developer/downtime',
    },
];

interface Tenant {
    id: string;
    name: string;
}

interface Downtime {
    id: number;
    tenant_id: string | null;
    description: string;
    status: 'scheduled' | 'ongoing' | 'resolved';
    started_at: string;
    resolved_at: string | null;
    tenant?: Tenant;
}

interface PaginatedDowntimes {
    data: Downtime[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    downtimes: PaginatedDowntimes;
    filters: {
        search?: string;
        status?: string;
    };
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    ongoing: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function DowntimeIndex({ downtimes, filters }: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/developer/downtime', { search, status: filters.status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/developer/downtime', { search, status: status === 'all' ? undefined : status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Downtime Management" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Downtime Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Track and manage system downtime incidents
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/developer/downtime/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Downtime
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by description..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select 
                                value={filters.status || 'all'} 
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Downtime Incidents</CardTitle>
                        <CardDescription>
                            {downtimes.total} total incident{downtimes.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Started At</TableHead>
                                        <TableHead>Resolved At</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {downtimes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No downtime incidents found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        downtimes.data.map((downtime) => (
                                            <TableRow key={downtime.id}>
                                                <TableCell className="max-w-md">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-1" />
                                                        <span className="line-clamp-2">{downtime.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {downtime.tenant ? (
                                                        <span className="text-sm">{downtime.tenant.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">All Tenants</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[downtime.status]}>
                                                        {downtime.status.charAt(0).toUpperCase() + downtime.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        {formatDate(downtime.started_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {downtime.resolved_at ? (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            {formatDate(downtime.resolved_at)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Not resolved</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/developer/downtime/${downtime.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {downtimes.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-500">
                                    Showing {downtimes.data.length} of {downtimes.total} incidents
                                </p>
                                <div className="flex gap-2">
                                    {downtimes.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
