// extracurricular.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useRHF } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, MessageSquare, AlertCircle } from "lucide-react";
import { useFormValidation } from "@/hooks/use-form-validation";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectItem,
    SelectValue,
    SelectContent,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// shadcn form primitives
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
    FormDescription,
} from "@/components/ui/form";

// Shared comment components
import { 
    Comment,
    GlobalCommentsSection,
    FieldCommentsList,
    useCommentHandlers,
    hasUnresolvedComments as checkUnresolvedComments,
    getFieldComments as getComments 
} from "@/components/admission/CommentComponents";

// Signature component
import { SignatureInput } from "@/components/admission/SignatureInput";

/**
 * Validation schema for Extracurricular Activities
 */
const schema = z.object({
    // Form ID
    form_id: z.number().min(1),

    // Sports Interests
    interested_in_sports: z.boolean().default(false),
    sports_interests: z.array(z.string()).default([]),
    previous_sports_experience: z.string().optional().or(z.literal("")),
    sports_skill_level: z.enum(["beginner", "intermediate", "advanced", "competitive"]).optional().or(z.literal("beginner")),
    
    // Clubs & Organizations
    interested_in_clubs: z.boolean().default(false),
    club_interests: z.array(z.string()).default([]),
    leadership_roles: z.string().optional().or(z.literal("")),
    new_club_suggestions: z.string().optional().or(z.literal("")),
    
    // Music & Arts Programs
    interested_in_music: z.boolean().default(false),
    music_interests: z.array(z.string()).default([]),
    instrument_experience: z.string().optional().or(z.literal("")),
    vocal_experience: z.enum(["none", "chorus", "solo", "ensemble"]).optional().or(z.literal("none")),
    theater_interest: z.boolean().default(false),
    visual_arts_interest: z.boolean().default(false),
    
    // After-School Programs
    after_school_care_needed: z.enum(["daily", "occasional", "never"]).optional().or(z.literal("never")),
    program_schedule_preference: z.array(z.string()).default([]),
    homework_assistance: z.boolean().default(false),
    enrichment_activities: z.string().optional().or(z.literal("")),
    
    // Academic Teams & Competitions
    academic_teams_interest: z.boolean().default(false),
    team_interests: z.array(z.string()).default([]),
    competition_experience: z.string().optional().or(z.literal("")),
    
    // Community Service
    community_service_interest: z.boolean().default(false),
    service_preferences: z.array(z.string()).default([]),
    previous_service_hours: z.string().optional().or(z.literal("")),
    
    // Time Commitment & Availability
    days_available: z.array(z.string()).default([]),
    time_commitment: z.enum(["light", "moderate", "heavy"]).optional().or(z.literal("moderate")),
    transportation_after_school: z.enum(["parent_pickup", "bus", "walk", "other"]).optional().or(z.literal("parent_pickup")),
    
    // Special Considerations
    special_needs_accommodations: z.string().optional().or(z.literal("")),
    equipment_needs: z.string().optional().or(z.literal("")),
    cost_considerations: z.string().optional().or(z.literal("")),
    
    // Parent/Student Agreement
    parent_support: z.boolean().refine(val => val === true, "Parent support agreement is required"),
    student_commitment: z.boolean().refine(val => val === true, "Student commitment agreement is required"),
    academic_priority: z.boolean().refine(val => val === true, "Academic priority agreement is required"),
    
    // Signature
    signature: z.string().min(1, "Signature is required").refine((v) => !v || v.trim().length >= 2, "Signature too short"),
    signature_date: z.string().min(1, "Signature date is required").refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
});

type FormValues = z.infer<typeof schema>;

// Options for multi-select fields
const SPORTS_OPTIONS = [
    "Basketball",
    "Soccer",
    "Football",
    "Volleyball",
    "Baseball",
    "Softball",
    "Track & Field",
    "Cross Country",
    "Swimming",
    "Tennis",
    "Golf",
    "Wrestling",
    "Cheerleading",
    "Dance",
    "Other"
];

