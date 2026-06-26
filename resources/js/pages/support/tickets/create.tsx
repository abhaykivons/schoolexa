import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Header from '@/components/header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support Tickets',
        href: '/support/tickets',
    },
    {
        title: 'Raise Ticket',
        href: '/support/tickets/create',
    },
];

export default function CreateSupportTicket() {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        description: '',
        ticket_type: 'question' as 'bug' | 'feature_request' | 'error_report' | 'question' | 'other',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        expected_resolution_date: '',
        attachments: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/support/tickets', {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Raise Support Ticket" />
            <div className="flex flex-col min-h-screen">
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0 space-y-4">
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please fix the errors below before submitting.
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Details</CardTitle>
                                <CardDescription>
                                    Provide details about your issue or request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Ticket Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="ticket_type">Ticket Type *</Label>
                                    <Select
                                        value={data.ticket_type}
                                        onValueChange={(value: any) => setData('ticket_type', value)}
                                    >
                                        <SelectTrigger id="ticket_type">
                                            <SelectValue placeholder="Select ticket type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug">🐛 Bug Report</SelectItem>
                                            <SelectItem value="feature_request">💡 Feature Request</SelectItem>
                                            <SelectItem value="error_report">⚠️ Error Report</SelectItem>
                                            <SelectItem value="question">❓ Question</SelectItem>
                                            <SelectItem value="other">📄 Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.ticket_type && (
                                        <p className="text-sm text-red-500">{errors.ticket_type}</p>
                                    )}
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Brief description of your issue"
                                        className={errors.subject ? 'border-red-500' : ''}
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-red-500">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Provide detailed information about your issue, including steps to reproduce (for bugs), expected behavior, and any relevant context..."
                                        rows={10}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        For bug reports, please include: steps to reproduce, expected behavior, actual behavior, and screenshots if possible.
                                    </p>
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value: any) => setData('priority', value)}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">🟢 Low - General inquiry or minor issue</SelectItem>
                                            <SelectItem value="medium">🟡 Medium - Standard request or moderate issue</SelectItem>
                                            <SelectItem value="high">🟠 High - Important feature or significant issue</SelectItem>
                                            <SelectItem value="urgent">🔴 Urgent - Critical issue affecting operations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-sm text-red-500">{errors.priority}</p>
                                    )}
                                </div>

                                {/* Expected Resolution Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="expected_resolution_date">Expected Resolution Date (Optional)</Label>
                                    <Input
                                        id="expected_resolution_date"
                                        type="date"
                                        value={data.expected_resolution_date}
                                        onChange={(e) => setData('expected_resolution_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        When would you like this issue to be resolved? (Optional)
                                    </p>
                                    {errors.expected_resolution_date && (
                                        <p className="text-sm text-red-500">{errors.expected_resolution_date}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/support/tickets">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Ticket
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
