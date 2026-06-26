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
];

interface Tenant {
    id: string;
    name: string;
}

interface Props {
    tenant: Tenant;
}

export default function TenantEdit({ tenant }: Props) {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/developer/tenants/${tenant.id}`);
    };

    return (
        <>
            <Head title={`Edit Tenant: ${tenant.name}`} />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/developer/tenants/${tenant.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Tenant</h1>
                        <p className="text-muted-foreground mt-1">Update tenant information</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Information</CardTitle>
                        <CardDescription>
                            Update the tenant details
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
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Tenant'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/developer/tenants/${tenant.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
