import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Mail, 
    Phone, 
    Building2, 
    Calendar, 
    Search,
    Filter,
    MoreVertical,
    Trash2,
    CheckCircle,
    Clock,
    XCircle,
    MessageSquare,
    Play,
    UserCheck,
    TrendingUp,
    Loader2,
    Handshake,
    Send,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leads Management',
        href: '/settings/leads',
    },
];

interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    school_name: string | null;
    school_size: string | null;
    company_name: string | null;
    company_website: string | null;
    partner_type: string | null;
    role: string | null;
    message: string | null;
    type: 'waitlist' | 'demo' | 'contact_sales' | 'free_trial' | 'partner' | 'contact';
    source: string | null;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    created_at: string;
}

interface Props {
    leads: {
        data: Lead[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
    typeCounts: {
        all: number;
        waitlist: number;
        demo: number;
        free_trial: number;
        contact_sales: number;
        partner: number;
        contact: number;
    };
}

const typeLabels: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
    waitlist: { label: 'Waitlist', icon: Clock, color: 'bg-blue-100 text-blue-700' },
    demo: { label: 'Demo Request', icon: Play, color: 'bg-purple-100 text-purple-700' },
    free_trial: { label: 'Free Trial', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    contact_sales: { label: 'Contact Sales', icon: MessageSquare, color: 'bg-orange-100 text-orange-700' },
    partner: { label: 'Partner', icon: Handshake, color: 'bg-pink-100 text-pink-700' },
    contact: { label: 'Contact', icon: Send, color: 'bg-indigo-100 text-indigo-700' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
    qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
    converted: { label: 'Converted', color: 'bg-green-100 text-green-700' },
    lost: { label: 'Lost', color: 'bg-red-100 text-red-700' },
};

export default function Leads({ leads, filters, typeCounts }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleFilter = (key: string, value: string) => {
        setIsLoading(true);
        router.get('/settings/leads', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        router.get('/settings/leads', {
            ...filters,
            search,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleStatusChange = (leadId: number, status: string) => {
        router.patch(`/settings/leads/${leadId}/status`, { status }, {
            preserveState: true,
        });
    };

    const handleDelete = (leadId: number) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            router.delete(`/settings/leads/${leadId}`, {
                preserveState: true,
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall 
                        title="Leads Management" 
                        description="View and manage form submissions from your website (Waitlist, Demo Requests, Free Trials, Contact Sales)." 
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card 
                            className={`cursor-pointer transition-all ${(!filters.type || filters.type === 'all') ? 'ring-2 ring-[#116B11]' : ''}`}
                            onClick={() => handleFilter('type', 'all')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{typeCounts.all}</p>
                                        <p className="text-sm text-muted-foreground">All Leads</p>
                                    </div>
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card 
                            className={`cursor-pointer transition-all ${filters.type === 'waitlist' ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => handleFilter('type', 'waitlist')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{typeCounts.waitlist}</p>
                                        <p className="text-sm text-muted-foreground">Waitlist</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card 
                            className={`cursor-pointer transition-all ${filters.type === 'demo' ? 'ring-2 ring-purple-500' : ''}`}
                            onClick={() => handleFilter('type', 'demo')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{typeCounts.demo}</p>
                                        <p className="text-sm text-muted-foreground">Demo Requests</p>
                                    </div>
                                    <Play className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card 
                            className={`cursor-pointer transition-all ${filters.type === 'free_trial' ? 'ring-2 ring-green-500' : ''}`}
                            onClick={() => handleFilter('type', 'free_trial')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{typeCounts.free_trial}</p>
                                        <p className="text-sm text-muted-foreground">Free Trials</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card 
                            className={`cursor-pointer transition-all ${filters.type === 'contact_sales' ? 'ring-2 ring-orange-500' : ''}`}
                            onClick={() => handleFilter('type', 'contact_sales')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{typeCounts.contact_sales}</p>
                                        <p className="text-sm text-muted-foreground">Contact Sales</p>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, email, or school..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <Select 
                            value={filters.status || 'all'} 
                            onValueChange={(value) => handleFilter('status', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : leads.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No leads found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.data.map((lead) => {
                                        const TypeIcon = typeLabels[lead.type]?.icon || Users;
                                        return (
                                            <TableRow key={lead.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{lead.name}</span>
                                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {lead.email}
                                                        </span>
                                                        {lead.phone && (
                                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Phone className="h-3 w-3" /> {lead.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={typeLabels[lead.type]?.color}>
                                                        <TypeIcon className="h-3 w-3 mr-1" />
                                                        {typeLabels[lead.type]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        {lead.school_name && (
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                                {lead.school_name}
                                                            </span>
                                                        )}
                                                        {lead.school_size && (
                                                            <span className="text-sm text-gray-500">{lead.school_size} students</span>
                                                        )}
                                                        {lead.role && (
                                                            <span className="text-sm text-gray-500">{lead.role}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select 
                                                        value={lead.status}
                                                        onValueChange={(value) => handleStatusChange(lead.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <Badge className={statusLabels[lead.status]?.color}>
                                                                {statusLabels[lead.status]?.label}
                                                            </Badge>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="new">New</SelectItem>
                                                            <SelectItem value="contacted">Contacted</SelectItem>
                                                            <SelectItem value="qualified">Qualified</SelectItem>
                                                            <SelectItem value="converted">Converted</SelectItem>
                                                            <SelectItem value="lost">Lost</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(lead.created_at)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <a href={`mailto:${lead.email}`} className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4" />
                                                                    Send Email
                                                                </a>
                                                            </DropdownMenuItem>
                                                            {lead.phone && (
                                                                <DropdownMenuItem asChild>
                                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4" />
                                                                        Call
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(lead.id)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {leads.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {leads.data.length} of {leads.total} leads
                            </p>
                            <div className="flex gap-2">
                                {leads.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message Preview */}
                    {leads.data.some(l => l.message) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Messages from Contact Sales</CardTitle>
                                <CardDescription>Messages submitted through the contact sales form</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {leads.data.filter(l => l.message).map(lead => (
                                        <div key={lead.id} className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{lead.name}</span>
                                                <span className="text-sm text-gray-500">{formatDate(lead.created_at)}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">{lead.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