const CLUB_OPTIONS = [
    "Student Government",
    "Debate Club",
    "Science Club",
    "Math Club",
    "Robotics",
    "Chess Club",
    "Book Club",
    "Art Club",
    "Drama Club",
    "Environmental Club",
    "Yearbook",
    "Newspaper",
    "Cultural Clubs",
    "Language Clubs",
    "Other"
];

const MUSIC_OPTIONS = [
    "Band",
    "Orchestra",
    "Choir",
    "Jazz Band",
    "Marching Band",
    "Piano",
    "Guitar",
    "Strings",
    "Woodwinds",
    "Brass",
    "Percussion",
    "Music Theory",
    "Other"
];

const ACADEMIC_TEAM_OPTIONS = [
    "Math Team",
    "Science Olympiad",
    "Spelling Bee",
    "Quiz Bowl",
    "Debate Team",
    "Model UN",
    "Robotics Team",
    "Coding Club",
    "History Bowl",
    "Other"
];

const SERVICE_OPTIONS = [
    "Animal Shelter",
    "Food Bank",
    "Environmental Cleanup",
    "Elderly Care",
    "Tutoring",
    "Hospital Volunteering",
    "Community Events",
    "Religious Organizations",
    "Other"
];

const DAYS_OPTIONS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const SCHEDULE_OPTIONS = [
    "Immediately after school",
    "Late afternoon (4-6 PM)",
    "Evening (6 PM+)",
    "Weekends",
    "Summer programs",
    "Holiday breaks"
];

