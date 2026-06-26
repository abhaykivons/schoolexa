import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    Send, 
    FileText,
    User,
    Calendar,
    MessageSquare,
    Building2,
    Save,
    Lock
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Support Tickets',
        href: '/developer/support',
    },
    {
        title: 'Ticket Details',
        href: '#',
    },
];

interface Tenant {
    id: string;
    name: string;
}

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
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
    tenant?: Tenant;
    user?: User;
    replies: Reply[];
}

interface Props {
    ticket: SupportTicket;
    flash?: {
        success?: string;
        error?: string;
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

export default function DeveloperSupportShow({ ticket, flash }: Props) {
    const { auth } = usePage().props;
    const [showInternalNotes, setShowInternalNotes] = useState(false);

    const updateForm = useForm({
        status: ticket.status,
        priority: ticket.priority,
        response: '',
    });

    const noteForm = useForm({
        note: '',
    });

    // Update form when ticket changes
    useEffect(() => {
        updateForm.setData({
            status: ticket.status,
            priority: ticket.priority,
            response: '',
        });
    }, [ticket.id, ticket.status, ticket.priority]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data - only include response if it has content
        const updateData: any = {
            status: updateForm.data.status,
            priority: updateForm.data.priority,
        };
        
        if (updateForm.data.response && updateForm.data.response.trim()) {
            updateData.response = updateForm.data.response.trim();
        }
        
        router.put(`/developer/support/${ticket.id}`, updateData, {
            preserveScroll: true,
            onSuccess: () => {
                updateForm.setData('response', '');
                toast.success('Ticket updated successfully');
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                toast.error('Failed to update ticket');
            }
        });
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.post(`/developer/support/${ticket.id}/note`, {
            preserveScroll: true,
            onSuccess: () => {
                noteForm.setData('note', '');
                toast.success('Internal note added successfully');
            },
            onError: (errors) => {
                console.error('Note errors:', errors);
                toast.error('Failed to add note');
            }
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

    const publicReplies = ticket.replies.filter(r => !r.is_internal);
    const internalNotes = ticket.replies.filter(r => r.is_internal);

    return (
        <>
            <Head title={`Ticket: ${ticket.subject}`} />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/developer/support">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <h1 className="text-3xl font-bold">{ticket.subject}</h1>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={statusColors[ticket.status]}>
                                {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge className={priorityColors[ticket.priority]}>
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Ticket Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {ticket.tenant && (
                                <div>
                                    <Label className="text-muted-foreground">Tenant</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        <span>{ticket.tenant.name}</span>
                                    </div>
                                </div>
                            )}
                            {ticket.user && (
                                <div>
                                    <Label className="text-muted-foreground">Created By</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span>{ticket.user.name}</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <Label className="text-muted-foreground">Created At</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(ticket.created_at)}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Last Updated</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(ticket.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Update Ticket Status/Priority */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Ticket</CardTitle>
                        <CardDescription>Change status, priority, or add a response</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={updateForm.data.status}
                                        onValueChange={(value) => updateForm.setData('status', value as any)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {updateForm.errors.status && (
                                        <p className="text-sm text-red-500">{updateForm.errors.status}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={updateForm.data.priority}
                                        onValueChange={(value) => updateForm.setData('priority', value as any)}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {updateForm.errors.priority && (
                                        <p className="text-sm text-red-500">{updateForm.errors.priority}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="response">Add Response (Optional)</Label>
                                <Textarea
                                    id="response"
                                    value={updateForm.data.response}
                                    onChange={(e) => updateForm.setData('response', e.target.value)}
                                    placeholder="Type your response here..."
                                    rows={4}
                                    className={updateForm.errors.response ? 'border-red-500' : ''}
                                />
                                {updateForm.errors.response && (
                                    <p className="text-sm text-red-500">{updateForm.errors.response}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={updateForm.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {updateForm.processing ? 'Updating...' : 'Update Ticket'}
                            </Button>
                        </form>
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

                {/* Public Replies */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Replies ({publicReplies.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {publicReplies.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No replies yet.
                            </p>
                        ) : (
                            publicReplies.map((reply) => (
                                <div key={reply.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{reply.user?.name || 'Unknown User'}</span>
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
                    </CardContent>
                </Card>

                {/* Internal Notes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Internal Notes ({internalNotes.length})
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInternalNotes(!showInternalNotes)}
                            >
                                {showInternalNotes ? 'Hide' : 'Show'} Notes
                            </Button>
                        </div>
                        <CardDescription>Internal notes are only visible to developers</CardDescription>
                    </CardHeader>
                    {showInternalNotes && (
                        <CardContent className="space-y-4">
                            {internalNotes.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No internal notes yet.
                                </p>
                            ) : (
                                internalNotes.map((note) => (
                                    <div key={note.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{note.user?.name || 'Unknown User'}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(note.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {note.message}
                                        </p>
                                    </div>
                                ))
                            )}

                            {/* Add Internal Note Form */}
                            <form onSubmit={handleAddNote} className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="note">Add Internal Note</Label>
                                    <Textarea
                                        id="note"
                                        value={noteForm.data.note}
                                        onChange={(e) => noteForm.setData('note', e.target.value)}
                                        placeholder="Type your internal note here..."
                                        rows={4}
                                        className={noteForm.errors.note ? 'border-red-500' : ''}
                                    />
                                    {noteForm.errors.note && (
                                        <p className="text-sm text-red-500">{noteForm.errors.note}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={noteForm.processing || !noteForm.data.note.trim()}>
                                    {noteForm.processing ? (
                                        <>Adding...</>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Add Internal Note
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    )}
                </Card>
            </div>
        </>
    );
}
