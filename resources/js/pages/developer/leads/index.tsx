import { Head, router, Link, usePage } from '@inertiajs/react';
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
    Download,
    FileDown,
} from 'lucide-react';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer Portal',
        href: '/developer',
    },
    {
        title: 'Leads Management',
        href: '/developer/leads',
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
        source?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total: number;
        new: number;
        contacted: number;
        qualified: number;
        converted: number;
        lost: number;
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
    statusCounts: {
        all: number;
        new: number;
        contacted: number;
        qualified: number;
        converted: number;
        lost: number;
    };
}

const typeLabels: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
    waitlist: { label: 'Waitlist', icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    demo: { label: 'Demo Request', icon: Play, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    free_trial: { label: 'Free Trial', icon: TrendingUp, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    contact_sales: { label: 'Contact Sales', icon: MessageSquare, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    partner: { label: 'Partner', icon: Handshake, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
    contact: { label: 'Contact', icon: Send, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    converted: { label: 'Converted', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    lost: { label: 'Lost', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export default function DeveloperLeadsIndex({ leads, filters, stats, typeCounts, statusCounts }: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleFilter = (key: string, value: string) => {
        setIsLoading(true);
        router.get('/developer/leads', {
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
        router.get('/developer/leads', {
            ...filters,
            search,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleStatusChange = (leadId: number, status: string) => {
        router.patch(`/developer/leads/${leadId}/status`, { status }, {
            preserveState: true,
        });
    };

    const handleDelete = (leadId: number) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            router.delete(`/developer/leads/${leadId}`, {
                preserveState: true,
            });
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        window.open(`/developer/leads/export?${params.toString()}`, '_blank');
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
        <>
            <Head title="Leads Management - Developer Portal" />
            <Header user={auth.user} breadcrumbs={breadcrumbs} />
            
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Leads Management</h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage all leads from your website
                        </p>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Card className={`cursor-pointer transition-all ${(!filters.status || filters.status === 'all') ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleFilter('status', 'all')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                </div>
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer transition-all ${filters.status === 'new' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleFilter('status', 'new')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.new}</p>
                                    <p className="text-sm text-muted-foreground">New</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer transition-all ${filters.status === 'contacted' ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => handleFilter('status', 'contacted')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.contacted}</p>
                                    <p className="text-sm text-muted-foreground">Contacted</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer transition-all ${filters.status === 'qualified' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => handleFilter('status', 'qualified')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.qualified}</p>
                                    <p className="text-sm text-muted-foreground">Qualified</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer transition-all ${filters.status === 'converted' ? 'ring-2 ring-green-500' : ''}`}
                        onClick={() => handleFilter('status', 'converted')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.converted}</p>
                                    <p className="text-sm text-muted-foreground">Converted</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`cursor-pointer transition-all ${filters.status === 'lost' ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => handleFilter('status', 'lost')}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.lost}</p>
                                    <p className="text-sm text-muted-foreground">Lost</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
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
                                placeholder="Search by name, email, school, or company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </form>
                    <Select 
                        value={filters.type || 'all'} 
                        onValueChange={(value) => handleFilter('type', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="waitlist">Waitlist</SelectItem>
                            <SelectItem value="demo">Demo</SelectItem>
                            <SelectItem value="free_trial">Free Trial</SelectItem>
                            <SelectItem value="contact_sales">Contact Sales</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                    </Select>
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
                                <TableHead>School/Company</TableHead>
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
                                                    {lead.company_name && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3 text-gray-400" />
                                                            {lead.company_name}
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
                                                            <Link href={`/developer/leads/${lead.id}`} className="flex items-center gap-2">
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
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
            </div>
        </>
    );
}
