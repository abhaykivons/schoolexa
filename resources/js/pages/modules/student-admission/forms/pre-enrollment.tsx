// pre-enrollment.tsx
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
import { Badge } from "@/components/ui/badge";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

// shadcn form primitives
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

// Shared comment components
import { 
    Comment,
    CommentItem, 
    GlobalCommentsSection,
    FieldCommentsList,
    useCommentHandlers,
    hasUnresolvedComments as checkUnresolvedComments,
    getFieldComments as getComments 
} from "@/components/admission/CommentComponents";

// Signature component
import { SignatureInput } from "@/components/admission/SignatureInput";

/**
 * Updated validation schema with required fields
 */
const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
const zipRegex = /^[A-Za-z0-9\- ]{3,10}$/;

const schema = z.object({
    // Form ID
    form_id: z.number().min(1),

    // Student (required fields updated)
    student_last_name: z.string().min(1, "Last name is required"),
    student_first_name: z.string().min(1, "First name is required"),
    student_middle_name: z.string().optional().or(z.literal("")),
    legal_last_name: z.string().optional().or(z.literal("")),
    present_grade: z.string().min(1, "Grade level is required"),
    grade_entering: z.string().min(1, "Grade entering is required"),
    sex: z
        .enum(["male", "female", "non_binary", "prefer_not", ""])
        .refine(val => val !== "", "Sex is required"),
    birthdate: z
        .string()
        .min(1, "Birthdate is required")
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Invalid date format"
        ),
    home_phone: z
        .string()
        .min(1, "Home phone is required")
        .refine((v) => !v || phoneRegex.test(v), "Invalid phone"),
    home_language: z.string().optional().or(z.literal("")),

    // Household
    primary_household: z
        .enum(["both_parents", "mother", "father", "other"])
        .optional()
        .or(z.literal("both_parents")),

    // Parent 1 (at least one parent required)
    parent1_last: z.string().min(1, "At least one parent last name is required"),
    parent1_first: z.string().min(1, "At least one parent first name is required"),
    parent1_workplace: z.string().optional().or(z.literal("")),
    parent1_business_phone: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || phoneRegex.test(v), "Invalid phone"),
    parent1_cell_email: z
        .string()
        .min(1, "Primary contact email/phone is required")
        .refine((v) => !v || z.string().email().safeParse(v).success || phoneRegex.test(v), "Invalid email or phone"),
    parent1_address: z.string().min(1, "Home address is required"),
    parent1_city: z.string().min(1, "City is required"),
    parent1_state: z.string().min(1, "State is required"),
    parent1_zip: z
        .string()
        .min(1, "ZIP code is required")
        .refine((v) => !v || zipRegex.test(v), "Invalid ZIP"),

    // Parent 2 (optional)
    parent2_last: z.string().optional().or(z.literal("")),
    parent2_first: z.string().optional().or(z.literal("")),
    parent2_workplace: z.string().optional().or(z.literal("")),
    parent2_business_phone: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || phoneRegex.test(v), "Invalid phone"),
    parent2_cell_email: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || z.string().email().safeParse(v).success || phoneRegex.test(v), "Invalid email or phone"),
    parent2_address: z.string().optional().or(z.literal("")),
    parent2_city: z.string().optional().or(z.literal("")),
    parent2_state: z.string().optional().or(z.literal("")),
    parent2_zip: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || zipRegex.test(v), "Invalid ZIP"),

    // Emergency contacts (at least one required)
    emergency1_name: z.string().min(1, "At least one emergency contact name is required"),
    emergency1_relationship: z.string().min(1, "Emergency contact relationship is required"),
    emergency1_address: z.string().optional().or(z.literal("")),
    emergency1_city: z.string().optional().or(z.literal("")),
    emergency1_state: z.string().optional().or(z.literal("")),
    emergency1_zip: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || zipRegex.test(v), "Invalid ZIP"),
    emergency1_phone: z
        .string()
        .min(1, "Emergency contact phone is required")
        .refine((v) => !v || phoneRegex.test(v), "Invalid phone"),
    emergency2_name: z.string().optional().or(z.literal("")),
    emergency2_relationship: z.string().optional().or(z.literal("")),
    emergency2_address: z.string().optional().or(z.literal("")),
    emergency2_city: z.string().optional().or(z.literal("")),
    emergency2_state: z.string().optional().or(z.literal("")),
    emergency2_zip: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || zipRegex.test(v), "Invalid ZIP"),
    emergency2_phone: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || phoneRegex.test(v), "Invalid phone"),

    // Medical
    family_doctor: z.string().min(1, "Family doctor information is required"),
    family_dentist: z.string().optional().or(z.literal("")),
    medical_notes: z.string().min(1, "Medical information is required - list 'None' if applicable"),

    // Residency & signature (required)
    residency_signature: z
        .string()
        .min(1, "Signature is required")
        .refine((v) => !v || v.trim().length >= 2, "Signature too short"),
    residency_signature_date: z
        .string()
        .min(1, "Signature date is required")
        .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
});

