import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    User, 
    GraduationCap, 
    Calendar, 
    BookOpen, 
    DollarSign, 
    Utensils, 
    Clock, 
    CalendarDays, 
    FileText, 
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Award,
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building,
    Briefcase,
    Star,
    BarChart3,
    PieChart,
    Wallet,
    CreditCard,
    Receipt,
    UtensilsCrossed,
    Apple,
    Timer,
    Bell,
    PartyPopper,
    ClipboardList,
    Trophy,
    Target,
    Heart
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Students', href: '/parent/students' },
    { title: 'Details', href: '#' },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    photo?: string;
    student_id?: string;
    date_of_birth?: string;
    enrollment_date?: string;
    grade?: {
        id: number;
        name: string;
    };
    status: number;
    current_enrollment?: {
        school_class?: {
            name: string;
            section?: string;
        };
        class_teacher?: {
            name: string;
            email?: string;
            phone?: string;
        };
    };
}

interface Teacher {
    id: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    photo?: string;
    designation_name?: string;
    department_name?: string;
}

interface PageProps {
    auth: any;
    student: Student;
    teacher?: Teacher;
    fees: any;
    meals: any;
    timetable: any;
    calendar: any;
    reports: any;
}

export default function StudentDetails() {
    const { auth, student, teacher, fees, meals, timetable, calendar, reports } = usePage<PageProps>().props;

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return "bg-gray-100 text-gray-600";
            case 1: return "bg-blue-100 text-blue-600";
            case 2: return "bg-orange-100 text-orange-600";
            case 3: return "bg-green-100 text-green-600";
            case 4: return "bg-red-100 text-red-600";
            case 5: return "bg-purple-100 text-purple-600";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return "Draft";
            case 1: return "Pending Review";
            case 2: return "Re-submitted";
            case 3: return "Enrolled";
            case 4: return "Left School";
            case 5: return "Completed";
            default: return "Unknown";
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not provided';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getFullName = () => {
        return student.full_name || `${student.first_name} ${student.last_name}`.trim();
    };

    const getTeacherName = () => {
        if (!teacher) return 'Not assigned';
        return teacher.full_name || teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Not assigned';
    };

    return (
        <AppLayout>
            <Head title={`${getFullName()} - Details`} />

            <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />

                <div className="p-6 pt-0 mb-12">
                    {/* Back Button */}
                    <div className="mb-4">
                        <Link href={route('parent.students.index')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Students
                            </Button>
                        </Link>
                    </div>

                    {/* Student Profile Header */}
                    <Card className="mb-6 overflow-hidden border-0 shadow-lg py-0">
                        <div className="bg-gradient-to-r from-[#116B11] via-[#47A747] to-[#89CD89] h-16 relative">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                        </div>
                        <CardContent className="relative pt-0 pb-6">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
                                {/* Profile Photo */}
                                <div className="relative">
                                    {student.photo ? (
                                        <img 
                                            src={student.photo} 
                                            alt={getFullName()}
                                            className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
                                            {student.first_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${getStatusColor(student.status)}`}>
                                        {getStatusText(student.status)}
                                    </Badge>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 pt-4 md:pt-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getFullName()}</h1>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                                        {student.student_id && (
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="font-mono">
                                                    ID: {student.student_id}
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>{student.grade?.name || 'Grade not assigned'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>Born: {formatDate(student.date_of_birth)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2 mt-4 md:mt-0">
                                    {student.status === 0 && (
                                        <Link href={route('parent.admission.show', student.id)}>
                                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                                Complete Enrollment
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Section */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-white shadow-sm border p-1 h-auto flex-wrap">
                            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <User className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="academics" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <BookOpen className="h-4 w-4" />
                                Academics
                            </TabsTrigger>
                            <TabsTrigger value="fees" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <DollarSign className="h-4 w-4" />
                                Fees
                            </TabsTrigger>
                            <TabsTrigger value="meals" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <Utensils className="h-4 w-4" />
                                Meals
                            </TabsTrigger>
                            <TabsTrigger value="timetable" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <Clock className="h-4 w-4" />
                                Timetable
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <CalendarDays className="h-4 w-4" />
                                Calendar
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-[#116B11] data-[state=active]:text-white">
                                <FileText className="h-4 w-4" />
                                Reports
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Teacher Card */}
                                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            Class Teacher
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {teacher ? (
                                            <div className="flex items-center gap-4">
                                                {teacher.photo ? (
                                                    <img 
                                                        src={teacher.photo} 
                                                        alt={getTeacherName()}
                                                        className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                                                        {(teacher.full_name || teacher.first_name || teacher.name || 'T').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{getTeacherName()}</h4>
                                                    {teacher.designation_name && (
                                                        <p className="text-sm text-gray-500">{teacher.designation_name}</p>
                                                    )}
                                                    {teacher.email && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{teacher.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                <p>No teacher assigned yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Class Info Card */}
                                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Building className="h-5 w-5 text-purple-600" />
                                            </div>
                                            Class Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Grade</span>
                                                <span className="font-semibold">{student.grade?.name || 'Not assigned'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Section</span>
                                                <span className="font-semibold">{student.current_enrollment?.school_class?.section || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Class</span>
                                                <span className="font-semibold">{student.current_enrollment?.school_class?.name || 'N/A'}</span>
                                            </div>
                                            {student.enrollment_date && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Enrolled</span>
                                                    <span className="font-semibold">{formatDate(student.enrollment_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Attendance Summary Card */}
                                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                            Attendance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-2">
                                            <div className="text-4xl font-bold text-green-600 mb-1">
                                                {reports.attendance?.percentage || 0}%
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">Overall Attendance</p>
                                            <div className="flex justify-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <div className="font-semibold text-green-600">{reports.attendance?.present || 0}</div>
                                                    <div className="text-gray-500">Present</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-red-600">{reports.attendance?.absent || 0}</div>
                                                    <div className="text-gray-500">Absent</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-orange-600">{reports.attendance?.late || 0}</div>
                                                    <div className="text-gray-500">Late</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Academics Tab */}
                        <TabsContent value="academics" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Performance Card */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Trophy className="h-5 w-5 text-yellow-500" />
                                            Academic Performance
                                        </CardTitle>
                                        <CardDescription>Current semester progress</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Academic performance tracking will be available soon.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Subjects Card */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-500" />
                                            Subjects
                                        </CardTitle>
                                        <CardDescription>Enrolled subjects and grades</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Subject details will be available soon.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Fees Tab */}
                        <TabsContent value="fees" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100">Total Paid</p>
                                                <p className="text-3xl font-bold mt-1">$0.00</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-full">
                                                <CheckCircle className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-red-500 text-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100">Pending</p>
                                                <p className="text-3xl font-bold mt-1">$0.00</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-full">
                                                <AlertCircle className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100">Total Fees</p>
                                                <p className="text-3xl font-bold mt-1">$0.00</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-full">
                                                <Wallet className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-blue-500" />
                                        Payment History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-gray-400">
                                        <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h3>
                                        <p className="text-sm">Fee management and payment history will be available soon.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Meals Tab */}
                        <TabsContent value="meals" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                                            Today's Menu
                                        </CardTitle>
                                        <CardDescription>What's cooking today</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <Utensils className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Daily menu will be displayed here.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Apple className="h-5 w-5 text-green-500" />
                                            Meal Plan
                                        </CardTitle>
                                        <CardDescription>Your child's meal subscription</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Meal plan details will be available soon.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Timetable Tab */}
                        <TabsContent value="timetable" className="space-y-6">
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Timer className="h-5 w-5 text-purple-500" />
                                        Weekly Schedule
                                    </CardTitle>
                                    <CardDescription>Class timetable for the week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-16 text-gray-400">
                                        <Clock className="h-20 w-20 mx-auto mb-4 opacity-30" />
                                        <h3 className="text-xl font-medium text-gray-600 mb-2">Coming Soon</h3>
                                        <p className="text-sm max-w-md mx-auto">
                                            Weekly class schedule and timetable will be displayed here. 
                                            You'll be able to see all classes, timings, and subjects.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Calendar Tab */}
                        <TabsContent value="calendar" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="border-0 shadow-md lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-blue-500" />
                                            School Calendar
                                        </CardTitle>
                                        <CardDescription>Important dates and events</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-16 text-gray-400">
                                            <CalendarDays className="h-20 w-20 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-xl font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm max-w-md mx-auto">
                                                Interactive school calendar with events, holidays, 
                                                and important dates will be available here.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PartyPopper className="h-5 w-5 text-pink-500" />
                                            Upcoming Events
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            <p className="text-sm">No upcoming events</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Reports Tab */}
                        <TabsContent value="reports" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            Report Cards
                                        </CardTitle>
                                        <CardDescription>Academic reports and transcripts</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-base font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Report cards will be available for download.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-green-500" />
                                            Progress Reports
                                        </CardTitle>
                                        <CardDescription>Detailed progress analysis</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-base font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Progress tracking and analysis.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-yellow-500" />
                                            Achievements
                                        </CardTitle>
                                        <CardDescription>Awards and recognitions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-400">
                                            <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            <h3 className="text-base font-medium text-gray-600 mb-2">Coming Soon</h3>
                                            <p className="text-sm">Achievements and awards.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}

