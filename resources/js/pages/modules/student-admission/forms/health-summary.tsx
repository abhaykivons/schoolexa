import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, MessageSquare, AlertCircle } from "lucide-react";
import { useFormValidation } from "@/hooks/use-form-validation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const schema = z.object({
    form_id: z.number().min(1),
    has_chronic_illnesses: z.boolean().default(false),
    chronic_illnesses_details: z.string().optional().or(z.literal("")),
    has_hospitalizations: z.boolean().default(false),
    hospitalizations_details: z.string().optional().or(z.literal("")),
    has_surgeries: z.boolean().default(false),
    surgeries_details: z.string().optional().or(z.literal("")),
    has_physical_limitations: z.boolean().default(false),
    physical_limitations_details: z.string().optional().or(z.literal("")),
    immunization_up_to_date: z.boolean().default(false),
    immunization_exemptions: z.string().optional().or(z.literal("")),
    has_drug_allergies: z.boolean().default(false),
    drug_allergies_details: z.string().optional().or(z.literal("")),
    has_food_allergies: z.boolean().default(false),
    food_allergies_details: z.string().optional().or(z.literal("")),
    has_environmental_allergies: z.boolean().default(false),
    environmental_allergies_details: z.string().optional().or(z.literal("")),
    has_insect_allergies: z.boolean().default(false),
    insect_allergies_details: z.string().optional().or(z.literal("")),
    allergy_severity: z.enum(["mild", "moderate", "severe", "anaphylactic", ""]).optional().or(z.literal("")),
    allergy_emergency_plan: z.string().optional().or(z.literal("")),
    takes_regular_medications: z.boolean().default(false),
    uses_emergency_meds: z.boolean().default(false),
    emergency_medications: z.string().optional().or(z.literal("")),
    primary_care_physician: z.string().min(1, "Primary care physician is required"),
    physician_phone: z.string().min(1, "Physician phone is required").refine((v) => phoneRegex.test(v), "Invalid phone"),
    insurance_company: z.string().min(1, "Insurance company is required"),
    policy_number: z.string().min(1, "Policy number is required"),
    group_number: z.string().optional().or(z.literal("")),
    special_dietary_needs: z.string().optional().or(z.literal("")),
    activity_restrictions: z.string().optional().or(z.literal("")),
    additional_notes: z.string().optional().or(z.literal("")),
    consent_medical_treatment: z.boolean().refine(val => val === true, "Consent for emergency medical treatment is required"),
    consent_share_info: z.boolean().default(false),
    signature: z.string().min(1, "Signature is required"),
    signature_date: z.string().min(1, "Signature date is required"),
});

type FormValues = z.infer<typeof schema>;

type Medication = {
    name: string;
    dosage: string;
    frequency: string;
    reason: string;
    prescribed_by: string;
};

const MEDICATION_ROWS = 10;

// Note: Data is already denormalized from backend via AdmissionFormHelper::denormalizeFormData()

