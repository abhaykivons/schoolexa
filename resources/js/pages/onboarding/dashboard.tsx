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
    UserPlus,
    Users,
    Clock,
    CheckCircle,
    ArrowRight,
    Inbox,
    FileText,
    Settings,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Onboarding', href: '/onboarding' },
];

interface RecentApplicant {
    id: number;
    full_legal_name: string;
    email_address: string;
    position_title: string;
    created_at: string;
    enrollment_date: string | null;
    is_enrolled: boolean;
}

interface Stats {
    total_applicants: number;
    pending_count: number;
    enrolled_count: number;
}

interface Props {
    stats: Stats;
    recentApplicants: RecentApplicant[];
}

export default function OnboardingDashboard({ stats, recentApplicants }: Props) {
    const { auth, flash } = usePage().props as { auth: any; flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Onboarding" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl p-8 mb-6">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <UserPlus className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">Onboarding</h1>
                                    </div>
                                    <p className="text-violet-100 text-lg max-w-2xl">
                                        Review staff applications, approve enrollments, and manage new employee onboarding.
                                    </p>
                                </div>
                                <div className="hidden lg:flex gap-3">
                                    <Button asChild variant="secondary" className="gap-2">
                                        <Link href="/staff-enrollment-settings/create">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                    </Button>
                                    <Button asChild className="gap-2 bg-white text-violet-700 hover:bg-violet-50">
                                        <Link href="/new-applicant-staff">
                                            <FileText className="w-4 h-4" />
                                            New Applicants
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-violet-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Applicants</p>
                                    <p className="text-2xl font-bold">{stats.total_applicants}</p>
                                </div>
                                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                                    <Users className="w-6 h-6 text-violet-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending_count}</p>
                                </div>
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Enrolled</p>
                                    <p className="text-2xl font-bold">{stats.enrolled_count}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.pending_count} Pending</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">New Applicants</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Review and approve staff applications that are awaiting enrollment.
                            </p>
                            <Button asChild className="gap-2">
                                <Link href="/new-applicant-staff">
                                    View Applicants
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </Card>
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl text-white">
                                    <Settings className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Employee Settings</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Configure enrollment form and approval workflow settings.
                            </p>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href="/staff-enrollment-settings/create">Settings</Link>
                            </Button>
                        </Card>
                    </div>

                    {/* Recent Applicants */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Applicants</CardTitle>
                                    <CardDescription>Latest staff applications</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/new-applicant-staff">View all</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentApplicants.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No applicants yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Applications will appear here when candidates apply.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentApplicants.map((applicant) => (
                                        <Link
                                            key={applicant.id}
                                            href="/new-applicant-staff"
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-2 rounded-lg bg-muted">
                                                <UserPlus className="w-5 h-5 text-violet-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{applicant.full_legal_name}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {applicant.position_title} · {applicant.email_address}
                                                </p>
                                            </div>
                                            <Badge variant={applicant.is_enrolled ? 'default' : 'secondary'}>
                                                {applicant.is_enrolled ? 'Enrolled' : 'Pending'}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">{applicant.created_at}</span>
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
