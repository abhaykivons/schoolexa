'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';

import {
    Bell,
    Mail,
    GitBranch,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Plus,
    ArrowRight,
    Sparkles,
    Send,
    BarChart3,
    Settings,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notification Studio',
        href: '/notification-studio',
    },
];

interface Stats {
    total_templates: number;
    active_templates: number;
    total_flows: number;
    active_flows: number;
    notifications_sent: number;
    notifications_failed: number;
    notifications_today: number;
    notifications_this_week: number;
}

interface PageProps {
    stats: Stats;
    tab: string;
    categories: Record<string, string>;
    eventCategories: Record<string, string>;
    triggerEvents: Record<string, any>;
    recipientTypes: Record<string, string>;
}

export default function NotificationStudioIndex() {
    const { stats, tab, categories, eventCategories, triggerEvents, recipientTypes, auth, flash } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const [activeTab, setActiveTab] = useState(tab || 'overview');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'templates') {
            router.visit(route('notification-studio.templates.index'));
        } else if (value === 'flows') {
            router.visit(route('notification-studio.flows.index'));
        } else if (value === 'logs') {
            router.visit(route('notification-studio.logs.index'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Studio" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-6">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Bell className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">Notification Studio</h1>
                                    </div>
                                    <p className="text-violet-100 text-lg max-w-2xl">
                                        Design beautiful email templates and create automated notification flows to keep your community informed.
                                    </p>
                                </div>
                                <div className="hidden lg:flex gap-3">
                                    <Button asChild variant="secondary" className="gap-2">
                                        <Link href={route('notification-studio.settings.index')}>
                                            <Settings className="w-4 h-4" />
                                            Email Settings
                                        </Link>
                                    </Button>
                                    <Button asChild variant="secondary" className="gap-2">
                                        <Link href={route('notification-studio.templates.create')}>
                                            <Mail className="w-4 h-4" />
                                            New Template
                                        </Link>
                                    </Button>
                                    <Button asChild className="gap-2 bg-white text-purple-700 hover:bg-violet-50">
                                        <Link href={route('notification-studio.flows.create')}>
                                            <GitBranch className="w-4 h-4" />
                                            New Flow
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-violet-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Email Templates</p>
                                    <p className="text-2xl font-bold">{stats.total_templates}</p>
                                    <p className="text-xs text-green-600">{stats.active_templates} active</p>
                                </div>
                                <div className="p-3 bg-violet-100 rounded-xl">
                                    <Mail className="w-6 h-6 text-violet-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Notification Flows</p>
                                    <p className="text-2xl font-bold">{stats.total_flows}</p>
                                    <p className="text-xs text-green-600">{stats.active_flows} active</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <GitBranch className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Sent Today</p>
                                    <p className="text-2xl font-bold">{stats.notifications_today}</p>
                                    <p className="text-xs text-gray-500">{stats.notifications_this_week} this week</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <Send className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Success Rate</p>
                                    <p className="text-2xl font-bold">
                                        {stats.notifications_sent > 0 
                                            ? Math.round((stats.notifications_sent / (stats.notifications_sent + stats.notifications_failed)) * 100)
                                            : 100}%
                                    </p>
                                    <p className="text-xs text-red-500">{stats.notifications_failed} failed</p>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        {/* Email Templates Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.active_templates} Active</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Email Templates</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Design beautiful email templates with dynamic variables for personalized communication.
                            </p>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href={route('notification-studio.templates.index')}>
                                        View All
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700">
                                    <Link href={route('notification-studio.templates.create')}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Create
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        {/* Notification Flows Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white">
                                    <GitBranch className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.active_flows} Active</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Notification Flows</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Automate notifications based on events like enrollments, approvals, and more.
                            </p>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href={route('notification-studio.flows.index')}>
                                        View All
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    <Link href={route('notification-studio.flows.create')}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Create
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        {/* Logs Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <Badge variant="secondary">{stats.notifications_sent} Sent</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Notification Logs</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Track all sent notifications, view delivery status, and retry failed ones.
                            </p>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href={route('notification-studio.logs.index')}>
                                        View Logs
                                    </Link>
                                </Button>
                                <Button asChild size="sm" variant="secondary" className="flex-1">
                                    <Link href={route('notification-studio.logs.index', { status: 'failed' })}>
                                        <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                        Failed ({stats.notifications_failed})
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Event Categories */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Available Trigger Events</h3>
                                <p className="text-sm text-gray-500">Create flows for these events to send automatic notifications</p>
                            </div>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href={route('notification-studio.flows.create')}>
                                    <Sparkles className="w-4 h-4" />
                                    Create Flow
                                </Link>
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(eventCategories).map(([categoryKey, categoryLabel]) => {
                                const categoryEvents = Object.entries(triggerEvents).filter(
                                    ([_, event]) => event.category === categoryKey
                                );

                                if (categoryEvents.length === 0) return null;

                                const categoryColors: Record<string, string> = {
                                    enrollment: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
                                    admission: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
                                    parent: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
                                    staff: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
                                    approval: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
                                    general: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
                                };

                                return (
                                    <div
                                        key={categoryKey}
                                        className={`p-4 rounded-xl border-2 ${categoryColors[categoryKey] || categoryColors.general}`}
                                    >
                                        <h4 className="font-semibold mb-3">{categoryLabel}</h4>
                                        <ul className="space-y-2">
                                            {categoryEvents.map(([eventKey, event]) => (
                                                <li key={eventKey} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    <span>{event.label}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

