import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Header from '@/components/header';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
];

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
    {
        title: 'Academic Year',
        href: '/settings/academic-years',
        icon: null,
    },
    {
        title: 'Classes',
        href: '/settings/classes',
        icon: null,
    },
    {
        title: 'Class Assignments',
        href: '/settings/class-assignments',
        icon: null,
    },
    {
        title: 'Departments',
        href: '/settings/departments',
        icon: null,
    },
    {
        title: 'Designations',
        href: '/settings/designations',
        icon: null,
    },
    {
        title: 'Grades',
        href: '/settings/grades',
        icon: null,
    },
    {
        title: 'Subjects',
        href: '/settings/subjects',
        icon: null,
    },
    {
        title: 'Users',
        href: '/settings/users',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const { auth } = usePage().props;

    return (
        <div>
            <Header user={auth.user} breadcrumbs={breadcrumbs}/>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 p-2 pt-0 min-h-screen">
                <div className='grid grid-cols-12 gap-2 w-full'>
                    <aside className="bg-white dark:bg-neutral-900 p-2 rounded-lg col-span-2 border">
                        <nav className="flex flex-col space-y-1 space-x-0">
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': currentPath === item.href,
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>
                    <div className="flex-1 col-span-10">
                        <section>{children}</section>
                    </div>
                </div>
            </div>
        </div>

    );
}
