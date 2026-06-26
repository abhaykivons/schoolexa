// online-services-permissions.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useRHF } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, Monitor, Camera, Shield, BookOpen, MessageSquare, AlertCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectTrigger,
    SelectItem,
    SelectValue,
    SelectContent,
} from "@/components/ui/select";
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
    GlobalCommentsSection,
    FieldCommentsList,
    useCommentHandlers,
    hasUnresolvedComments as checkUnresolvedComments,
    getFieldComments as getComments 
} from "@/components/admission/CommentComponents";

// Signature component
import { SignatureInput } from "@/components/admission/SignatureInput";

// Validation schema
const schema = z.object({
    form_id: z.number().min(1),

    // Digital Learning Platforms Consent
    consent_digital_platforms: z.boolean().default(false),
    digital_platforms_scope: z.enum(["all_approved", "selected", "none"]).default("all_approved"),
    
    // Specific Platform Permissions
    platform_google_workspace: z.boolean().default(false),
    platform_google_notes: z.string().optional().or(z.literal("")),
    
    platform_microsoft_office: z.boolean().default(false),
    platform_microsoft_notes: z.string().optional().or(z.literal("")),
    
    platform_learning_management: z.boolean().default(false),
    platform_learning_management_notes: z.string().optional().or(z.literal("")),
    
    platform_educational_apps: z.boolean().default(false),
    platform_educational_apps_notes: z.string().optional().or(z.literal("")),
    
    platform_communication_tools: z.boolean().default(false),
    platform_communication_tools_notes: z.string().optional().or(z.literal("")),
    
    platform_assessment_tools: z.boolean().default(false),
    platform_assessment_tools_notes: z.string().optional().or(z.literal("")),

    // Additional Platform Requests
    additional_platforms: z.array(z.object({
        id: z.string(),
        platform_name: z.string().min(1, "Platform name is required"),
        platform_purpose: z.string().min(1, "Purpose is required"),
        data_shared: z.string().optional().or(z.literal("")),
        permission_granted: z.boolean().default(false)
    })).default([]),

    // Photo/Video Consent
    consent_photos_videos: z.enum(["full_consent", "limited_consent", "internal_only", "no_consent"]).default("full_consent"),
    
    // Specific Photo/Video Usage
    photos_classroom_use: z.boolean().default(true),
    photos_school_website: z.boolean().default(false),
    photos_social_media: z.boolean().default(false),
    photos_yearbook: z.boolean().default(true),
    photos_press_releases: z.boolean().default(false),
    photos_educational_materials: z.boolean().default(true),
    
    // Video Specific Permissions
    videos_classroom_use: z.boolean().default(true),
    videos_school_website: z.boolean().default(false),
    videos_social_media: z.boolean().default(false),
    videos_educational_materials: z.boolean().default(true),
    
    // Restrictions & Limitations
    photo_video_restrictions: z.string().optional().or(z.literal("")),
    specific_restrictions: z.string().optional().or(z.literal("")),

    // Technology Usage & Device Policies
    // School Device Usage
    school_device_usage: z.boolean().default(true),
    device_usage_guidelines: z.boolean().default(true),
    device_damage_responsibility: z.boolean().default(true),
    
    // Personal Device Usage (BYOD)
    byod_participation: z.boolean().default(false),
    byod_guidelines_acknowledged: z.boolean().default(false),
    byod_device_type: z.string().optional().or(z.literal("")),
    
    // Internet & Network Access
    internet_access_consent: z.boolean().default(true),
    filtered_internet_consent: z.boolean().default(true),
    network_guidelines_acknowledged: z.boolean().default(true),
    
    // Software & Application Usage
    educational_software_consent: z.boolean().default(true),
    software_installation_consent: z.boolean().default(false),
    cloud_storage_consent: z.boolean().default(true),

    // Data Privacy & Security
    // Data Collection Consent
    data_collection_consent: z.boolean().default(true),
    data_usage_purpose: z.enum(["educational_only", "research_improvement", "third_parties", "limited"]).default("educational_only"),
    
    // Third-Party Services
    third_party_data_sharing: z.boolean().default(false),
    third_party_restrictions: z.string().optional().or(z.literal("")),
    
    // Student Data Rights
    data_access_rights_acknowledged: z.boolean().default(true),
    data_deletion_requests: z.boolean().default(false),
    data_correction_rights: z.boolean().default(true),

    // Communication Tools
    // Email & Messaging
    student_email_account: z.boolean().default(true),
    educational_messaging: z.boolean().default(true),
    parent_communication_tools: z.boolean().default(true),
    
    // Video Conferencing
    video_conferencing_consent: z.boolean().default(true),
    recording_consent: z.boolean().default(false),
    virtual_classroom_participation: z.boolean().default(true),

    // Digital Citizenship & Safety
    digital_citizenship_training: z.boolean().default(true),
    online_safety_education: z.boolean().default(true),
    acceptable_use_agreement: z.boolean().default(true),
    cyberbullying_awareness: z.boolean().default(true),

    // Monitoring & Supervision
    activity_monitoring_consent: z.boolean().default(true),
    content_filtering_consent: z.boolean().default(true),
    privacy_limitations_acknowledged: z.boolean().default(true),

    // Duration & Review
    permission_duration: z.enum(["current_year", "while_enrolled", "annual_renewal"]).default("current_year"),
    review_reminder: z.boolean().default(true),
    
    // Emergency Override
    emergency_override_consent: z.boolean().default(true),

    // Parent/Guardian Agreement
    terms_acknowledged: z.boolean().refine(val => val === true, "You must acknowledge reading the terms"),
    guidelines_reviewed: z.boolean().refine(val => val === true, "You must confirm reviewing the guidelines"),
    signature: z.string().min(1, "Signature is required"),
    signature_date: z.string().min(1, "Signature date is required"),
    student_digital_agreement: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;
type AdditionalPlatform = {
    id: string;
    platform_name: string;
    platform_purpose: string;
    data_shared: string;
    permission_granted: boolean;
};

export default function OnlineServicesPermissionsForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    const [additionalPlatforms, setAdditionalPlatforms] = useState<AdditionalPlatform[]>([]);
    
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
    const [showPlatformForm, setShowPlatformForm] = useState(false);
    const [newPlatform, setNewPlatform] = useState<AdditionalPlatform>({
        id: "",
        platform_name: "",
        platform_purpose: "",
        data_shared: "",
        permission_granted: false
    });

    // Use formData for display (approved if available, otherwise latest)
    const formDataObject = useMemo(() => formData || {}, [formData]);
    
    // Check if there are pending changes (latest_data differs from approved_data)
    const hasPendingChanges = useMemo(() => {
        if (!approvedData || !latestData) return false;
        return JSON.stringify(approvedData) !== JSON.stringify(latestData);
    }, [approvedData, latestData]);
    
    // Check if form is approved
    const isApproved = admissionForm?.status === 'approved';

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

    // Load data on mount
    useEffect(() => {
        // Load additional platforms from form data
        if (formDataObject.additional_platforms) {
            const parsedPlatforms = parseArrayData(formDataObject.additional_platforms);
            setAdditionalPlatforms(parsedPlatforms);
        }

        // Set form values after component mounts
        const defaultValues = getDefaultValues();
        Object.keys(defaultValues).forEach(key => {
            rhForm.setValue(key as keyof FormValues, defaultValues[key as keyof FormValues]);
        });
    }, [formDataObject]);

    // Get default values for the form
    const getDefaultValues = (): FormValues => {
        // Get schema defaults by parsing with minimal data
        const defaults: any = {
            form_id: form.id,
            consent_digital_platforms: false,
            digital_platforms_scope: "all_approved",
            platform_google_workspace: false,
            platform_google_notes: "",
            platform_microsoft_office: false,
            platform_microsoft_notes: "",
            platform_learning_management: false,
            platform_learning_management_notes: "",
            platform_educational_apps: false,
            platform_educational_apps_notes: "",
            platform_communication_tools: false,
            platform_communication_tools_notes: "",
            platform_assessment_tools: false,
            platform_assessment_tools_notes: "",
            additional_platforms: [],
            consent_photos_videos: "full_consent",
            photos_classroom_use: true,
            photos_school_website: false,
            photos_social_media: false,
            photos_yearbook: true,
            photos_press_releases: false,
            photos_educational_materials: true,
            videos_classroom_use: true,
            videos_school_website: false,
            videos_social_media: false,
            videos_educational_materials: true,
            photo_video_restrictions: "",
            specific_restrictions: "",
            school_device_usage: true,
            device_usage_guidelines: true,
            device_damage_responsibility: true,
            byod_participation: false,
            byod_guidelines_acknowledged: false,
            byod_device_type: "",
            internet_access_consent: true,
            filtered_internet_consent: true,
            network_guidelines_acknowledged: true,
            educational_software_consent: true,
            software_installation_consent: false,
            cloud_storage_consent: true,
            data_collection_consent: true,
            data_usage_purpose: "educational_only",
            third_party_data_sharing: false,
            third_party_restrictions: "",
            data_access_rights_acknowledged: true,
            data_deletion_requests: false,
            data_correction_rights: true,
            student_email_account: true,
            educational_messaging: true,
            parent_communication_tools: true,
            video_conferencing_consent: true,
            recording_consent: false,
            virtual_classroom_participation: true,
            digital_citizenship_training: true,
            online_safety_education: true,
            acceptable_use_agreement: true,
            cyberbullying_awareness: true,
            activity_monitoring_consent: true,
            content_filtering_consent: true,
            privacy_limitations_acknowledged: true,
            permission_duration: "current_year",
            review_reminder: true,
            emergency_override_consent: true,
            terms_acknowledged: false,
            guidelines_reviewed: false,
            signature: "",
            signature_date: "",
            student_digital_agreement: false,
        };
        
        // Merge with formDataObject (already denormalized from backend)
        // Make sure array fields are properly parsed
        return {
            ...defaults,
            ...formDataObject,
            additional_platforms: parseArrayData(formDataObject.additional_platforms) || additionalPlatforms,
        } as FormValues;
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    // Watch for important field changes
    const consentDigitalPlatforms = rhForm.watch("consent_digital_platforms");
    const digitalPlatformsScope = rhForm.watch("digital_platforms_scope");
    const consentPhotosVideos = rhForm.watch("consent_photos_videos");
    const byodParticipation = rhForm.watch("byod_participation");
    const thirdPartyDataSharing = rhForm.watch("third_party_data_sharing");
    const recordingConsent = rhForm.watch("recording_consent");

    // Additional Platforms Management
    const addAdditionalPlatform = () => {
        if (newPlatform.platform_name.trim() && newPlatform.platform_purpose.trim()) {
            const platform = {
                ...newPlatform,
                id: Math.random().toString(36).substr(2, 9)
            };
            const updatedPlatforms = [...additionalPlatforms, platform];
            setAdditionalPlatforms(updatedPlatforms);
            rhForm.setValue("additional_platforms", updatedPlatforms);
            
            setNewPlatform({
                id: "",
                platform_name: "",
                platform_purpose: "",
                data_shared: "",
                permission_granted: false
            });
            setShowPlatformForm(false);
            
            handleFieldUpdate("additional_platforms", updatedPlatforms);
        }
    };

    const removeAdditionalPlatform = (id: string) => {
        const updatedPlatforms = additionalPlatforms.filter(platform => platform.id !== id);
        setAdditionalPlatforms(updatedPlatforms);
        rhForm.setValue("additional_platforms", updatedPlatforms);
        handleFieldUpdate("additional_platforms", updatedPlatforms);
    };

    const handleInitialSubmit = async (values: FormValues) => {
        setIsFormSubmitting(true);

        try {
            const submitData = {
                ...values,
                student_id: student.id,
                additional_platforms: additionalPlatforms
            };

            await router.post(route("parent.forms.submit"), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormSubmitting(false);
                    toast.success("Online Services Permissions submitted successfully!");
                },
                onError: (errors) => {
                    setIsFormSubmitting(false);
                    console.error("Submission errors:", errors);
                    toast.error("Failed to submit form. Please check the errors.");
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const handleFieldUpdate = async (fieldName: keyof FormValues, value: any) => {
        setIsFormSubmitting(true);

        try {
            const updateData = {
                form_id: form.id,
                student_id: student.id,
                key: fieldName,
                value: value
            };

            await router.post(route("parent.forms.submit"), updateData, {
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
                    console.error("Field update error:", errors);
                    toast.error("Failed to update field. Please check the errors.");
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            console.error("Field update error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const startEditing = (fieldName: string) => {
        setEditingField(fieldName);
    };

    const cancelEditing = () => {
        setEditingField(null);
        if (editingField) {
            rhForm.resetField(editingField as any);
        }
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

    // Checkbox Field component
    const CheckboxField: React.FC<{
        name: keyof FormValues;
        label: string;
        required?: boolean;
    }> = ({ name, label, required = false }) => (
        <FormField
            control={rhForm.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitted && !editingField}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <Label>
                            {label} {required && <span className="text-red-500">*</span>}
                        </Label>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    // Render form field based on type and editing state
    const renderFormField = (name: keyof FormValues, label: string, required: boolean = false, alwaysShow: boolean = false) => {
        const isEditing = editingField === name;
        const isReadOnly = isSubmitted && !isEditing;

        // Determine if field should be shown based on parent conditions
        const shouldShow = alwaysShow || 
            (name.includes('platform_') && name.includes('_notes') && rhForm.watch(name.replace('_notes', '') as keyof FormValues)) ||
            (name === 'digital_platforms_scope' && consentDigitalPlatforms) ||
            (name.includes('photos_') && !consentPhotosVideos.includes('no_consent')) ||
            (name.includes('videos_') && !consentPhotosVideos.includes('no_consent')) ||
            (name.includes('photo_video_restrictions') && !consentPhotosVideos.includes('no_consent')) ||
            (name.includes('specific_restrictions') && !consentPhotosVideos.includes('no_consent')) ||
            (name === 'byod_device_type' && byodParticipation) ||
            (name === 'third_party_restrictions' && thirdPartyDataSharing) ||
            alwaysShow;

        if (!shouldShow) {
            return null;
        }

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
                                {name.includes('scope') || name.includes('consent_photos') || name.includes('purpose') || name.includes('duration') ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {name === 'digital_platforms_scope' ? (
                                                <>
                                                    <SelectItem value="all_approved">All Approved Platforms</SelectItem>
                                                    <SelectItem value="selected">Selected Platforms Only</SelectItem>
                                                    <SelectItem value="none">No Digital Platforms</SelectItem>
                                                </>
                                            ) : name === 'consent_photos_videos' ? (
                                                <>
                                                    <SelectItem value="full_consent">Full Consent</SelectItem>
                                                    <SelectItem value="limited_consent">Limited Consent</SelectItem>
                                                    <SelectItem value="internal_only">Internal Use Only</SelectItem>
                                                    <SelectItem value="no_consent">No Consent</SelectItem>
                                                </>
                                            ) : name === 'data_usage_purpose' ? (
                                                <>
                                                    <SelectItem value="educational_only">Educational Purposes Only</SelectItem>
                                                    <SelectItem value="research_improvement">Research & Improvement</SelectItem>
                                                    <SelectItem value="third_parties">Third-Party Services</SelectItem>
                                                    <SelectItem value="limited">Limited Specific Uses</SelectItem>
                                                </>
                                            ) : name === 'permission_duration' ? (
                                                <>
                                                    <SelectItem value="current_year">Current School Year</SelectItem>
                                                    <SelectItem value="while_enrolled">While Enrolled</SelectItem>
                                                    <SelectItem value="annual_renewal">Annual Renewal Required</SelectItem>
                                                </>
                                            ) : null}
                                        </SelectContent>
                                    </Select>
                                ) : ['photo_video_restrictions', 'specific_restrictions', 'third_party_restrictions', 
                                    'platform_google_notes', 'platform_microsoft_notes', 'platform_learning_management_notes',
                                    'platform_educational_apps_notes', 'platform_communication_tools_notes', 'platform_assessment_tools_notes'].includes(name as string) ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                        value={field.value as string}
                                    />
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
                                        value={field.value as string}
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

    // Platform Card Component
    const PlatformCard: React.FC<{
        platform: AdditionalPlatform;
        onRemove: (id: string) => void;
    }> = ({ platform, onRemove }) => (
        <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">{platform.platform_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                            platform.permission_granted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {platform.permission_granted ? 'Approved' : 'Pending'}
                        </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                        <div><strong>Purpose:</strong> {platform.platform_purpose}</div>
                        {platform.data_shared && (
                            <div><strong>Data Shared:</strong> {platform.data_shared}</div>
                        )}
                    </div>
                </div>
                
                {!isSubmitted && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(platform.id)}
                    >
                        <X className="h-4 w-4 text-red-500" />
                    </Button>
                )}
            </div>
        </Card>
    );

    // Platform Form Component
    const PlatformForm: React.FC<{
        platform: AdditionalPlatform;
        onChange: (platform: AdditionalPlatform) => void;
        onSave: () => void;
        onCancel: () => void;
    }> = ({ platform, onChange, onSave, onCancel }) => (
        <Card className="p-4 border border-blue-200">
            <h4 className="font-medium mb-4">Request Additional Platform</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    placeholder="Platform Name"
                    value={platform.platform_name}
                    onChange={(e) => onChange({...platform, platform_name: e.target.value})}
                />
                <Input
                    placeholder="Educational Purpose"
                    value={platform.platform_purpose}
                    onChange={(e) => onChange({...platform, platform_purpose: e.target.value})}
                />
                <Input
                    placeholder="Data to be Shared (Optional)"
                    className="md:col-span-2"
                    value={platform.data_shared}
                    onChange={(e) => onChange({...platform, data_shared: e.target.value})}
                />
                <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                        checked={platform.permission_granted}
                        onCheckedChange={(checked) => 
                            onChange({...platform, permission_granted: checked as boolean})
                        }
                    />
                    <Label>Grant permission for this platform</Label>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Button type="button" onClick={onSave} size="sm">
                    Add Platform
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} size="sm">
                    Cancel
                </Button>
            </div>
        </Card>
    );

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <Head title={`${form.name}`} />
            
            {/* Main Form */}
            <Form {...rhForm}>
                <form onSubmit={rhForm.handleSubmit(handleInitialSubmit, onFormInvalid)} className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-6">
                    <input type="hidden" {...rhForm.register("form_id")} />

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
                                        "Your online services permissions have been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your permissions have pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your permissions have been submitted. You can update them freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please review and select permissions for digital learning platforms, photo/video usage, and technology services."
                                )}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {!isSubmitted && (
                                <Button 
                                    type="submit" 
                                    disabled={isFormSubmitting}
                                >
                                    {isFormSubmitting ? "Submitting..." : "Submit Permissions"}
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

                    {/* Digital Learning Platforms */}
                    <Card className="shadow-none border-0 border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="text-blue-700 flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                Digital Learning Platforms
                            </CardTitle>
                            <p className="text-sm text-gray-600">Permissions for educational software and online tools</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <CheckboxField 
                                name="consent_digital_platforms" 
                                label="I consent to my child using digital learning platforms for educational purposes" 
                            />

                            {consentDigitalPlatforms && (
                                <>
                                    {renderFormField("digital_platforms_scope", "Platform Access Scope", true)}

                                    {/* Standard Platform Options */}
                                    {digitalPlatformsScope !== "none" && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Standard Educational Platforms</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <CheckboxField name="platform_google_workspace" label="Google Workspace for Education" />
                                                    <CheckboxField name="platform_microsoft_office" label="Microsoft Office 365" />
                                                    <CheckboxField name="platform_learning_management" label="Learning Management System" />
                                                </div>
                                                <div className="space-y-4">
                                                    <CheckboxField name="platform_educational_apps" label="Educational Apps & Games" />
                                                    <CheckboxField name="platform_communication_tools" label="Communication Tools" />
                                                    <CheckboxField name="platform_assessment_tools" label="Assessment & Testing Tools" />
                                                </div>
                                            </div>

                                            {/* Platform Notes */}
                                            <div className="space-y-3">
                                                {renderFormField("platform_google_notes", "Google Workspace Notes")}
                                                {renderFormField("platform_microsoft_notes", "Microsoft Office Notes")}
                                                {renderFormField("platform_learning_management_notes", "LMS Notes")}
                                                {renderFormField("platform_educational_apps_notes", "Educational Apps Notes")}
                                                {renderFormField("platform_communication_tools_notes", "Communication Tools Notes")}
                                                {renderFormField("platform_assessment_tools_notes", "Assessment Tools Notes")}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Platforms */}
                                    {digitalPlatformsScope === "selected" && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">Additional Platform Requests</h4>
                                                {!isSubmitted && (
                                                    <Button 
                                                        type="button"
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setShowPlatformForm(true)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Platform
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            {showPlatformForm && (
                                                <PlatformForm
                                                    platform={newPlatform}
                                                    onChange={setNewPlatform}
                                                    onSave={addAdditionalPlatform}
                                                    onCancel={() => setShowPlatformForm(false)}
                                                />
                                            )}
                                            
                                            {additionalPlatforms.length > 0 ? (
                                                <div className="space-y-3">
                                                    {additionalPlatforms.map((platform) => (
                                                        <PlatformCard
                                                            key={platform.id}
                                                            platform={platform}
                                                            onRemove={removeAdditionalPlatform}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    No additional platforms requested yet.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Photo & Video Consent */}
                    <Card className="shadow-none border-0 border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle className="text-green-700 flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Photo & Video Consent
                            </CardTitle>
                            <p className="text-sm text-gray-600">Permissions for student image and video usage</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {renderFormField("consent_photos_videos", "Photo & Video Consent Level", true, true)}

                            {!consentPhotosVideos.includes('no_consent') && (
                                <>
                                    {/* Photo Usage Permissions */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Photo Usage Permissions</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <CheckboxField name="photos_classroom_use" label="Classroom Displays & Projects" />
                                                <CheckboxField name="photos_school_website" label="School Website" />
                                                <CheckboxField name="photos_social_media" label="Social Media" />
                                            </div>
                                            <div className="space-y-3">
                                                <CheckboxField name="photos_yearbook" label="Yearbook & Memory Books" />
                                                <CheckboxField name="photos_press_releases" label="Press Releases & News" />
                                                <CheckboxField name="photos_educational_materials" label="Educational Materials" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Usage Permissions */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Video Usage Permissions</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <CheckboxField name="videos_classroom_use" label="Classroom Instruction" />
                                                <CheckboxField name="videos_school_website" label="School Website" />
                                                <CheckboxField name="videos_social_media" label="Social Media" />
                                            </div>
                                            <div className="space-y-3">
                                                <CheckboxField name="videos_educational_materials" label="Educational Materials" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Restrictions */}
                                    <div className="space-y-4">
                                        {renderFormField("photo_video_restrictions", "General Photo/Video Restrictions")}
                                        {renderFormField("specific_restrictions", "Specific Usage Restrictions")}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Technology Usage & Device Policies */}
                    <Card className="shadow-none border-0 border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="text-purple-700 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Technology Usage & Device Policies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* School Device Usage */}
                            <div className="space-y-4">
                                <h4 className="font-medium">School-Issued Devices</h4>
                                <CheckboxField name="school_device_usage" label="My child may use school-issued devices" />
                                <CheckboxField name="device_usage_guidelines" label="We have reviewed device usage guidelines" />
                                <CheckboxField name="device_damage_responsibility" label="We accept responsibility for damage beyond normal wear" />
                            </div>

                            {/* BYOD Program */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Bring Your Own Device (BYOD)</h4>
                                <CheckboxField name="byod_participation" label="My child will participate in BYOD program" />
                                {byodParticipation && (
                                    <>
                                        <CheckboxField name="byod_guidelines_acknowledged" label="We have reviewed BYOD guidelines" />
                                        {renderFormField("byod_device_type", "Device Type (e.g., laptop, tablet)")}
                                    </>
                                )}
                            </div>

                            {/* Internet & Network */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Internet & Network Access</h4>
                                <CheckboxField name="internet_access_consent" label="Consent to filtered internet access" />
                                <CheckboxField name="filtered_internet_consent" label="Acknowledge internet content filtering" />
                                <CheckboxField name="network_guidelines_acknowledged" label="Accept network usage guidelines" />
                            </div>

                            {/* Software & Applications */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Software & Applications</h4>
                                <CheckboxField name="educational_software_consent" label="Consent to educational software installation" />
                                <CheckboxField name="software_installation_consent" label="Allow necessary software updates" />
                                <CheckboxField name="cloud_storage_consent" label="Consent to cloud storage for school work" />
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Data Privacy & Security */}
                    <Card className="shadow-none border-0 border-l-4 border-l-orange-500">
                        <CardHeader>
                            <CardTitle className="text-orange-700">Data Privacy & Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Data Collection */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Data Collection & Usage</h4>
                                <CheckboxField name="data_collection_consent" label="Consent to educational data collection" />
                                {renderFormField("data_usage_purpose", "Data Usage Purpose", true, true)}
                            </div>

                            {/* Third-Party Services */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Third-Party Services</h4>
                                <CheckboxField name="third_party_data_sharing" label="Allow limited data sharing with educational partners" />
                                {renderFormField("third_party_restrictions", "Third-Party Restrictions")}
                            </div>

                            {/* Student Data Rights */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Student Data Rights</h4>
                                <CheckboxField name="data_access_rights_acknowledged" label="Acknowledge right to access student data" />
                                <CheckboxField name="data_deletion_requests" label="Reserve right to request data deletion" />
                                <CheckboxField name="data_correction_rights" label="Acknowledge right to correct inaccurate data" />
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Communication & Digital Citizenship */}
                    <Card className="shadow-none border-0 border-l-4 border-l-cyan-500">
                        <CardHeader>
                            <CardTitle className="text-cyan-700 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Communication & Digital Citizenship
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Communication Tools */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Communication Tools</h4>
                                <CheckboxField name="student_email_account" label="School-provided student email account" />
                                <CheckboxField name="educational_messaging" label="Educational messaging platforms" />
                                <CheckboxField name="parent_communication_tools" label="Parent communication tools" />
                            </div>

                            {/* Video Conferencing */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Video Conferencing</h4>
                                <CheckboxField name="video_conferencing_consent" label="Virtual classroom participation" />
                                <CheckboxField name="recording_consent" label="Consent to session recording for absent students" />
                                <CheckboxField name="virtual_classroom_participation" label="Active participation in virtual classes" />
                            </div>

                            {/* Digital Citizenship */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Digital Citizenship Education</h4>
                                <CheckboxField name="digital_citizenship_training" label="Support digital citizenship education" />
                                <CheckboxField name="online_safety_education" label="Online safety and responsibility training" />
                                <CheckboxField name="acceptable_use_agreement" label="Acceptable Use Policy agreement" />
                                <CheckboxField name="cyberbullying_awareness" label="Cyberbullying prevention education" />
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Monitoring & Agreement */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Monitoring, Duration & Agreement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Monitoring & Supervision */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Monitoring & Supervision</h4>
                                <CheckboxField name="activity_monitoring_consent" label="Consent to appropriate activity monitoring" />
                                <CheckboxField name="content_filtering_consent" label="Support content filtering for safety" />
                                <CheckboxField name="privacy_limitations_acknowledged" label="Acknowledge limited privacy in school environment" />
                            </div>

                            {/* Duration & Review */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Permission Duration</h4>
                                {renderFormField("permission_duration", "Permission Duration", true, true)}
                                <CheckboxField name="review_reminder" label="Send annual permission review reminder" />
                                <CheckboxField name="emergency_override_consent" label="Emergency safety override consent" />
                            </div>

                            {/* Parent/Guardian Agreement */}
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">Parent/Guardian Agreement</h4>
                                <CheckboxField 
                                    name="terms_acknowledged" 
                                    label="I have read and understand the Technology Acceptable Use Policy and Privacy Guidelines" 
                                    required 
                                />
                                <CheckboxField 
                                    name="guidelines_reviewed" 
                                    label="I have reviewed these permissions with my child and discussed responsible technology use" 
                                    required 
                                />
                                <CheckboxField 
                                    name="student_digital_agreement" 
                                    label="My child agrees to follow the school's digital citizenship guidelines" 
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {renderFormField("signature", "Parent/Guardian Signature", true, true)}
                                    {renderFormField("signature_date", "Date", true, true)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}