export default function ExtracurricularForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    
    // Use shared comment handlers
    const { isSubmitting: isCommentSubmitting, handleReply, handleResolve } = useCommentHandlers();
    
    // Use form validation hook for error handling
    const { onFormInvalid } = useFormValidation();
    
    // Get comments for a specific field using shared helper
    const getFieldCommentsForField = (fieldName: string): Comment[] => {
        return getComments(commentsByField, fieldName);
    };

    // Check if there are unresolved comments using shared helper
    const hasUnresolvedCommentsOnForm = useMemo(() => {
        return checkUnresolvedComments(commentsByField, globalComments);
    }, [commentsByField, globalComments]);

    // Use formData for display (approved if available, otherwise latest)
    const formDataObject = useMemo(() => formData || {}, [formData]);
    
    // Check if there are pending changes (latest_data differs from approved_data)
    const hasPendingChanges = useMemo(() => {
        if (!approvedData || !latestData) return false;
        return JSON.stringify(approvedData) !== JSON.stringify(latestData);
    }, [approvedData, latestData]);
    
    // Check if form is approved
    const isApproved = admissionForm?.status === 'approved';


    // Get default values for the form
    // Helper function to parse JSON array data (handles both string and array)
    const parseArrayData = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (hasData) {
            // Use formDataObject directly (already denormalized)
            // Make sure array fields are properly parsed
            return {
                form_id: form.id,
                ...formDataObject,
                sports_interests: parseArrayData(formDataObject.sports_interests),
                club_interests: parseArrayData(formDataObject.club_interests),
                music_interests: parseArrayData(formDataObject.music_interests),
                program_schedule_preference: parseArrayData(formDataObject.program_schedule_preference),
                team_interests: parseArrayData(formDataObject.team_interests),
                service_preferences: parseArrayData(formDataObject.service_preferences),
                days_available: parseArrayData(formDataObject.days_available),
            } as FormValues;
        }
        
        return {
            form_id: form.id,
            interested_in_sports: false,
            sports_interests: [],
            previous_sports_experience: "",
            sports_skill_level: "beginner",
            interested_in_clubs: false,
            club_interests: [],
            leadership_roles: "",
            new_club_suggestions: "",
            interested_in_music: false,
            music_interests: [],
            instrument_experience: "",
            vocal_experience: "none",
            theater_interest: false,
            visual_arts_interest: false,
            after_school_care_needed: "never",
            program_schedule_preference: [],
            homework_assistance: false,
            enrichment_activities: "",
            academic_teams_interest: false,
            team_interests: [],
            competition_experience: "",
            community_service_interest: false,
            service_preferences: [],
            previous_service_hours: "",
            days_available: [],
            time_commitment: "moderate",
            transportation_after_school: "parent_pickup",
            special_needs_accommodations: "",
            equipment_needs: "",
            cost_considerations: "",
            parent_support: false,
            student_commitment: false,
            academic_priority: false,
            signature: "",
            signature_date: ""
        };
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    const handleInitialSubmit = (values: FormValues) => {
        setIsFormSubmitting(true);

        router.post(route("parent.forms.submit"), {
            ...values,
            student_id: student.id
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormSubmitting(false);
                toast.success("Extracurricular activities form submitted successfully!");
            },
            onError: (errors) => {
                setIsFormSubmitting(false);
                toast.error("Failed to submit form. Please check the errors.");
            }
        });
    };

    const handleFieldUpdate = (fieldName: keyof FormValues, value: any) => {
        setIsFormSubmitting(true);

        const updateData = {
            form_id: form.id,
            student_id: student.id,
            key: fieldName,
            value: value
        };

        router.post(route("parent.forms.submit"), updateData, {
            preserveScroll: true,
            onSuccess: () => {
                // Reload the page to get updated data from backend
                router.reload({ only: ['admissionForm', 'formData', 'approvedData', 'latestData'] });
                setIsFormSubmitting(false);
                setEditingField(null);
                toast.success("Field updated successfully!");
                rhForm.setValue(fieldName, value);
            },
            onError: (errors) => {
                setIsFormSubmitting(false);
                toast.error("Failed to update field. Please check the errors.");
            }
        });
    };

    const startEditing = (fieldName: string) => {
        setEditingField(fieldName);
    };

    const cancelEditing = () => {
        setEditingField(null);
        rhForm.resetField(editingField as any);
    };

    const saveField = (fieldName: keyof FormValues) => {
        const value = rhForm.getValues(fieldName);
        handleFieldUpdate(fieldName, value);
    };

    // Helper function to get field value from data object
    const getFieldValue = (data: any, fieldName: string): any => {
        if (!data) return null;
        return data[fieldName] ?? null;
    };

    // Helper function to check if a field has pending changes
    const fieldHasPendingChanges = (fieldName: string): boolean => {
        if (!approvedData || !latestData) return false;
        const approvedValue = getFieldValue(approvedData, fieldName);
        const latestValue = getFieldValue(latestData, fieldName);
        return JSON.stringify(approvedValue) !== JSON.stringify(latestValue);
    };

    // Helper function to format value for display
    const formatValueForDisplay = (value: any): string => {
        if (value === null || value === undefined) return "Not set";
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && value.trim() === '') return "Not set";
        return String(value);
    };

    // FieldWrapper component
    const FieldWrapper: React.FC<{ 
        htmlFor: string; 
        label: string; 
        required?: boolean;
        children: React.ReactNode;
        fieldName: string;
        isEditing: boolean;
        onStartEdit: () => void;
        onSave: () => void;
        onCancel: () => void;
    }> = ({ htmlFor, label, required = false, children, fieldName, isEditing, onStartEdit, onSave, onCancel }) => {
        const hasPending = fieldHasPendingChanges(fieldName);
        const approvedValue = getFieldValue(approvedData, fieldName);
        const latestValue = getFieldValue(latestData, fieldName);
        const fieldComments = getFieldCommentsForField(fieldName);
        const hasUnresolvedFieldComments = fieldComments.some((c: Comment) => !c.is_resolved && !c.reply);
        
        return (
            <div className="w-full relative">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor={htmlFor} className="text-sm font-medium">
                            {label} {required && <span className="text-red-500">*</span>}
                        </Label>
                        {hasPending && !isEditing && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                Pending Approval
                            </Badge>
                        )}
                        {isApproved && !hasPending && !isEditing && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Approved
                            </Badge>
                        )}
                        {hasUnresolvedFieldComments && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                School Comment
                            </Badge>
                        )}
                    </div>
                    {!isEditing && isSubmitted && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onStartEdit}
                            className="h-6 w-6 p-0"
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                
                {/* Show old approved value if there are pending changes */}
                {hasPending && !isEditing && approvedValue !== null && approvedValue !== undefined && (
                    <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600">Previous Approved Value:</span>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Approved
                            </Badge>
                        </div>
                        <div className="text-gray-700">{formatValueForDisplay(approvedValue)}</div>
                    </div>
                )}
                
                {/* Show current/pending value */}
                <div className={hasPending && !isEditing ? "p-2 bg-yellow-50 border border-yellow-200 rounded" : ""}>
                    {children}
                    {hasPending && !isEditing && (
                        <div className="mt-1 text-xs text-yellow-700 font-medium">
                            ⏳ Pending Approval
                        </div>
                    )}
                </div>
                
                {isEditing && (
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={onSave}
                            disabled={isFormSubmitting}
                            className="h-7 text-xs"
                        >
                            <Save className="h-3 w-3 mr-1" />
                            {isFormSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            disabled={isFormSubmitting}
                            className="h-7 text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Show field comments from school */}
                <FieldCommentsList 
                    comments={fieldComments}
                    onReply={handleReply}
                    onResolve={handleResolve}
                    isSubmitting={isCommentSubmitting}
                />
            </div>
        );
    };

    // Custom checkbox group component for multi-select fields
    const CheckboxGroup: React.FC<{
        options: string[];
        selected: string[];
        onChange: (selected: string[]) => void;
        disabled?: boolean;
    }> = ({ options, selected, onChange, disabled = false }) => {
        const handleCheckboxChange = (option: string, checked: boolean) => {
            if (checked) {
                onChange([...selected, option]);
            } else {
                onChange(selected.filter(item => item !== option));
            }
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                            id={option}
                            checked={selected.includes(option)}
                            onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                            disabled={disabled}
                        />
                        <Label htmlFor={option} className="text-sm font-normal">
                            {option}
                        </Label>
                    </div>
                ))}
            </div>
        );
    };

    // Render form field based on type and editing state
    const renderFormField = (name: keyof FormValues, label: string, required: boolean = false) => {
        const isEditing = editingField === name;
        const isReadOnly = isSubmitted && !isEditing;

        return (
            <FormField
                control={rhForm.control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FieldWrapper 
                            htmlFor={name as string} 
                            label={label} 
                            required={required}
                            fieldName={name as string}
                            isEditing={isEditing}
                            onStartEdit={() => startEditing(name as string)}
                            onSave={() => saveField(name)}
                            onCancel={cancelEditing}
                        >
                            <FormControl>
                                {name === 'sports_skill_level' || name === 'vocal_experience' || 
                                 name === 'after_school_care_needed' || name === 'time_commitment' ||
                                 name === 'transportation_after_school' ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {name === 'sports_skill_level' ? (
                                                <>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                    <SelectItem value="competitive">Competitive</SelectItem>
                                                </>
                                            ) : name === 'vocal_experience' ? (
                                                <>
                                                    <SelectItem value="none">No Experience</SelectItem>
                                                    <SelectItem value="chorus">Chorus/Choir</SelectItem>
                                                    <SelectItem value="solo">Solo Performance</SelectItem>
                                                    <SelectItem value="ensemble">Small Ensemble</SelectItem>
                                                </>
                                            ) : name === 'after_school_care_needed' ? (
                                                <>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="occasional">Occasionally</SelectItem>
                                                    <SelectItem value="never">Not Needed</SelectItem>
                                                </>
                                            ) : name === 'time_commitment' ? (
                                                <>
                                                    <SelectItem value="light">Light (1-2 hours/week)</SelectItem>
                                                    <SelectItem value="moderate">Moderate (3-5 hours/week)</SelectItem>
                                                    <SelectItem value="heavy">Heavy (6+ hours/week)</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="parent_pickup">Parent Pickup</SelectItem>
                                                    <SelectItem value="bus">School Bus</SelectItem>
                                                    <SelectItem value="walk">Walk/Bike</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : name === 'sports_interests' ? (
                                    <CheckboxGroup
                                        options={SPORTS_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'club_interests' ? (
                                    <CheckboxGroup
                                        options={CLUB_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'music_interests' ? (
                                    <CheckboxGroup
                                        options={MUSIC_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'team_interests' ? (
                                    <CheckboxGroup
                                        options={ACADEMIC_TEAM_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'service_preferences' ? (
                                    <CheckboxGroup
                                        options={SERVICE_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'days_available' ? (
                                    <CheckboxGroup
                                        options={DAYS_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'program_schedule_preference' ? (
                                    <CheckboxGroup
                                        options={SCHEDULE_OPTIONS}
                                        selected={field.value as string[]}
                                        onChange={field.onChange}
                                        disabled={isReadOnly}
                                    />
                                ) : name === 'previous_sports_experience' || name === 'leadership_roles' || 
                                  name === 'new_club_suggestions' || name === 'instrument_experience' ||
                                  name === 'enrichment_activities' || name === 'competition_experience' ||
                                  name === 'previous_service_hours' || name === 'special_needs_accommodations' ||
                                  name === 'equipment_needs' || name === 'cost_considerations' ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                    />
                                ) : name === 'interested_in_sports' || name === 'interested_in_clubs' ||
                                  name === 'interested_in_music' || name === 'theater_interest' ||
                                  name === 'visual_arts_interest' || name === 'homework_assistance' ||
                                  name === 'academic_teams_interest' || name === 'community_service_interest' ||
                                  name === 'parent_support' || name === 'student_commitment' ||
                                  name === 'academic_priority' ? (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={name as string}
                                            checked={field.value as boolean}
                                            onCheckedChange={field.onChange}
                                            disabled={isReadOnly}
                                        />
                                        <Label htmlFor={name as string} className="text-sm">
                                            {label}
                                        </Label>
                                    </div>
                                ) : name === 'signature' ? (
                                    <SignatureInput
                                        value={field.value as string || ''}
                                        onChange={field.onChange}
                                        onSignatureSaved={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            rhForm.setValue('signature_date', today);
                                        }}
                                        disabled={isReadOnly}
                                        required={required}
                                    />
                                ) : (
                                    <Input 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                        type={name.includes('date') ? 'date' : 'text'}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FieldWrapper>
                    </FormItem>
                )}
            />
        );
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <Head title={`${form.name}`} />
            <Form {...rhForm}>
                <form onSubmit={rhForm.handleSubmit(handleInitialSubmit, onFormInvalid)} className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-4">
                    <input type="hidden" name="form_id" value={form.id} />

                    <div className="flex gap-3">
                        <div className="px-2">
                            <div className="flex gap-2">
                                <Link href={route('parent.admission.show', student.id)} className="justify-center items-center inline-flex" >
                                    <ChevronLeft />
                                </Link>
                                <h1 className="text-2xl font-bold">{form.name}</h1>
                            </div>
                            <p className={`text-sm px-8 mt-1 ${isSubmitted ? 'text-green-900 font-semibold' : 'text-muted-foreground'}`}>
                                {isSubmitted ? (
                                    isApproved ? (
                                        "Your extracurricular activities form has been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your extracurricular activities form has pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your extracurricular activities form has been submitted. You can update it freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please indicate your interests in various extracurricular activities. This helps us plan programs and allocate resources."
                                )}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {!isSubmitted && (
                                <Button 
                                    type="submit" 
                                    disabled={isFormSubmitting}
                                >
                                    {isFormSubmitting ? "Submitting..." : "Submit Form"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Global Comments Alert */}
                    {hasUnresolvedCommentsOnForm && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">School Feedback</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                The school has added comments that need your attention. Please review and respond to them below.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Global Comments from School */}
                    <GlobalCommentsSection 
                        comments={globalComments}
                        onReply={handleReply}
                        onResolve={handleResolve}
                        isSubmitting={isCommentSubmitting}
                    />

                    <hr />

                    {/* Sports Interests */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Sports & Athletics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("interested_in_sports", "Interested in participating in sports")}
                            
                            <div className="space-y-4">
                                {renderFormField("sports_interests", "Sports of interest (select all that apply)")}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("sports_skill_level", "Current skill level")}
                                </div>
                                {renderFormField("previous_sports_experience", "Previous sports experience")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Clubs & Organizations */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Clubs & Organizations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("interested_in_clubs", "Interested in joining clubs")}
                            
                            <div className="space-y-4">
                                {renderFormField("club_interests", "Club interests (select all that apply)")}
                                {renderFormField("leadership_roles", "Interest in leadership roles")}
                                {renderFormField("new_club_suggestions", "Suggestions for new clubs")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Music & Arts Programs */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Music & Arts Programs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("interested_in_music", "Interested in music programs")}
                            
                            <div className="space-y-4">
                                {renderFormField("music_interests", "Music interests (select all that apply)")}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("instrument_experience", "Instrument experience")}
                                    {renderFormField("vocal_experience", "Vocal experience")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("theater_interest", "Interested in theater/drama")}
                                    {renderFormField("visual_arts_interest", "Interested in visual arts")}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* After-School Programs */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>After-School Programs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("after_school_care_needed", "After-school care needed")}
                            </div>
                            
                            <div className="space-y-4">
                                {renderFormField("program_schedule_preference", "Preferred program schedule (select all that apply)")}
                                {renderFormField("homework_assistance", "Need homework assistance")}
                                {renderFormField("enrichment_activities", "Specific enrichment activity interests")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Academic Teams & Competitions */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Academic Teams & Competitions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("academic_teams_interest", "Interested in academic teams")}
                            
                            <div className="space-y-4">
                                {renderFormField("team_interests", "Team interests (select all that apply)")}
                                {renderFormField("competition_experience", "Previous competition experience")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Community Service */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Community Service</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("community_service_interest", "Interested in community service")}
                            
                            <div className="space-y-4">
                                {renderFormField("service_preferences", "Service preferences (select all that apply)")}
                                {renderFormField("previous_service_hours", "Previous community service experience/hours")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Time Commitment & Availability */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Time Commitment & Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {renderFormField("days_available", "Days available for activities (select all that apply)")}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("time_commitment", "Preferred time commitment level")}
                                    {renderFormField("transportation_after_school", "Transportation method after school")}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Special Considerations */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Special Considerations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {renderFormField("special_needs_accommodations", "Special needs or accommodations required")}
                                {renderFormField("equipment_needs", "Equipment or material needs")}
                                {renderFormField("cost_considerations", "Cost considerations or need for financial assistance")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Agreements */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Parent & Student Agreements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                                <p className="text-sm text-gray-600">
                                    By checking the boxes below, you acknowledge and agree to the following:
                                </p>
                                
                                <div className="space-y-3">
                                    {renderFormField("parent_support", "As a parent/guardian, I agree to support my student's participation and ensure regular attendance", true)}
                                    {renderFormField("student_commitment", "As a student, I commit to participating fully and maintaining good academic standing", true)}
                                    {renderFormField("academic_priority", "We understand that academic performance takes priority over extracurricular activities", true)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Signature */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Signature</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("signature", "Parent/Guardian Signature", true)}
                                {renderFormField("signature_date", "Signature Date", true)}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}