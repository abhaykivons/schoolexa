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
    GraduationCap,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    FileCheck,
    Inbox,
    UserPlus,
    List,
    Settings,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Enrolments', href: '/enrolments' },
];

interface RecentStudent {
    id: number;
    name: string;
    grade: string;
    parent_name: string;
    overall_status: string;
    progress_percentage: number;
    updated_at: string;
}

interface Stats {
    total_students: number;
    pending_count: number;
    in_progress_count: number;
    ready_to_enroll_count: number;
    enrolled_count: number;
    not_started_count: number;
}

interface Props {
    stats: Stats;
    recentStudents: RecentStudent[];
}

const statusColors: Record<string, string> = {
    pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    has_rejections: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    ready_to_enroll: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    enrolled: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

const statusLabels: Record<string, string> = {
    pending_approval: 'Pending Approval',
    in_progress: 'In Progress',
    has_rejections: 'Has Rejections',
    ready_to_enroll: 'Ready to Enroll',
    enrolled: 'Enrolled',
    not_started: 'Not Started',
};

export default function EnrolmentsDashboard({ stats, recentStudents }: Props) {
    const { auth, flash } = usePage().props as { auth: any; flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrolments" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 mb-6">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <GraduationCap className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">Enrolments</h1>
                                    </div>
                                    <p className="text-emerald-100 text-lg max-w-2xl">
                                        Manage student admissions, review forms, and track enrollment progress in one place.
                                    </p>
                                </div>
                                <div className="hidden lg:flex gap-3">
                                    <Button asChild variant="secondary" className="gap-2">
                                        <Link href="/admission-settings">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                    </Button>
                                    <Button asChild className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50">
                                        <Link href="/school-admission">
                                            <List className="w-4 h-4" />
                                            View List
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-emerald-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total_students}</p>
                                </div>
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                    <Users className="w-6 h-6 text-emerald-600" />
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
                        <Card className="p-4 border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold">{stats.in_progress_count}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <FileCheck className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ready to Enroll</p>
                                    <p className="text-2xl font-bold">{stats.ready_to_enroll_count}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-teal-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Enrolled</p>
                                    <p className="text-2xl font-bold">{stats.enrolled_count}</p>
                                </div>
                                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                                    <GraduationCap className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-gray-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Not Started</p>
                                    <p className="text-2xl font-bold">{stats.not_started_count}</p>
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Inbox className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                                    <List className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.total_students} Total</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Admission List</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                View all students, filter by status, and manage admission forms.
                            </p>
                            <Button asChild className="gap-2">
                                <Link href="/school-admission">
                                    View List
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </Card>
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl text-white">
                                    <Settings className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Admission Settings</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Configure form templates, grades, and admission workflow.
                            </p>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href="/admission-settings">Settings</Link>
                            </Button>
                        </Card>
                    </div>

                    {/* Recent Students */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest students by updated date</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/school-admission">View all</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentStudents.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No students yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Admission forms will appear here when parents submit.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentStudents.map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/school-admission/${student.id}`}
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-2 rounded-lg bg-muted">
                                                <UserPlus className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{student.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {student.grade} · {student.parent_name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{student.progress_percentage}%</span>
                                                <Badge className={statusColors[student.overall_status]}>
                                                    {statusLabels[student.overall_status] ?? student.overall_status}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">{student.updated_at}</span>
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
