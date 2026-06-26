import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User, Calendar, BookOpen, Camera, X, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/parent/students',
    },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    photo?: string;
    student_id?: string;
    date_of_birth?: string;
    grade?: {
        name: string;
    };
    status: number,
}

interface Grade {
    id: number;
    name: string;
}

interface PageProps {
    auth: any;
    students: Student[];
    grades: Grade[];
    errors?: any;
}

export default function StudentIndex() {
    const { auth, students, grades, errors } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        grade_id: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        router.post('/parent/students', formData, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setFormData({
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    grade_id: '',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AppLayout>
            <Head title="My Students" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs}/>
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div></div>
                        {(students.length > 0 || true) && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                 <DialogTrigger asChild className='flex'>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {students.length > 0 ? 'Add Student' : 'Add Your First Student'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <form onSubmit={handleSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Add New Student</DialogTitle>
                                            <DialogDescription>
                                                Enter the student's information below. Click save when you're done.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="first_name" className="text-right">
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        value={formData.first_name}
                                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                        className={errors?.first_name ? 'border-red-500' : ''}
                                                        required
                                                    />
                                                    {errors?.first_name && (
                                                        <p className="text-red-500 text-xs">{errors.first_name}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="last_name" className="text-right">
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        value={formData.last_name}
                                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                        className={errors?.last_name ? 'border-red-500' : ''}
                                                        required
                                                    />
                                                    {errors?.last_name && (
                                                        <p className="text-red-500 text-xs">{errors.last_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth" className="text-right">
                                                    Date of Birth *
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="date_of_birth"
                                                        type="date"
                                                        value={formData.date_of_birth}
                                                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                                        className={`pl-10 ${errors?.date_of_birth ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {errors?.date_of_birth && (
                                                    <p className="text-red-500 text-xs">{errors.date_of_birth}</p>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="grade_id" className="text-right">
                                                    Grade *
                                                </Label>
                                                <div className="relative">
                                                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Select 
                                                        value={formData.grade_id} 
                                                        onValueChange={(value) => handleInputChange('grade_id', value)}
                                                    >
                                                        <SelectTrigger className={`pl-10 ${errors?.grade_id ? 'border-red-500' : ''}`}>
                                                            <SelectValue placeholder="Select a grade" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {grades.length === 0 ? (
                                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                                    No grades found
                                                                </div>
                                                            ) : (
                                                                grades.map((grade) => (
                                                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                                                        {grade.name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors?.grade_id && (
                                                    <p className="text-red-500 text-xs">{errors.grade_id}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsDialogOpen(false)}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? 'Saving...' : 'Save Student'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map((student) => (
                                <StudentIDCard key={student.id} student={student} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState onAddStudent={() => setIsDialogOpen(true)} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// Student ID Card Component
// StudentStatus enum values from backend:
// 0 = Draft, 1 = SubmitForApproval, 2 = ResendForApproval, 3 = Enrolled, 4 = LeaveSchool, 5 = CompleteStudy
function StudentIDCard({ student }: { student: Student }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: // Draft
                return "bg-gray-100 text-gray-600"
            case 1: // SubmitForApproval
                return "bg-blue-100 text-blue-600"
            case 2: // ResendForApproval
                return "bg-orange-100 text-orange-600"
            case 3: // Enrolled
                return "bg-green-100 text-green-600"
            case 4: // LeaveSchool
                return "bg-red-100 text-red-600"
            case 5: // CompleteStudy
                return "bg-purple-100 text-purple-600"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const getStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Draft"
            case 1:
                return "Pending Review"
            case 2:
                return "Re-submitted for Review"
            case 3:
                return "Enrolled"
            case 4:
                return "Left School"
            case 5:
                return "Completed Study"
            default:
                return "Unknown"
        }
    }

    // Format date properly
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

    // Get student full name
    const getFullName = () => {
        return `${student.first_name} ${student.last_name}`.trim();
    };

    // Get grade name safely
    const getGradeName = () => {
        return student.grade?.name || 'Grade not assigned';
    };

    // Handle photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            
            router.post(route('parent.students.photo.upload', student.id), {
                photo: base64,
            }, {
                onFinish: () => {
                    setIsUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            });
        };
        reader.readAsDataURL(file);
    };

    // Handle photo removal
    const handlePhotoRemove = () => {
        if (!confirm('Are you sure you want to remove this photo?')) return;
        
        setIsRemoving(true);
        router.delete(route('parent.students.photo.remove', student.id), {
            onFinish: () => setIsRemoving(false),
        });
    };

    return (
        <Card key={student.id} className="transition-smooth border-border shadow-none py-0">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Photo Upload Section */}
                        <div className="relative group">
                            {student.photo ? (
                                <div className="relative">
                                    <img 
                                        src={student.photo} 
                                        alt={getFullName()}
                                        className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    {/* Hover overlay for change/remove */}
                                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1 bg-white rounded-full hover:bg-gray-100"
                                            title="Change photo"
                                            disabled={isUploading}
                                        >
                                            <Camera className="h-3 w-3 text-gray-700" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePhotoRemove}
                                            className="p-1 bg-white rounded-full hover:bg-gray-100"
                                            title="Remove photo"
                                            disabled={isRemoving}
                                        >
                                            {isRemoving ? (
                                                <Loader2 className="h-3 w-3 animate-spin text-gray-700" />
                                            ) : (
                                                <X className="h-3 w-3 text-red-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all group-hover:ring-2 ring-blue-300"
                                    title="Add photo"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <span className="group-hover:hidden">{student.first_name?.charAt(0)?.toUpperCase()}</span>
                                    )}
                                    {!isUploading && (
                                        <Camera className="h-5 w-5 hidden group-hover:block" />
                                    )}
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{getFullName()}</h3>
                            <p className="text-sm text-muted-foreground">
                                {student.student_id ? `ID: ${student.student_id}` : 'No ID assigned'}
                            </p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                        {getStatusText(student.status)}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Born: {formatDate(student.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{getGradeName()}</span>
                    </div>
                </div>

                {/* Show buttons for Draft (0), SubmitForApproval (1), ResendForApproval (2) statuses */}
                {/* Hide for Enrolled (3), LeaveSchool (4), CompleteStudy (5) */}
                {student.status < 3 && (
                <div className="mt-6 flex gap-2">
                    <Link href={route('parent.students.show', student.id)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            View Details
                        </Button>
                    </Link>
                    {/* Show "Complete Enrollment" only for Draft (0) status */}
                    {student.status === 0 && (
                        <Link href={route('parent.admission.show', student.id)} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex-1" >
                            Complete Enrollment
                        </Link>
                    )}
                </div>
                )}
                {/* Show "View Details" button for Enrolled students */}
                {student.status >= 3 && (
                <div className="mt-6 flex gap-2">
                    <Link href={route('parent.students.show', student.id)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            View Details
                        </Button>
                    </Link>
                </div>
                )}
            </CardContent>
        </Card>
    );
}

// Empty State Component (updated to accept onAddStudent prop)
function EmptyState({ onAddStudent }: { onAddStudent: () => void }) {
    return (
        <Card className="w-full max-w-md mx-auto shadow-none border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors">
            <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Students Added</h3>
                <p className="text-gray-600 mb-6">
                    You haven't added any students yet. Add your first student to get started.
                </p>
                <Button onClick={onAddStudent} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Student
                </Button>
            </CardContent>
        </Card>
    );
}