type FormValues = z.infer<typeof schema>;

export default function PreEnrollmentForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, grades, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    
    // Use shared comment handlers
    const { isSubmitting: isCommentSubmitting, handleReply, handleResolve } = useCommentHandlers();
    
    // Use form validation hook for error handling
    const { onFormInvalid } = useFormValidation();

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
    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (hasData) {
            return {
                form_id: form.id,
                student_last_name: formDataObject.student_last_name || "",
                student_first_name: formDataObject.student_first_name || "",
                student_middle_name: formDataObject.student_middle_name || "",
                legal_last_name: formDataObject.legal_last_name || "",
                present_grade: formDataObject.present_grade || "",
                grade_entering: formDataObject.grade_entering || "",
                sex: formDataObject.sex || "",
                birthdate: formDataObject.birthdate || "",
                home_phone: formDataObject.home_phone || "",
                home_language: formDataObject.home_language || "",
                primary_household: formDataObject.primary_household || "both_parents",
                parent1_last: formDataObject.parent1_last || "",
                parent1_first: formDataObject.parent1_first || "",
                parent1_workplace: formDataObject.parent1_workplace || "",
                parent1_business_phone: formDataObject.parent1_business_phone || "",
                parent1_cell_email: formDataObject.parent1_cell_email || "",
                parent1_address: formDataObject.parent1_address || "",
                parent1_city: formDataObject.parent1_city || "",
                parent1_state: formDataObject.parent1_state || "",
                parent1_zip: formDataObject.parent1_zip || "",
                parent2_last: formDataObject.parent2_last || "",
                parent2_first: formDataObject.parent2_first || "",
                parent2_workplace: formDataObject.parent2_workplace || "",
                parent2_business_phone: formDataObject.parent2_business_phone || "",
                parent2_cell_email: formDataObject.parent2_cell_email || "",
                parent2_address: formDataObject.parent2_address || "",
                parent2_city: formDataObject.parent2_city || "",
                parent2_state: formDataObject.parent2_state || "",
                parent2_zip: formDataObject.parent2_zip || "",
                emergency1_name: formDataObject.emergency1_name || "",
                emergency1_relationship: formDataObject.emergency1_relationship || "",
                emergency1_address: formDataObject.emergency1_address || "",
                emergency1_city: formDataObject.emergency1_city || "",
                emergency1_state: formDataObject.emergency1_state || "",
                emergency1_zip: formDataObject.emergency1_zip || "",
                emergency1_phone: formDataObject.emergency1_phone || "",
                emergency2_name: formDataObject.emergency2_name || "",
                emergency2_relationship: formDataObject.emergency2_relationship || "",
                emergency2_address: formDataObject.emergency2_address || "",
                emergency2_city: formDataObject.emergency2_city || "",
                emergency2_state: formDataObject.emergency2_state || "",
                emergency2_zip: formDataObject.emergency2_zip || "",
                emergency2_phone: formDataObject.emergency2_phone || "",
                family_doctor: formDataObject.family_doctor || "",
                family_dentist: formDataObject.family_dentist || "",
                medical_notes: formDataObject.medical_notes || "",
                residency_signature: formDataObject.residency_signature || "",
                residency_signature_date: formDataObject.residency_signature_date || ""
            };
        }

        return {
            form_id: form.id,
            student_last_name: "",
            student_first_name: "",
            student_middle_name: "",
            legal_last_name: "",
            present_grade: "",
            grade_entering: "",
            sex: "",
            birthdate: "",
            home_phone: "",
            home_language: "",
            primary_household: "both_parents",
            parent1_last: "",
            parent1_first: "",
            parent1_workplace: "",
            parent1_business_phone: "",
            parent1_cell_email: "",
            parent1_address: "",
            parent1_city: "",
            parent1_state: "",
            parent1_zip: "",
            parent2_last: "",
            parent2_first: "",
            parent2_workplace: "",
            parent2_business_phone: "",
            parent2_cell_email: "",
            parent2_address: "",
            parent2_city: "",
            parent2_state: "",
            parent2_zip: "",
            emergency1_name: "",
            emergency1_relationship: "",
            emergency1_address: "",
            emergency1_city: "",
            emergency1_state: "",
            emergency1_zip: "",
            emergency1_phone: "",
            emergency2_name: "",
            emergency2_relationship: "",
            emergency2_address: "",
            emergency2_city: "",
            emergency2_state: "",
            emergency2_zip: "",
            emergency2_phone: "",
            family_doctor: "",
            family_dentist: "",
            medical_notes: "",
            residency_signature: "",
            residency_signature_date: ""
        };
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    // Set form values after component mounts with loaded data
    useEffect(() => {
        const defaults = getDefaultValues();
        Object.keys(defaults).forEach(key => {
            rhForm.setValue(key as keyof FormValues, defaults[key as keyof FormValues]);
        });
    }, [formDataObject]);

    const handleInitialSubmit = (values: FormValues) => {
        setIsFormSubmitting(true);

        router.post(route("parent.forms.submit"), {
            ...values,
            student_id: student.id
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormSubmitting(false);
                toast.success("Form submitted successfully!");
            },
            onError: (errors) => {
                setIsFormSubmitting(false);
                toast.error("Failed to submit form. Please check the errors.");
            }
        });
    };

    const handleFieldUpdate = (fieldName: keyof FormValues, value: any) => {
        setIsFormSubmitting(true);

        // Send only the specific field being updated
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
                
                // Update the form value locally
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
        // Reset the field to its original value
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

    // Get comments for a specific field using shared helper
    const getFieldCommentsForField = (fieldName: string): Comment[] => {
        return getComments(commentsByField, fieldName);
    };

    // Check if there are unresolved comments using shared helper
    const hasUnresolvedCommentsOnForm = useMemo(() => {
        return checkUnresolvedComments(commentsByField, globalComments);
    }, [commentsByField, globalComments]);

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
                                {name == 'sex' ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="non_binary">Non-Binary</SelectItem>
                                            <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : name == 'grade_entering' ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value || ""}
                                        value={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string} className={isReadOnly ? "bg-gray-50" : ""}>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {!grades || grades.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No grades found
                                                </div>
                                            ) : (
                                                grades.map((grade: { id: number; name: string }) => (
                                                    <SelectItem key={grade.id} value={String(grade.id)}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : name === 'medical_notes' ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                    />
                                ) : name === 'residency_signature' ? (
                                    <SignatureInput
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onSignatureSaved={() => {
                                            // Auto-set signature date to today
                                            const today = new Date().toISOString().split('T')[0];
                                            rhForm.setValue('residency_signature_date', today);
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
                                        "Your form has been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your form has pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your form has been submitted. You can update it freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please complete all required fields marked with *."
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

                    {/* Student Information */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {renderFormField("student_last_name", "Last Name", true)}
                                    {renderFormField("student_first_name", "First Name", true)}
                                    {renderFormField("student_middle_name", "Middle Name")}
                                    {renderFormField("legal_last_name", "Legal Last Name")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {renderFormField("birthdate", "Birthdate", true)}
                                    {renderFormField("sex", "Sex", true)}
                                    {renderFormField("present_grade", "Present Grade", true)}
                                    {renderFormField("grade_entering", "Which Grade Will the Student be Entering?", true)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("home_phone", "Home Phone", true)}
                                    {renderFormField("home_language", "Home Language")}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Parent / Guardian 1 */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Parent / Guardian Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-10">
                            <div className="space-y-4">
                                <h6 className="text-sm font-bold">Parent / Guardian 1</h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("parent1_last", "Last Name", true)}
                                    {renderFormField("parent1_first", "First Name", true)}
                                    {renderFormField("parent1_workplace", "Workplace")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("parent1_business_phone", "Business Phone")}
                                    {renderFormField("parent1_cell_email", "Cell / Email", true)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("parent1_address", "Address", true)}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {renderFormField("parent1_city", "City", true)}
                                        {renderFormField("parent1_state", "State", true)}
                                        {renderFormField("parent1_zip", "ZIP", true)}
                                    </div>
                                </div>
                            </div>

                            {/* Parent / Guardian 2 */}
                            <div className="space-y-4">
                                <h6 className="text-sm font-bold">Parent / Guardian 2</h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("parent2_last", "Last Name")}
                                    {renderFormField("parent2_first", "First Name")}
                                    {renderFormField("parent2_workplace", "Workplace")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("parent2_business_phone", "Business Phone")}
                                    {renderFormField("parent2_cell_email", "Cell / Email")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("parent2_address", "Address")}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {renderFormField("parent2_city", "City")}
                                        {renderFormField("parent2_state", "State")}
                                        {renderFormField("parent2_zip", "ZIP")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency Contacts */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Emergency Contacts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h6 className="text-sm font-bold">Emergency Contact 1</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFormField("emergency1_name", "Name", true)}
                                {renderFormField("emergency1_relationship", "Relationship", true)}
                                {renderFormField("emergency1_phone", "Phone", true)}
                            </div>
                            
                            <h6 className="text-sm font-bold">Emergency Contact 2</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFormField("emergency2_name", "Name")}
                                {renderFormField("emergency2_relationship", "Relationship")}
                                {renderFormField("emergency2_phone", "Phone")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Medical Information */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Medical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("family_doctor", "Family Doctor", true)}
                                {renderFormField("family_dentist", "Family Dentist")}
                            </div>
                            {renderFormField("medical_notes", "Medical Notes / Allergies", true)}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Signature */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Signature</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("residency_signature", "Signature", true)}
                            {renderFormField("residency_signature_date", "Signature Date", true)}
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}