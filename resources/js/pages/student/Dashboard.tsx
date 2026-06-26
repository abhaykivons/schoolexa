import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Calendar, 
    FileText, 
    CheckCircle,
    Clock
} from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student Portal',
        href: '/student',
    },
    {
        title: 'Dashboard',
        href: '/student/dashboard',
    },
];

interface Stats {
    attendance_percentage: number;
    upcoming_exams: number;
    assignments_due: number;
}

interface Props {
    stats: Stats;
}

export default function StudentDashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome to your student portal
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.attendance_percentage}%</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcoming_exams}</div>
                            <p className="text-xs text-muted-foreground">
                                Scheduled exams
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.assignments_due}</div>
                            <p className="text-xs text-muted-foreground">
                                Pending assignments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-5 w-5" />
                                Timetable
                            </CardTitle>
                            <CardDescription>
                                View your class schedule
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle className="h-5 w-5" />
                                Attendance
                            </CardTitle>
                            <CardDescription>
                                View your attendance records
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5" />
                                Reports
                            </CardTitle>
                            <CardDescription>
                                View your academic reports
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-5 w-5" />
                                Exam Schedule
                            </CardTitle>
                            <CardDescription>
                                View upcoming exams
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