export default function HealthSummaryForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    const [medications, setMedications] = useState<Medication[]>(
        Array(MEDICATION_ROWS).fill(null).map(() => ({
            name: "", dosage: "", frequency: "", reason: "", prescribed_by: ""
        }))
    );
    
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
    // formData is already the correct data to show based on approval status
    const formDataObject = useMemo(() => formData || {}, [formData]);
    
    // Check if there are pending changes (latest_data differs from approved_data)
    const hasPendingChanges = useMemo(() => {
        if (!approvedData || !latestData) return false;
        return JSON.stringify(approvedData) !== JSON.stringify(latestData);
    }, [approvedData, latestData]);
    
    // Check if form is approved
    const isApproved = admissionForm?.status === 'approved';

    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (!hasData) {
            return {
                form_id: form.id,
                has_chronic_illnesses: false,
                chronic_illnesses_details: "",
                has_hospitalizations: false,
                hospitalizations_details: "",
                has_surgeries: false,
                surgeries_details: "",
                has_physical_limitations: false,
                physical_limitations_details: "",
                immunization_up_to_date: false,
                immunization_exemptions: "",
                has_drug_allergies: false,
                drug_allergies_details: "",
                has_food_allergies: false,
                food_allergies_details: "",
                has_environmental_allergies: false,
                environmental_allergies_details: "",
                has_insect_allergies: false,
                insect_allergies_details: "",
                allergy_severity: "",
                allergy_emergency_plan: "",
                takes_regular_medications: false,
                uses_emergency_meds: false,
                emergency_medications: "",
                primary_care_physician: "",
                physician_phone: "",
                insurance_company: "",
                policy_number: "",
                group_number: "",
                special_dietary_needs: "",
                activity_restrictions: "",
                additional_notes: "",
                consent_medical_treatment: false,
                consent_share_info: false,
                signature: "",
                signature_date: ""
            };
        }

        return {
            form_id: form.id,
            has_chronic_illnesses: formDataObject.has_chronic_illnesses ?? false,
            chronic_illnesses_details: formDataObject.chronic_illnesses_details || "",
            has_hospitalizations: formDataObject.has_hospitalizations ?? false,
            hospitalizations_details: formDataObject.hospitalizations_details || "",
            has_surgeries: formDataObject.has_surgeries ?? false,
            surgeries_details: formDataObject.surgeries_details || "",
            has_physical_limitations: formDataObject.has_physical_limitations ?? false,
            physical_limitations_details: formDataObject.physical_limitations_details || "",
            immunization_up_to_date: formDataObject.immunization_up_to_date ?? false,
            immunization_exemptions: formDataObject.immunization_exemptions || "",
            has_drug_allergies: formDataObject.has_drug_allergies ?? false,
            drug_allergies_details: formDataObject.drug_allergies_details || "",
            has_food_allergies: formDataObject.has_food_allergies ?? false,
            food_allergies_details: formDataObject.food_allergies_details || "",
            has_environmental_allergies: formDataObject.has_environmental_allergies ?? false,
            environmental_allergies_details: formDataObject.environmental_allergies_details || "",
            has_insect_allergies: formDataObject.has_insect_allergies ?? false,
            insect_allergies_details: formDataObject.insect_allergies_details || "",
            allergy_severity: formDataObject.allergy_severity || "",
            allergy_emergency_plan: formDataObject.allergy_emergency_plan || "",
            takes_regular_medications: formDataObject.takes_regular_medications ?? false,
            uses_emergency_meds: formDataObject.uses_emergency_meds ?? false,
            emergency_medications: formDataObject.emergency_medications || "",
            primary_care_physician: formDataObject.primary_care_physician || "",
            physician_phone: formDataObject.physician_phone || "",
            insurance_company: formDataObject.insurance_company || "",
            policy_number: formDataObject.policy_number || "",
            group_number: formDataObject.group_number || "",
            special_dietary_needs: formDataObject.special_dietary_needs || "",
            activity_restrictions: formDataObject.activity_restrictions || "",
            additional_notes: formDataObject.additional_notes || "",
            consent_medical_treatment: formDataObject.consent_medical_treatment ?? false,
            consent_share_info: formDataObject.consent_share_info ?? false,
            signature: formDataObject.signature || "",
            signature_date: formDataObject.signature_date || ""
        };
    };

    const formHook = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: getDefaultValues(),
        mode: 'onChange'
    });

    // Load data on mount
    useEffect(() => {
        // Load medications (handle both string and array data)
        if (formDataObject.medications) {
            let medicationsData = formDataObject.medications;
            
            // Parse if it's a JSON string
            if (typeof medicationsData === 'string') {
                try {
                    medicationsData = JSON.parse(medicationsData);
                } catch {
                    medicationsData = [];
                }
            }
            
            if (Array.isArray(medicationsData)) {
                const mergedMeds = Array(MEDICATION_ROWS).fill(null).map((_, index) => ({
                    name: medicationsData[index]?.name || "",
                    dosage: medicationsData[index]?.dosage || "",
                    frequency: medicationsData[index]?.frequency || "",
                    reason: medicationsData[index]?.reason || "",
                    prescribed_by: medicationsData[index]?.prescribed_by || ""
                }));
                setMedications(mergedMeds);
            }
        }

        // Set form values after component mounts
        const defaults = getDefaultValues();
        Object.keys(defaults).forEach(key => {
            formHook.setValue(key as keyof FormValues, defaults[key as keyof FormValues]);
        });
    }, [formDataObject]);

    // Watch checkbox values for conditional rendering
    const takesRegularMeds = formHook.watch("takes_regular_medications");
    const hasChronicIllnesses = formHook.watch("has_chronic_illnesses");
    const hasHospitalizations = formHook.watch("has_hospitalizations");
    const hasSurgeries = formHook.watch("has_surgeries");
    const hasPhysicalLimitations = formHook.watch("has_physical_limitations");
    const hasDrugAllergies = formHook.watch("has_drug_allergies");
    const hasFoodAllergies = formHook.watch("has_food_allergies");
    const hasEnvironmentalAllergies = formHook.watch("has_environmental_allergies");
    const hasInsectAllergies = formHook.watch("has_insect_allergies");
    const usesEmergencyMeds = formHook.watch("uses_emergency_meds");
    const immunizationUpToDate = formHook.watch("immunization_up_to_date");

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        setMedications(prev => prev.map((med, i) => 
            i === index ? { ...med, [field]: value } : med
        ));
    };

    const handleInitialSubmit = async (values: FormValues) => {
        setIsFormSubmitting(true);
        try {
            const submitData = {
                ...values,
                student_id: student.id,
                medications: medications.filter(med => med.name.trim() !== "")
            };

            await router.post(route("parent.forms.submit"), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormSubmitting(false);
                    toast.success("Health Summary submitted successfully!");
                },
                onError: (errors) => {
                    setIsFormSubmitting(false);
                    console.error("Submission errors:", errors);
                    toast.error("Failed to submit form. Please check the errors.");
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const handleFieldUpdate = async (fieldName: keyof FormValues, value: string | boolean | number, showToast: boolean = true) => {
        try {
            await router.post(route("parent.forms.submit"), {
                form_id: form.id,
                student_id: student.id,
                key: fieldName,
                value: value
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Reload the page to get updated data from backend
                    router.reload({ only: ['admissionForm', 'formData', 'approvedData', 'latestData'] });
                    formHook.setValue(fieldName, value as any);
                    if (showToast) {
                        setIsFormSubmitting(false);
                        setEditingField(null);
                        toast.success("Field updated successfully!");
                    }
                },
                onError: () => {
                    setIsFormSubmitting(false);
                    if (showToast) {
                        toast.error("Failed to update field.");
                    }
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            if (showToast) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    // Map checkboxes to their related detail fields
    const checkboxToDetailMap: Record<string, (keyof FormValues)[]> = {
        'has_chronic_illnesses': ['chronic_illnesses_details'],
        'has_hospitalizations': ['hospitalizations_details'],
        'has_surgeries': ['surgeries_details'],
        'has_physical_limitations': ['physical_limitations_details'],
        'immunization_up_to_date': ['immunization_exemptions'],
        'has_drug_allergies': ['drug_allergies_details'],
        'has_food_allergies': ['food_allergies_details'],
        'has_environmental_allergies': ['environmental_allergies_details'],
        'has_insect_allergies': ['insect_allergies_details'],
        'uses_emergency_meds': ['emergency_medications'],
        'takes_regular_medications': [], // Medications are handled separately
    };

    // Map detail fields that have multiple parent checkboxes
    const multiParentDetails: Record<string, (keyof FormValues)[]> = {
        'allergy_severity': ['has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies', 'has_insect_allergies'],
        'allergy_emergency_plan': ['has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies', 'has_insect_allergies'],
    };

    const startEditing = (fieldName: string) => setEditingField(fieldName);
    const cancelEditing = () => {
        if (editingField) {
            formHook.resetField(editingField as any);
        }
        setEditingField(null);
    };
    
    const saveField = async (fieldName: keyof FormValues) => {
        setIsFormSubmitting(true);
        const value = formHook.getValues(fieldName);
        if (value === undefined) {
            setIsFormSubmitting(false);
            return;
        }

        try {
            // Save the main field
            await handleFieldUpdate(fieldName, value as string | boolean | number, false);

            // If it's a checkbox, also save related detail fields
            const relatedFields = checkboxToDetailMap[fieldName as string] || [];
            for (const relatedField of relatedFields) {
                const relatedValue = formHook.getValues(relatedField);
                if (relatedValue !== undefined) {
                    await handleFieldUpdate(relatedField, relatedValue as string | boolean | number, false);
                }
            }

            // Special handling for medications - save medications when saving takes_regular_medications
            if (fieldName === 'takes_regular_medications') {
                const medicationsData = medications.filter(med => med.name.trim() !== "");
                // Save medications as a separate field
                try {
                    await router.post(route("parent.forms.submit"), {
                        form_id: form.id,
                        student_id: student.id,
                        key: 'medications',
                        value: medicationsData
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            // Medications saved successfully
                        },
                        onError: () => {
                            console.error("Failed to save medications");
                        }
                    });
                } catch (error) {
                    console.error("Error saving medications:", error);
                }
            }

            // Handle multi-parent detail fields (allergy_severity, allergy_emergency_plan)
            // Save these fields when any of their parent checkboxes are being edited AND at least one is checked
            for (const [detailField, parents] of Object.entries(multiParentDetails)) {
                if (parents.includes(fieldName)) {
                    // Check if at least one parent checkbox is checked
                    const hasAnyParentChecked = parents.some(parent => {
                        const parentValue = formHook.getValues(parent);
                        return parentValue === true;
                    });
                    
                    if (hasAnyParentChecked) {
                        const detailValue = formHook.getValues(detailField as keyof FormValues);
                        if (detailValue !== undefined && detailValue !== "") {
                            await handleFieldUpdate(detailField as keyof FormValues, detailValue as string | boolean | number, false);
                        }
                    }
                }
            }

            setIsFormSubmitting(false);
            setEditingField(null);
            toast.success("Field updated successfully!");
        } catch (error) {
            setIsFormSubmitting(false);
            toast.error("Failed to update field.");
        }
    };

    // FieldWrapper component
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
                        <Button type="button" variant="ghost" size="sm" onClick={onStartEdit} className="h-6 w-6 p-0">
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
                        <Button type="button" size="sm" onClick={onSave} disabled={isFormSubmitting} className="h-7 text-xs">
                            <Save className="h-3 w-3 mr-1" />
                            {isFormSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isFormSubmitting} className="h-7 text-xs">
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

    // Checkbox Field component with edit functionality
    const CheckboxField: React.FC<{ name: keyof FormValues; label: string; required?: boolean }> = ({ name, label, required = false }) => {
        const isEditing = editingField === name;
        const isReadOnly = isSubmitted && !isEditing;

        return (
            <FormField
                control={formHook.control as any}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <div className="w-full relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-row items-start space-x-3 space-y-0 flex-1">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value as boolean}
                                            onCheckedChange={field.onChange}
                                            disabled={isReadOnly}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <Label>
                                            {label} {required && <span className="text-red-500">*</span>}
                                        </Label>
                                    </div>
                                </div>
                                {!isEditing && isSubmitted && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(name as string)}
                                        className="h-6 w-6 p-0 ml-2"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            {isEditing && (
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => saveField(name)}
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
                                        onClick={cancelEditing}
                                        disabled={isFormSubmitting}
                                        className="h-7 text-xs"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        );
    };

    // Render form field based on type and editing state
    const renderFormField = (name: keyof FormValues, label: string, required: boolean = false, alwaysShow: boolean = false) => {
        const isEditing = editingField === name;
        
        // Map detail fields to their parent checkbox fields
        const parentCheckboxMap: Record<string, (keyof FormValues)[]> = {
            'chronic_illnesses_details': ['has_chronic_illnesses'],
            'hospitalizations_details': ['has_hospitalizations'],
            'surgeries_details': ['has_surgeries'],
            'physical_limitations_details': ['has_physical_limitations'],
            'immunization_exemptions': ['immunization_up_to_date'],
            'drug_allergies_details': ['has_drug_allergies'],
            'food_allergies_details': ['has_food_allergies'],
            'environmental_allergies_details': ['has_environmental_allergies'],
            'insect_allergies_details': ['has_insect_allergies'],
            'allergy_severity': ['has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies', 'has_insect_allergies'],
            'allergy_emergency_plan': ['has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies', 'has_insect_allergies'],
            'emergency_medications': ['uses_emergency_meds'],
        };

        // Check if any parent checkbox is being edited
        const parentCheckboxes = parentCheckboxMap[name as string] || [];
        const isParentEditing = parentCheckboxes.some(parent => editingField === parent);
        
        // Field is editable if it's being edited OR its parent checkbox is being edited
        const isReadOnly = isSubmitted && !isEditing && !isParentEditing;

        // Show field if: alwaysShow OR checkbox is checked OR parent checkbox is being edited
        const shouldShow = alwaysShow || 
            (name === 'chronic_illnesses_details' && (hasChronicIllnesses || editingField === 'has_chronic_illnesses')) ||
            (name === 'hospitalizations_details' && (hasHospitalizations || editingField === 'has_hospitalizations')) ||
            (name === 'surgeries_details' && (hasSurgeries || editingField === 'has_surgeries')) ||
            (name === 'physical_limitations_details' && (hasPhysicalLimitations || editingField === 'has_physical_limitations')) ||
            (name === 'immunization_exemptions' && (!immunizationUpToDate || editingField === 'immunization_up_to_date')) ||
            (name === 'drug_allergies_details' && (hasDrugAllergies || editingField === 'has_drug_allergies')) ||
            (name === 'food_allergies_details' && (hasFoodAllergies || editingField === 'has_food_allergies')) ||
            (name === 'environmental_allergies_details' && (hasEnvironmentalAllergies || editingField === 'has_environmental_allergies')) ||
            (name === 'insect_allergies_details' && (hasInsectAllergies || editingField === 'has_insect_allergies')) ||
            (name === 'allergy_severity' && ((hasDrugAllergies || hasFoodAllergies || hasEnvironmentalAllergies || hasInsectAllergies) || isParentEditing)) ||
            (name === 'allergy_emergency_plan' && ((hasDrugAllergies || hasFoodAllergies || hasEnvironmentalAllergies || hasInsectAllergies) || isParentEditing)) ||
            (name === 'emergency_medications' && (usesEmergencyMeds || editingField === 'uses_emergency_meds'));

        if (!shouldShow) return null;

        return (
            <FormField control={formHook.control as any} name={name} render={({ field }) => (
                <FormItem>
                    {isParentEditing ? (
                        // When parent checkbox is being edited, show field without edit controls
                        <div className="w-full">
                            <Label htmlFor={name as string} className="text-sm font-medium mb-2 block">
                                {label} {required && <span className="text-red-500">*</span>}
                            </Label>
                            <FormControl>
                                {name === 'allergy_severity' ? (
                                    <Select onValueChange={field.onChange} value={String(field.value || "")} disabled={false}>
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mild">Mild</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="severe">Severe</SelectItem>
                                            <SelectItem value="anaphylactic">Anaphylactic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : name === 'signature' ? (
                                    <SignatureInput
                                        value={field.value as string || ''}
                                        onChange={field.onChange}
                                        onSignatureSaved={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            formHook.setValue('signature_date', today);
                                        }}
                                        disabled={false}
                                        required={required}
                                    />
                                ) : ['chronic_illnesses_details', 'hospitalizations_details', 'surgeries_details', 
                                    'physical_limitations_details', 'allergy_emergency_plan', 'additional_notes', 
                                    'immunization_exemptions', 'drug_allergies_details', 'food_allergies_details', 
                                    'environmental_allergies_details', 'insect_allergies_details', 'emergency_medications', 
                                    'special_dietary_needs', 'activity_restrictions'].includes(name as string) ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={false}
                                        value={field.value as string}
                                    />
                                ) : (
                                    <Input 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={false}
                                        type={name.includes('date') ? 'date' : 'text'}
                                        value={field.value as string}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </div>
                    ) : (
                        // Normal field with edit controls
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
                                {name === 'allergy_severity' ? (
                                    <Select onValueChange={field.onChange} value={String(field.value || "")} disabled={isReadOnly}>
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mild">Mild</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="severe">Severe</SelectItem>
                                            <SelectItem value="anaphylactic">Anaphylactic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : name === 'signature' ? (
                                    <SignatureInput
                                        value={field.value as string || ''}
                                        onChange={field.onChange}
                                        onSignatureSaved={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            formHook.setValue('signature_date', today);
                                        }}
                                        disabled={isReadOnly}
                                        required={required}
                                    />
                                ) : ['chronic_illnesses_details', 'hospitalizations_details', 'surgeries_details', 
                                    'physical_limitations_details', 'allergy_emergency_plan', 'additional_notes', 
                                    'immunization_exemptions', 'drug_allergies_details', 'food_allergies_details', 
                                    'environmental_allergies_details', 'insect_allergies_details', 'emergency_medications', 
                                    'special_dietary_needs', 'activity_restrictions'].includes(name as string) ? (
                                    <Textarea 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                        value={field.value as string}
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
                    )}
                </FormItem>
            )} />
        );
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <Head title={form.name} />
            
            <Form {...formHook}>
                <form onSubmit={formHook.handleSubmit(handleInitialSubmit as any, onFormInvalid)} className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-4">
                    <input type="hidden" {...formHook.register("form_id")} />

                    <div className="flex gap-3">
                        <div className="px-2">
                            <div className="flex gap-2">
                                <Link href={route('parent.admission.show', student.id)} className="justify-center items-center inline-flex">
                                    <ChevronLeft />
                                </Link>
                                <h1 className="text-2xl font-bold">{form.name}</h1>
                            </div>
                            <p className={`text-sm px-8 mt-1 ${isSubmitted ? 'text-green-900 font-semibold' : 'text-muted-foreground'}`}>
                                {isSubmitted ? (
                                    isApproved ? (
                                        "Your health summary has been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your health summary has pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your health summary has been submitted. You can update it freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please complete all required fields marked with * to ensure proper medical care."
                                )}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {!isSubmitted && (
                                <Button type="submit" disabled={isFormSubmitting}>
                                    {isFormSubmitting ? "Submitting..." : "Submit Health Summary"}
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

                    {/* Medical History */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <CheckboxField name="has_chronic_illnesses" label="Chronic illnesses or conditions (asthma, diabetes, epilepsy, etc.)" />
                                {renderFormField("chronic_illnesses_details", "Please describe")}
                                
                                <CheckboxField name="has_hospitalizations" label="Previous hospitalizations" />
                                {renderFormField("hospitalizations_details", "Please describe")}
                                
                                <CheckboxField name="has_surgeries" label="Previous surgeries" />
                                {renderFormField("surgeries_details", "Please describe")}
                                
                                <CheckboxField name="has_physical_limitations" label="Physical limitations or disabilities" />
                                {renderFormField("physical_limitations_details", "Please describe")}
                                
                                <CheckboxField name="immunization_up_to_date" label="Immunizations are up to date" required />
                                {renderFormField("immunization_exemptions", "Please describe")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Allergies */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Allergies</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <CheckboxField name="has_drug_allergies" label="Drug allergies (penicillin, etc.)" />
                                {renderFormField("drug_allergies_details", "Please list specific drugs and reactions:")}
                                
                                <CheckboxField name="has_food_allergies" label="Food allergies" />
                                {renderFormField("food_allergies_details", "Please list specific foods and reactions:")}
                                
                                <CheckboxField name="has_environmental_allergies" label="Environmental allergies (pollen, dust, etc.)" />
                                {renderFormField("environmental_allergies_details", "Please describe:")}
                                
                                <CheckboxField name="has_insect_allergies" label="Insect sting allergies" />
                                {renderFormField("insect_allergies_details", "Please describe:")}
                            </div>
                            
                            <div className="space-y-4">
                                {renderFormField("allergy_severity", "Severity of allergic reactions")}
                                {renderFormField("allergy_emergency_plan", "Emergency plan for allergic reactions")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Current Medications */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Current Medications</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <CheckboxField name="takes_regular_medications" label="Takes regular medications" />
                            
                            {(takesRegularMeds || editingField === 'takes_regular_medications') && (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Medication Name</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Dosage</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Frequency</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Reason</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Prescribed By</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {medications.map((medication, index) => {
                                                    const isMedicationsEditing = editingField === 'takes_regular_medications';
                                                    const isReadOnly = isSubmitted && !isMedicationsEditing;
                                                    return (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <Input 
                                                                    value={medication.name} 
                                                                    onChange={(e) => updateMedication(index, 'name', e.target.value)} 
                                                                    placeholder="Medication name" 
                                                                    readOnly={isReadOnly} 
                                                                    className={isReadOnly ? "bg-gray-50" : ""} 
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <Input 
                                                                    value={medication.dosage} 
                                                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)} 
                                                                    placeholder="Dosage" 
                                                                    readOnly={isReadOnly} 
                                                                    className={isReadOnly ? "bg-gray-50" : ""} 
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <Input 
                                                                    value={medication.frequency} 
                                                                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)} 
                                                                    placeholder="Frequency" 
                                                                    readOnly={isReadOnly} 
                                                                    className={isReadOnly ? "bg-gray-50" : ""} 
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <Input 
                                                                    value={medication.reason} 
                                                                    onChange={(e) => updateMedication(index, 'reason', e.target.value)} 
                                                                    placeholder="Reason" 
                                                                    readOnly={isReadOnly} 
                                                                    className={isReadOnly ? "bg-gray-50" : ""} 
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <Input 
                                                                    value={medication.prescribed_by} 
                                                                    onChange={(e) => updateMedication(index, 'prescribed_by', e.target.value)} 
                                                                    placeholder="Prescribed by" 
                                                                    readOnly={isReadOnly} 
                                                                    className={isReadOnly ? "bg-gray-50" : ""} 
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Please list all current medications. Leave blank if not applicable.
                                    </p>
                                </div>
                            )}
                            
                            <CheckboxField name="uses_emergency_meds" label="Uses emergency medications (EpiPen, inhaler, etc.)" />
                            {renderFormField("emergency_medications", "Please specify medication and instructions:")}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency Medical Information */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Emergency Medical Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Primary Care Physician</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("primary_care_physician", "Physician Name", true, true)}
                                    {renderFormField("physician_phone", "Phone Number", true, true)}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-medium">Insurance Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("insurance_company", "Insurance Company", true, true)}
                                    {renderFormField("policy_number", "Policy Number", true, true)}
                                    {renderFormField("group_number", "Group Number", false, true)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Additional Information */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("special_dietary_needs", "Special dietary needs or restrictions", false, true)}
                            {renderFormField("activity_restrictions", "Activity restrictions or limitations", false, true)}
                            {renderFormField("additional_notes", "Any other medical information we should know", false, true)}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Consent & Signature */}
                    <Card className="shadow-none border-0">
                        <CardHeader><CardTitle>Consent & Authorization</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <CheckboxField name="consent_medical_treatment" label="I authorize the school to seek emergency medical treatment for my child if I cannot be reached." required />
                                <CheckboxField name="consent_share_info" label="I authorize the school to share this medical information with appropriate staff as needed for the safety and well-being of my child." />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("signature", "Parent/Guardian Signature", true, true)}
                                {renderFormField("signature_date", "Date", true, true)}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
