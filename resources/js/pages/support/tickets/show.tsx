import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Header from '@/components/header';
import { 
    ArrowLeft, 
    Send, 
    Bug, 
    Lightbulb, 
    AlertTriangle, 
    HelpCircle, 
    FileText,
    User,
    Calendar,
    MessageSquare
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support Tickets',
        href: '/support/tickets',
    },
    {
        title: 'Ticket Details',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reply {
    id: number;
    message: string;
    is_internal: boolean;
    created_at: string;
    user: User;
}

interface SupportTicket {
    id: number;
    subject: string;
    description: string;
    ticket_type: 'bug' | 'feature_request' | 'error_report' | 'question' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expected_resolution_date: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    replies: Reply[];
}

interface Props {
    ticket: SupportTicket;
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

export default function ShowSupportTicket({ ticket }: Props) {
    const { auth } = usePage().props;
    const TypeIcon = typeIcons[ticket.ticket_type] || FileText;

    const { data, setData, post, processing, errors } = useForm({
        message: '',
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/support/tickets/${ticket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                setData('message', '');
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket: ${ticket.subject}`} />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />                
                    <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0 space-y-4">
                        {/* Ticket Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <TypeIcon className="h-6 w-6 text-blue-500" />
                                            <h1 className="text-3xl font-bold">{ticket.subject}</h1>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className={statusColors[ticket.status]}>
                                                {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                            <Badge className={priorityColors[ticket.priority]}>
                                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                                            </Badge>
                                            <Badge variant="outline">
                                                {typeLabels[ticket.ticket_type]}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Created By</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span>{ticket.user.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Created At</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{formatDate(ticket.created_at)}</span>
                                        </div>
                                    </div>
                                    {ticket.expected_resolution_date && (
                                        <div>
                                            <Label className="text-muted-foreground">Expected Resolution</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>{new Date(ticket.expected_resolution_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Replies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Replies ({ticket.replies.filter(r => !r.is_internal).length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {ticket.replies.filter(r => !r.is_internal).length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No replies yet. Be the first to reply!
                                    </p>
                                ) : (
                                    ticket.replies
                                        .filter(r => !r.is_internal)
                                        .map((reply) => (
                                            <div key={reply.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{reply.user.name}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(reply.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {reply.message}
                                                </p>
                                            </div>
                                        ))
                                )}

                                {/* Reply Form */}
                                {ticket.status !== 'closed' && (
                                    <form onSubmit={handleReply} className="space-y-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Add Reply</Label>
                                            <Textarea
                                                id="message"
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Type your reply here..."
                                                rows={4}
                                                className={errors.message ? 'border-red-500' : ''}
                                            />
                                            {errors.message && (
                                                <p className="text-sm text-red-500">{errors.message}</p>
                                            )}
                                        </div>
                                        <Button type="submit" disabled={processing || !data.message.trim()}>
                                            {processing ? (
                                                <>Sending...</>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Reply
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
            </div>
        </AppLayout>
    );
}
