import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft,
    Edit,
    Trash2,
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Building2
} from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { useState } from 'react';
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
    created_at: string;
    updated_at: string;
}

interface Props {
    downtime: Downtime;
    tenants?: Tenant[];
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    ongoing: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function DowntimeShow({ downtime, tenants = [] }: Props) {
    const { auth } = usePage().props;
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        description: downtime.description,
        started_at: downtime.started_at ? new Date(downtime.started_at).toISOString().slice(0, 16) : '',
        resolved_at: downtime.resolved_at ? new Date(downtime.resolved_at).toISOString().slice(0, 16) : '',
        tenant_id: downtime.tenant_id || '',
        status: downtime.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/developer/downtime/${downtime.id}`, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete this downtime incident? This action cannot be undone.`)) {
            router.delete(`/developer/downtime/${downtime.id}`, {
                onSuccess: () => {
                    router.visit('/developer/downtime');
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
        });
    };

    return (
        <>
            <Head title={`Downtime: ${downtime.description.substring(0, 50)}...`} />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/developer/downtime">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Downtime Incident</h1>
                            <p className="text-muted-foreground mt-1">View and manage downtime details</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Downtime Incident</CardTitle>
                            <CardDescription>
                                Update the downtime incident details
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
                                                <SelectValue />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resolved_at">Resolved At</Label>
                                        <Input
                                            id="resolved_at"
                                            type="datetime-local"
                                            value={data.resolved_at}
                                            onChange={(e) => setData('resolved_at', e.target.value)}
                                        />
                                        <InputError message={errors.resolved_at} />
                                        <p className="text-sm text-muted-foreground">
                                            Leave empty if not yet resolved
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tenant_id">Affected Tenant</Label>
                                        <Select
                                            value={data.tenant_id || 'all'}
                                            onValueChange={(value) => setData('tenant_id', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
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
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Downtime'}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setData({
                                                description: downtime.description,
                                                started_at: downtime.started_at ? new Date(downtime.started_at).toISOString().slice(0, 16) : '',
                                                resolved_at: downtime.resolved_at ? new Date(downtime.resolved_at).toISOString().slice(0, 16) : '',
                                                tenant_id: downtime.tenant_id || '',
                                                status: downtime.status,
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    Incident Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="mt-1">{downtime.description}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge className={statusColors[downtime.status]}>
                                            {downtime.status.charAt(0).toUpperCase() + downtime.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Started At
                                    </Label>
                                    <p className="mt-1">{formatDate(downtime.started_at)}</p>
                                </div>
                                {downtime.resolved_at && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Resolved At
                                        </Label>
                                        <p className="mt-1">{formatDate(downtime.resolved_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Affected Tenant
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {downtime.tenant ? (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Tenant Name</Label>
                                        <p className="mt-1 font-semibold">{downtime.tenant.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Tenant ID: {downtime.tenant.id}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <p className="text-muted-foreground">All Tenants</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
