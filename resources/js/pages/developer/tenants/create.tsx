import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Tenants',
        href: '/developer/tenants',
    },
    {
        title: 'Create Tenant',
        href: '/developer/tenants/create',
    },
];

export default function TenantCreate() {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        domain: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/developer/tenants');
    };

    return (
        <>
            <Head title="Create Tenant" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/developer/tenants">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Tenant</h1>
                        <p className="text-muted-foreground mt-1">Add a new tenant school</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new tenant
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tenant Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., ABC School"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain</Label>
                                <Input
                                    id="domain"
                                    value={data.domain}
                                    onChange={(e) => setData('domain', e.target.value)}
                                    placeholder="e.g., abc.schoolexa.com"
                                    required
                                />
                                <InputError message={errors.domain} />
                                <p className="text-sm text-muted-foreground">
                                    The domain where this tenant will be accessible
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Tenant'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/developer/tenants">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
