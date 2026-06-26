import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {

    const { auth } = usePage().props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar auth={auth}/>            
            <AppContent variant="sidebar" className="overflow-x-hidden overflow-y-auto h-screen lg:pr-2 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding   [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb:hover]:bg-gray-300 transition-all duration-300">
                <main className='rounded-xl bg-slate-50 dark:bg-background relative my-2 inset-shadow-sm'>
                    {children}
                </main>
            </AppContent>
            <Toaster />
        </AppShell>
    );
}
