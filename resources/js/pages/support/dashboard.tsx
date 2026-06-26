'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';

import {
    MessageSquare,
    Plus,
    ArrowRight,
    Ticket,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Bug,
    Lightbulb,
    HelpCircle,
    FileText,
    AlertTriangle,
    Inbox,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support',
        href: '/support',
    },
];

interface SupportTicketSummary {
    id: number;
    subject: string;
    description: string;
    ticket_type: 'bug' | 'feature_request' | 'error_report' | 'question' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
    replies_count: number;
}

interface Stats {
    total_tickets: number;
    open_tickets: number;
    in_progress_tickets: number;
    resolved_tickets: number;
    closed_tickets: number;
}

interface Props {
    stats: Stats;
    recentTickets: SupportTicketSummary[];
}

const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

export default function SupportDashboard({ stats, recentTickets }: Props) {
    const { auth, flash } = usePage().props as { auth: any; flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-8 mb-6">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <MessageSquare className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">Support</h1>
                                    </div>
                                    <p className="text-sky-100 text-lg max-w-2xl">
                                        Get help, report issues, or request features. View your tickets and track their status in one place.
                                    </p>
                                </div>
                                <div className="hidden lg:flex gap-3">
                                    <Button asChild variant="secondary" className="gap-2">
                                        <Link href="/support/tickets">
                                            <Inbox className="w-4 h-4" />
                                            My Tickets
                                        </Link>
                                    </Button>
                                    <Button asChild className="gap-2 bg-white text-blue-700 hover:bg-sky-50">
                                        <Link href="/support/tickets/create">
                                            <Plus className="w-4 h-4" />
                                            Raise Ticket
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-sky-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                                    <p className="text-2xl font-bold">{stats.total_tickets}</p>
                                </div>
                                <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                                    <Ticket className="w-6 h-6 text-sky-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Open</p>
                                    <p className="text-2xl font-bold">{stats.open_tickets}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold">{stats.in_progress_tickets}</p>
                                </div>
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Resolved</p>
                                    <p className="text-2xl font-bold">{stats.resolved_tickets}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-gray-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Closed</p>
                                    <p className="text-2xl font-bold">{stats.closed_tickets}</p>
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <XCircle className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl text-white">
                                    <Inbox className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.total_tickets} Total</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">My Tickets</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                View all your support tickets, filter by status or type, and continue conversations.
                            </p>
                            <Button asChild className="gap-2 w-full sm:w-auto">
                                <Link href="/support/tickets">
                                    View All Tickets
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
                                    <Plus className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Raise a Ticket</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Report a bug, request a feature, ask a question, or get help from our support team.
                            </p>
                            <Button asChild variant="default" className="gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                <Link href="/support/tickets/create">
                                    <Plus className="w-4 h-4" />
                                    Raise Ticket
                                </Link>
                            </Button>
                        </Card>
                    </div>

                    {/* Recent Tickets */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Tickets</CardTitle>
                                    <CardDescription>
                                        Your latest support tickets and their status
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/support/tickets">View all</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentTickets.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-2">No tickets yet</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Raise a ticket when you need help or want to report an issue.
                                    </p>
                                    <Button asChild>
                                        <Link href="/support/tickets/create">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Raise Ticket
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentTickets.map((ticket) => {
                                        const TypeIcon = typeIcons[ticket.ticket_type] || FileText;
                                        return (
                                            <Link
                                                key={ticket.id}
                                                href={`/support/tickets/${ticket.id}`}
                                                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <TypeIcon className="w-5 h-5 text-sky-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{ticket.subject}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {typeLabels[ticket.ticket_type]} · {ticket.replies_count} repl{ticket.replies_count !== 1 ? 'ies' : 'y'}
                                                    </p>
                                                </div>
                                                <Badge className={statusColors[ticket.status]}>
                                                    {ticket.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {formatDate(ticket.updated_at)}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
