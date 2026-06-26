import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    AlertTriangle, 
    FileText, 
    MessageSquare,
    ArrowRight,
    Activity
} from "lucide-react";
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Dashboard',
        href: '/developer/dashboard',
    },
];

interface Stats {
    total_tenants: number;
    active_tenants: number;
    ongoing_downtime: number;
    recent_errors: number;
}

interface RecentTenant {
    id: string;
    name: string;
    created_at: string;
    domains?: Array<{ domain: string }>;
}

interface RecentDowntime {
    id: number;
    description: string;
    status: string;
    started_at: string;
    tenant?: { name: string };
}

interface Props {
    stats: Stats;
    recentTenants: RecentTenant[];
    recentDowntime: RecentDowntime[];
}

export default function DeveloperDashboard({ stats, recentTenants, recentDowntime }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Developer Dashboard" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Developer Portal</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all schools, monitor errors, and provide support
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_tenants} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ongoing Downtime</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.ongoing_downtime}</div>
                            <p className="text-xs text-muted-foreground">
                                Active incidents
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.recent_errors}</div>
                            <p className="text-xs text-muted-foreground">
                                In log file
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Operational</div>
                            <p className="text-xs text-muted-foreground">
                                All systems normal
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <Link href="/developer/tenants">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Manage Schools
                                </CardTitle>
                                <CardDescription>
                                    View and manage all tenant schools
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <Link href="/developer/logs">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Error Logs
                                </CardTitle>
                                <CardDescription>
                                    View and analyze error logs
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <Link href="/developer/downtime">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Downtime
                                </CardTitle>
                                <CardDescription>
                                    Track and manage downtime incidents
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <Link href="/developer/support">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Support Tickets
                                </CardTitle>
                                <CardDescription>
                                    Manage support requests
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Schools</CardTitle>
                            <CardDescription>Recently added tenant schools</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTenants.length > 0 ? (
                                    recentTenants.map((tenant) => (
                                        <div key={tenant.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{tenant.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {tenant.domains?.[0]?.domain || 'No domain'}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/developer/tenants/${tenant.id}`}>
                                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent schools</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/developer/tenants">View All Schools</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Downtime</CardTitle>
                            <CardDescription>Latest downtime incidents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentDowntime.length > 0 ? (
                                    recentDowntime.map((downtime) => (
                                        <div key={downtime.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{downtime.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {downtime.tenant?.name || 'System-wide'} • {downtime.status}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/developer/downtime/${downtime.id}`}>
                                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent downtime</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/developer/downtime">View All Downtime</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
