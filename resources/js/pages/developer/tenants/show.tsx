import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, 
    Globe,
    ArrowLeft,
    Edit,
    Trash2
} from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';

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

interface Domain {
    id: string;
    domain: string;
}

interface Tenant {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    domains?: Domain[];
}

interface Props {
    tenant: Tenant;
}

export default function TenantShow({ tenant }: Props) {
    const { auth } = usePage().props;

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete tenant "${tenant.name}"? This action cannot be undone.`)) {
            router.delete(`/developer/tenants/${tenant.id}`, {
                onSuccess: () => {
                    router.visit('/developer/tenants');
                },
            });
        }
    };

    return (
        <>
            <Head title={`Tenant: ${tenant.name}`} />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/developer/tenants">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{tenant.name}</h1>
                            <p className="text-muted-foreground mt-1">Tenant Details</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/developer/tenants/${tenant.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Tenant Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-semibold">{tenant.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tenant ID</label>
                                <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                                    {tenant.id}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p>{new Date(tenant.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p>{new Date(tenant.updated_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Domains
                            </CardTitle>
                            <CardDescription>
                                Domains associated with this tenant
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tenant.domains && tenant.domains.length > 0 ? (
                                <div className="space-y-2">
                                    {tenant.domains.map((domain) => (
                                        <div key={domain.id} className="flex items-center justify-between p-2 border rounded">
                                            <Badge variant="outline" className="gap-1">
                                                <Globe className="h-3 w-3" />
                                                {domain.domain}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No domains configured</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
