import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle, Database, RefreshCw, Terminal, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer tools',
        href: '/settings/developer',
    },
];

interface Props {
    isLocalEnv: boolean;
}

export default function Developer({ isLocalEnv }: Props) {
    const [isResetting, setIsResetting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);

    const handleResetDatabase = () => {
        setIsResetting(true);
        router.post('/settings/developer/reset-database', {}, {
            onFinish: () => {
                setIsResetting(false);
                setDialogOpen(false);
            },
        });
    };

    const handleClearCache = () => {
        setIsClearingCache(true);
        router.post('/settings/developer/clear-cache', {}, {
            onFinish: () => {
                setIsClearingCache(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Developer Tools" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall 
                        title="Developer Tools" 
                        description="Development and testing utilities. Use with caution." 
                    />

                    {!isLocalEnv ? (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    Production Environment Detected
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    Developer tools are disabled in production for security reasons. 
                                    These features are only available in local or development environments.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Database Reset Card */}
                            <Card className="border-red-200 dark:border-red-800/50">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <Database className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Reset Database</CardTitle>
                                            <CardDescription className="mt-1">
                                                Run <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono">php artisan migrate:fresh --seed</code>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                            <div className="text-sm text-red-700 dark:text-red-300">
                                                <p className="font-medium">Warning: This action is irreversible!</p>
                                                <p className="mt-1">
                                                    This will drop all tables, recreate them, and seed the database with fresh data. 
                                                    All existing data will be permanently lost.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="gap-2">
                                                <RefreshCw className="h-4 w-4" />
                                                Reset & Seed Database
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                    <AlertTriangle className="h-5 w-5" />
                                                    Confirm Database Reset
                                                </DialogTitle>
                                                <DialogDescription className="pt-3">
                                                    <span className="block mb-3">
                                                        You are about to reset the entire database. This will:
                                                    </span>
                                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                                        <li>Drop all existing tables</li>
                                                        <li>Run all migrations from scratch</li>
                                                        <li>Seed the database with default data</li>
                                                        <li>Log out all users</li>
                                                    </ul>
                                                    <span className="block mt-3 font-medium text-red-600 dark:text-red-400">
                                                        This action cannot be undone!
                                                    </span>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <DialogClose asChild>
                                                    <Button variant="outline" disabled={isResetting}>
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={handleResetDatabase}
                                                    disabled={isResetting}
                                                    className="gap-2"
                                                >
                                                    {isResetting ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                            Resetting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Database className="h-4 w-4" />
                                                            Yes, Reset Database
                                                        </>
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>

                            {/* Clear Cache Card */}
                            <Card className="border-amber-200 dark:border-amber-800/50">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                            <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Clear Cache</CardTitle>
                                            <CardDescription className="mt-1">
                                                Clear config, application, and route caches
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                                        <div className="text-sm text-amber-700 dark:text-amber-300">
                                            <p className="font-medium mb-2">This will run the following commands:</p>
                                            <ul className="space-y-1 font-mono text-xs">
                                                <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">php artisan config:clear</code></li>
                                                <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">php artisan cache:clear</code></li>
                                                <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">php artisan route:clear</code></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                                        onClick={handleClearCache}
                                        disabled={isClearingCache}
                                    >
                                        {isClearingCache ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Clearing Cache...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Clear All Caches
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Environment Info Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Environment Information</CardTitle>
                                            <CardDescription className="mt-1">
                                                Current application environment details
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Environment</p>
                                            <p className="font-medium">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    Local / Development
                                                </span>
                                            </p>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Developer Tools</p>
                                            <p className="font-medium text-green-600 dark:text-green-400">Enabled</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}


