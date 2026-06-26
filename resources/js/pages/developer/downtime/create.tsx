import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
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
    {
        title: 'Create Downtime',
        href: '/developer/downtime/create',
    },
];

interface Tenant {
    id: string;
    name: string;
}

interface Props {
    tenants?: Tenant[];
}

export default function DowntimeCreate({ tenants = [] }: Props) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        description: '',
        started_at: '',
        tenant_id: '',
        status: 'scheduled' as 'scheduled' | 'ongoing' | 'resolved',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/developer/downtime');
    };

    return (
        <>
            <Head title="Create Downtime Incident" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/developer/downtime">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Downtime Incident</h1>
                        <p className="text-muted-foreground mt-1">Record a new system downtime incident</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Downtime Information
                        </CardTitle>
                        <CardDescription>
                            Enter the details for the downtime incident
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the downtime incident..."
                                    rows={4}
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value: 'scheduled' | 'ongoing' | 'resolved') => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="started_at">Started At *</Label>
                                    <Input
                                        id="started_at"
                                        type="datetime-local"
                                        value={data.started_at}
                                        onChange={(e) => setData('started_at', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.started_at} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tenant_id">Affected Tenant (Optional)</Label>
                                <Select
                                    value={data.tenant_id}
                                    onValueChange={(value) => setData('tenant_id', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tenant (leave empty for all tenants)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tenants</SelectItem>
                                        {tenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                {tenant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.tenant_id} />
                                <p className="text-sm text-muted-foreground">
                                    Leave empty if the downtime affects all tenants
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Downtime'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/developer/downtime">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
