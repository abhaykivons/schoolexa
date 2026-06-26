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
    Users,
    UserCheck,
    ArrowRight,
    List,
    Briefcase,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Employee', href: '/employee' },
];

interface RecentStaff {
    id: number;
    full_name: string;
    email: string;
    designation_name: string;
    department_name: string;
    created_at: string;
}

interface Stats {
    total_staff: number;
    active_count: number;
}

interface Props {
    stats: Stats;
    recentStaff: RecentStaff[];
}

export default function EmployeeDashboard({ stats, recentStaff }: Props) {
    const { auth, flash } = usePage().props as { auth: any; flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 rounded-2xl p-8 mb-6">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Users className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">Employee</h1>
                                    </div>
                                    <p className="text-indigo-100 text-lg max-w-2xl">
                                        View and manage your staff directory, designations, and departments.
                                    </p>
                                </div>
                                <div className="hidden lg:flex gap-3">
                                    <Button asChild className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50">
                                        <Link href="/staff">
                                            <List className="w-4 h-4" />
                                            Staff List
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-indigo-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Staff</p>
                                    <p className="text-2xl font-bold">{stats.total_staff}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold">{stats.active_count}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-1 gap-6 mb-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white">
                                    <List className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.total_staff} Staff</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Staff List</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                View all enrolled staff, manage roles, departments, and contact details.
                            </p>
                            <Button asChild className="gap-2">
                                <Link href="/staff">
                                    View Staff List
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </Card>
                    </div>

                    {/* Recent Staff */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Staff</CardTitle>
                                    <CardDescription>Latest enrolled employees</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/staff">View all</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentStaff.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No staff yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Staff will appear here after enrollment from Onboarding.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentStaff.map((staff) => (
                                        <Link
                                            key={staff.id}
                                            href={`/staff/${staff.id}`}
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-2 rounded-lg bg-muted">
                                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{staff.full_name}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {staff.designation_name} · {staff.department_name}
                                                </p>
                                            </div>
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">{staff.created_at}</span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
