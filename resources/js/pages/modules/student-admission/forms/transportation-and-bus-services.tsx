// transportation.tsx
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
 * Validation schema for Transportation & Bus Services
 */
const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const schema = z.object({
    // Form ID
    form_id: z.number().min(1),

    // Transportation Needs
    needs_transportation: z.enum(["yes", "no"]).refine(val => val !== undefined, "This field is required"),
    transportation_type: z.string().optional().or(z.literal("")),
    
    // Bus Service Preferences
    bus_service_required: z.enum(["full_time", "occasional", "not_required"]).optional().or(z.literal("not_required")),
    preferred_bus_route: z.string().optional().or(z.literal("")),
    alternative_bus_route: z.string().optional().or(z.literal("")),
    
    // Pickup Details
    morning_pickup_required: z.boolean().default(false),
    morning_pickup_address: z.string().optional().or(z.literal("")),
    morning_pickup_time: z.string().optional().or(z.literal("")),
    morning_pickup_contact: z.string().optional().or(z.literal("")),
    morning_pickup_phone: z.string().optional().refine((v) => !v || phoneRegex.test(v), "Invalid phone number"),
    
    // Dropoff Details
    afternoon_dropoff_required: z.boolean().default(false),
    afternoon_dropoff_address: z.string().optional().or(z.literal("")),
    afternoon_dropoff_time: z.string().optional().or(z.literal("")),
    afternoon_dropoff_contact: z.string().optional().or(z.literal("")),
    afternoon_dropoff_phone: z.string().optional().refine((v) => !v || phoneRegex.test(v), "Invalid phone number"),
    
    // Special Requirements
    special_needs: z.string().optional().or(z.literal("")),
    medical_conditions: z.string().optional().or(z.literal("")),
    assistance_required: z.boolean().default(false),
    assistance_details: z.string().optional().or(z.literal("")),
    
    // Emergency Contacts for Transportation
    transportation_emergency_name: z.string().optional().or(z.literal("")),
    transportation_emergency_relationship: z.string().optional().or(z.literal("")),
    transportation_emergency_phone: z.string().optional().refine((v) => !v || phoneRegex.test(v), "Invalid phone number"),
    
    // Authorization
    authorized_persons: z.string().min(1, "Please list authorized persons for pickup").optional().or(z.literal("")),
    photo_release: z.boolean().default(false),
    terms_accepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    
    // Signature
    signature: z.string().min(1, "Signature is required").refine((v) => !v || v.trim().length >= 2, "Signature too short"),
    signature_date: z.string().min(1, "Signature date is required").refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
});

type FormValues = z.infer<typeof schema>;

export default function TransportationForm() {
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
    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (hasData) {
            // Use formDataObject directly (already denormalized)
            return {
                form_id: form.id,
                ...formDataObject,
            } as FormValues;
        }

        return {
            form_id: form.id,
            needs_transportation: "" as "yes" | "no",
            transportation_type: "",
            bus_service_required: "not_required",
            preferred_bus_route: "",
            alternative_bus_route: "",
            morning_pickup_required: false,
            morning_pickup_address: "",
            morning_pickup_time: "",
            morning_pickup_contact: "",
            morning_pickup_phone: "",
            afternoon_dropoff_required: false,
            afternoon_dropoff_address: "",
            afternoon_dropoff_time: "",
            afternoon_dropoff_contact: "",
            afternoon_dropoff_phone: "",
            special_needs: "",
            medical_conditions: "",
            assistance_required: false,
            assistance_details: "",
            transportation_emergency_name: "",
            transportation_emergency_relationship: "",
            transportation_emergency_phone: "",
            authorized_persons: "",
            photo_release: false,
            terms_accepted: false,
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
                toast.success("Transportation form submitted successfully!");
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
                                {name === 'needs_transportation' || name === 'bus_service_required' ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {name === 'needs_transportation' ? (
                                                <>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="full_time">Full Time</SelectItem>
                                                    <SelectItem value="occasional">Occasional</SelectItem>
                                                    <SelectItem value="not_required">Not Required</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : name === 'special_needs' || name === 'medical_conditions' || name === 'assistance_details' || name === 'authorized_persons' ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                    />
                                ) : name === 'morning_pickup_required' || name === 'afternoon_dropoff_required' || name === 'assistance_required' || name === 'photo_release' || name === 'terms_accepted' ? (
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
                                        type={name.includes('time') ? 'time' : name.includes('date') ? 'date' : 'text'}
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
                                        "Your transportation form has been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your transportation form has pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your transportation form has been submitted. You can update it freely until school approval. Click the edit icon next to any field to update it."
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

                    {/* Transportation Needs */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Transportation Needs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("needs_transportation", "Does the student need transportation?", true)}
                                {renderFormField("transportation_type", "Preferred transportation type")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Bus Service Preferences */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Bus Service Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("bus_service_required", "Bus service required")}
                                {renderFormField("preferred_bus_route", "Preferred bus route")}
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {renderFormField("alternative_bus_route", "Alternative bus route")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Morning Pickup Details */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Morning Pickup Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("morning_pickup_required", "Morning pickup required")}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("morning_pickup_address", "Pickup address")}
                                {renderFormField("morning_pickup_time", "Preferred pickup time")}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("morning_pickup_contact", "Contact person at pickup")}
                                {renderFormField("morning_pickup_phone", "Contact phone")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Afternoon Dropoff Details */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Afternoon Dropoff Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("afternoon_dropoff_required", "Afternoon dropoff required")}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("afternoon_dropoff_address", "Dropoff address")}
                                {renderFormField("afternoon_dropoff_time", "Preferred dropoff time")}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("afternoon_dropoff_contact", "Contact person at dropoff")}
                                {renderFormField("afternoon_dropoff_phone", "Contact phone")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Special Requirements */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Special Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {renderFormField("special_needs", "Special transportation needs")}
                                {renderFormField("medical_conditions", "Medical conditions affecting transportation")}
                            </div>
                            <div className="space-y-4">
                                {renderFormField("assistance_required", "Requires assistance during transportation")}
                                {renderFormField("assistance_details", "Assistance details")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency Contact for Transportation */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Transportation Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFormField("transportation_emergency_name", "Emergency contact name")}
                                {renderFormField("transportation_emergency_relationship", "Relationship")}
                                {renderFormField("transportation_emergency_phone", "Emergency phone")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Authorization */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Authorization & Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {renderFormField("authorized_persons", "Authorized persons for pickup (list all)", true)}
                                {renderFormField("photo_release", "I authorize the school to take photos for transportation purposes")}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    I understand that bus transportation is a privilege and may be revoked for misconduct. 
                                    I agree to follow all school transportation policies and procedures. I acknowledge that 
                                    changes to transportation arrangements require 24 hours notice.
                                </p>
                                {renderFormField("terms_accepted", "I accept the terms and conditions", true)}
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