import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/header';
import { 
    MessageSquare,
    Search,
    Plus,
    Eye,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Bug,
    Lightbulb,
    HelpCircle,
    FileText,
    AlertTriangle
} from "lucide-react";
import AppLayout from '@/layouts/app-layout';
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
        title: 'Support Tickets',
        href: '/support/tickets',
    },
];

interface SupportTicket {
    id: number;
    subject: string;
    description: string;
    ticket_type: 'bug' | 'feature_request' | 'error_report' | 'question' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expected_resolution_date: string | null;
    created_at: string;
    replies_count?: number;
}

interface PaginatedTickets {
    data: SupportTicket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    tickets: PaginatedTickets;
    filters: {
        search?: string;
        status?: string;
        ticket_type?: string;
        priority?: string;
    };
}

const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const typeIcons: Record<string, React.ComponentType<any>> = {
    bug: Bug,
    feature_request: Lightbulb,
    error_report: AlertTriangle,
    question: HelpCircle,
    other: FileText,
};

const typeLabels: Record<string, string> = {
    bug: 'Bug Report',
    feature_request: 'Feature Request',
    error_report: 'Error Report',
    question: 'Question',
    other: 'Other',
};

export default function SupportTicketsIndex({ tickets, filters }: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/support/tickets', { 
            search, 
            status: filters.status,
            ticket_type: filters.ticket_type,
            priority: filters.priority 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/support/tickets', { 
            search, 
            status: key === 'status' ? (value === 'all' ? undefined : value) : filters.status,
            ticket_type: key === 'ticket_type' ? (value === 'all' ? undefined : value) : filters.ticket_type,
            priority: key === 'priority' ? (value === 'all' ? undefined : value) : filters.priority,
        }, {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />
            
            <div className="flex flex-col min-h-screen">
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0 space-y-4">
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
                                            placeholder="Search by subject or description..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </form>
                                <Select 
                                    value={filters.status || 'all'} 
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select 
                                    value={filters.ticket_type || 'all'} 
                                    onValueChange={(value) => handleFilter('ticket_type', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="bug">Bug Report</SelectItem>
                                        <SelectItem value="feature_request">Feature Request</SelectItem>
                                        <SelectItem value="error_report">Error Report</SelectItem>
                                        <SelectItem value="question">Question</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select 
                                    value={filters.priority || 'all'} 
                                    onValueChange={(value) => handleFilter('priority', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>My Tickets</CardTitle>
                                    <CardDescription>
                                        {tickets.total} total ticket{tickets.total !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/support/tickets/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Raise Ticket
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Expected Resolution</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    No tickets found. <Link href="/support/tickets/create" className="text-primary hover:underline">Raise a ticket</Link> to get started.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tickets.data.map((ticket) => {
                                                const TypeIcon = typeIcons[ticket.ticket_type] || FileText;
                                                return (
                                                    <TableRow key={ticket.id}>
                                                        <TableCell className="max-w-md">
                                                            <div className="flex items-start gap-2">
                                                                <TypeIcon className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                                                <div>
                                                                    <span className="font-medium">{ticket.subject}</span>
                                                                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                                        {ticket.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {typeLabels[ticket.ticket_type]}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={statusColors[ticket.status]}>
                                                                {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={priorityColors[ticket.priority]}>
                                                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {ticket.expected_resolution_date ? (
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(ticket.expected_resolution_date).toLocaleDateString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not set</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(ticket.created_at)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={`/support/tickets/${ticket.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {tickets.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-gray-500">
                                        Showing {tickets.data.length} of {tickets.total} tickets
                                    </p>
                                    <div className="flex gap-2">
                                        {tickets.links.map((link, index) => (
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
            </div>
        </AppLayout>
    );
}
