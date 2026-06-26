import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, 
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Globe
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
    domains?: Domain[];
}

interface PaginatedTenants {
    data: Tenant[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    tenants: PaginatedTenants;
    filters: {
        search?: string;
    };
}

export default function TenantsIndex({ tenants, filters }: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/developer/tenants', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (tenant: Tenant) => {
        if (confirm(`Are you sure you want to delete tenant "${tenant.name}"? This action cannot be undone.`)) {
            router.delete(`/developer/tenants/${tenant.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by Inertia
                },
            });
        }
    };

    return (
        <>
            <Head title="Manage Tenants" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Tenants</h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage all tenant schools
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/developer/tenants/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tenant
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tenants</CardTitle>
                        <CardDescription>
                            A list of all tenant schools in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search tenants by name or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">Search</Button>
                                {search && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/developer/tenants', {}, { preserveState: true });
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Domains</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.data.length > 0 ? (
                                        tenants.data.map((tenant) => (
                                            <TableRow key={tenant.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        {tenant.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {tenant.id}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {tenant.domains && tenant.domains.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {tenant.domains.map((domain) => (
                                                                <Badge key={domain.id} variant="outline" className="gap-1">
                                                                    <Globe className="h-3 w-3" />
                                                                    {domain.domain}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No domains</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(tenant.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/developer/tenants/${tenant.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/developer/tenants/${tenant.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(tenant)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No tenants found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {tenants.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {tenants.data.length} of {tenants.total} tenants
                                </p>
                                <div className="flex gap-1">
                                    {tenants.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
