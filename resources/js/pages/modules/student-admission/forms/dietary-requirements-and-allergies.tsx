// dietary-requirements.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useRHF } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, Plus, Trash2, AlertTriangle, Utensils, MessageSquare, AlertCircle } from "lucide-react";
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
import {
    Select,
    SelectTrigger,
    SelectItem,
    SelectValue,
    SelectContent,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

    // Food Allergies
    has_food_allergies: z.boolean().default(false),
    food_allergy_severity: z.enum(["mild", "moderate", "severe", "anaphylactic", ""]).optional().or(z.literal("")),
    
    // Specific Food Allergies
    allergy_dairy: z.boolean().default(false),
    allergy_dairy_details: z.string().optional().or(z.literal("")),
    
    allergy_eggs: z.boolean().default(false),
    allergy_eggs_details: z.string().optional().or(z.literal("")),
    
    allergy_peanuts: z.boolean().default(false),
    allergy_peanuts_details: z.string().optional().or(z.literal("")),
    
    allergy_tree_nuts: z.boolean().default(false),
    allergy_tree_nuts_details: z.string().optional().or(z.literal("")),
    
    allergy_soy: z.boolean().default(false),
    allergy_soy_details: z.string().optional().or(z.literal("")),
    
    allergy_wheat: z.boolean().default(false),
    allergy_wheat_details: z.string().optional().or(z.literal("")),
    
    allergy_fish: z.boolean().default(false),
    allergy_fish_details: z.string().optional().or(z.literal("")),
    
    allergy_shellfish: z.boolean().default(false),
    allergy_shellfish_details: z.string().optional().or(z.literal("")),
    
    allergy_seeds: z.boolean().default(false),
    allergy_seeds_details: z.string().optional().or(z.literal("")),
    
    allergy_fruits: z.boolean().default(false),
    allergy_fruits_details: z.string().optional().or(z.literal("")),
    
    allergy_vegetables: z.boolean().default(false),
    allergy_vegetables_details: z.string().optional().or(z.literal("")),
    
    // Other Allergies
    other_allergies: z.array(z.object({
        id: z.string(),
        allergen: z.string().min(1, "Allergen name is required"),
        severity: z.enum(["mild", "moderate", "severe", "anaphylactic"]),
        reaction: z.string().min(1, "Reaction description is required"),
        emergency_plan: z.string().optional().or(z.literal(""))
    })).default([]),

    // Dietary Restrictions & Preferences
    dietary_restrictions: z.array(z.object({
        id: z.string(),
        type: z.enum(["religious", "cultural", "ethical", "medical", "preference", "other"]),
        description: z.string().min(1, "Description is required"),
        restrictions: z.string().min(1, "Restrictions details are required"),
        accommodations_needed: z.string().optional().or(z.literal(""))
    })).default([]),

    // Special Dietary Needs
    requires_special_diet: z.boolean().default(false),
    special_diet_type: z.enum(["diabetic", "low_sodium", "gluten_free", "ketogenic", "pureed", "tube_feeding", "other", ""]).optional().or(z.literal("")),
    special_diet_details: z.string().optional().or(z.literal("")),
    prescribed_by_doctor: z.boolean().default(false),
    doctor_name: z.string().optional().or(z.literal("")),
    doctor_contact: z.string().optional().or(z.literal("")),

    // Meal Program Participation
    school_meal_program: z.enum(["full_participation", "modified_meals", "bring_own_lunch", "varies"]).default("full_participation"),
    meal_program_accommodations: z.string().optional().or(z.literal("")),
    
    // Free/Reduced Lunch Program
    free_reduced_lunch_app: z.boolean().default(false),
    free_reduced_lunch_status: z.enum(["approved", "pending", "denied", "not_applied"]).default("not_applied"),
    
    // Lunch from Home
    brings_lunch_from_home: z.boolean().default(false),
    lunch_restrictions: z.string().optional().or(z.literal("")),
    lunch_preferences: z.string().optional().or(z.literal("")),

    // Snack Information
    classroom_snacks_allowed: z.boolean().default(true),
    snack_restrictions: z.string().optional().or(z.literal("")),
    preferred_snacks: z.string().optional().or(z.literal("")),
    
    // Special Occasions
    birthday_celebrations: z.boolean().default(true),
    birthday_treat_restrictions: z.string().optional().or(z.literal("")),
    alternative_celebration: z.string().optional().or(z.literal("")),

    // Emergency Information
    epipen_required: z.boolean().default(false),
    epipen_location: z.string().optional().or(z.literal("")),
    antihistamine_required: z.boolean().default(false),
    antihistamine_details: z.string().optional().or(z.literal("")),
    emergency_action_plan: z.string().optional().or(z.literal("")),

    // Medical Documentation
    medical_documentation_provided: z.boolean().default(false),
    documentation_type: z.string().optional().or(z.literal("")),
    care_plan_on_file: z.boolean().default(false),

    // Consent & Authorization
    consent_meal_modifications: z.boolean().default(false),
    consent_emergency_treatment: z.boolean().refine(val => val === true, "Consent for emergency treatment is required"),
    consent_share_info: z.boolean().default(true),
    signature: z.string().min(1, "Signature is required"),
    signature_date: z.string().min(1, "Signature date is required"),
});

type FormValues = z.infer<typeof schema>;
type Allergy = {
    id: string;
    allergen: string;
    severity: "mild" | "moderate" | "severe" | "anaphylactic";
    reaction: string;
    emergency_plan: string;
};

type DietaryRestriction = {
    id: string;
    type: "religious" | "cultural" | "ethical" | "medical" | "preference" | "other";
    description: string;
    restrictions: string;
    accommodations_needed: string;
};

// Allergy Form Component - defined outside main component to prevent re-creation on render
const AllergyFormComponent: React.FC<{
    allergy: Allergy;
    onChange: (allergy: Allergy) => void;
    onSave: () => void;
    onCancel: () => void;
}> = ({ allergy, onChange, onSave, onCancel }) => {
    const [errors, setErrors] = useState<{ allergen?: string; reaction?: string }>({});

    const handleSave = () => {
        const newErrors: { allergen?: string; reaction?: string } = {};
        
        if (!allergy.allergen.trim()) {
            newErrors.allergen = "Allergen name is required";
        }
        if (!allergy.reaction.trim()) {
            newErrors.reaction = "Reaction description is required";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        onSave();
    };

    return (
        <Card className="p-4 border border-red-200">
            <h4 className="font-medium mb-4">Add Other Food Allergy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Allergen Name *"
                        value={allergy.allergen}
                        onChange={(e) => {
                            onChange({...allergy, allergen: e.target.value});
                            if (errors.allergen) setErrors(prev => ({ ...prev, allergen: undefined }));
                        }}
                        className={errors.allergen ? "border-red-500" : ""}
                    />
                    {errors.allergen && <p className="text-red-500 text-xs mt-1">{errors.allergen}</p>}
                </div>
                <Select 
                    value={allergy.severity} 
                    onValueChange={(value: "mild" | "moderate" | "severe" | "anaphylactic") => onChange({...allergy, severity: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="anaphylactic">Anaphylactic</SelectItem>
                    </SelectContent>
                </Select>
                <div className="md:col-span-2">
                    <Input
                        placeholder="Reaction Description *"
                        value={allergy.reaction}
                        onChange={(e) => {
                            onChange({...allergy, reaction: e.target.value});
                            if (errors.reaction) setErrors(prev => ({ ...prev, reaction: undefined }));
                        }}
                        className={errors.reaction ? "border-red-500" : ""}
                    />
                    {errors.reaction && <p className="text-red-500 text-xs mt-1">{errors.reaction}</p>}
                </div>
                <Input
                    placeholder="Emergency Plan (Optional)"
                    className="md:col-span-2"
                    value={allergy.emergency_plan}
                    onChange={(e) => onChange({...allergy, emergency_plan: e.target.value})}
                />
            </div>
            <div className="flex gap-2 mt-4">
                <Button type="button" onClick={handleSave} size="sm">
                    Add Allergy
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} size="sm">
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

// Restriction Form Component - defined outside main component to prevent re-creation on render
const RestrictionFormComponent: React.FC<{
    restriction: DietaryRestriction;
    onChange: (restriction: DietaryRestriction) => void;
    onSave: () => void;
    onCancel: () => void;
}> = ({ restriction, onChange, onSave, onCancel }) => {
    const [errors, setErrors] = useState<{ description?: string; restrictions?: string }>({});

    const handleSave = () => {
        const newErrors: { description?: string; restrictions?: string } = {};
        
        if (!restriction.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!restriction.restrictions.trim()) {
            newErrors.restrictions = "Specific restrictions are required";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        onSave();
    };

    return (
        <Card className="p-4 border border-blue-200">
            <h4 className="font-medium mb-4">Add Dietary Restriction</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                    value={restriction.type} 
                    onValueChange={(value: "religious" | "cultural" | "ethical" | "medical" | "preference" | "other") => onChange({...restriction, type: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="religious">Religious</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="ethical">Ethical</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="preference">Preference</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <div>
                    <Input
                        placeholder="Description *"
                        value={restriction.description}
                        onChange={(e) => {
                            onChange({...restriction, description: e.target.value});
                            if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                        }}
                        className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div className="md:col-span-2">
                    <Input
                        placeholder="Specific Restrictions *"
                        value={restriction.restrictions}
                        onChange={(e) => {
                            onChange({...restriction, restrictions: e.target.value});
                            if (errors.restrictions) setErrors(prev => ({ ...prev, restrictions: undefined }));
                        }}
                        className={errors.restrictions ? "border-red-500" : ""}
                    />
                    {errors.restrictions && <p className="text-red-500 text-xs mt-1">{errors.restrictions}</p>}
                </div>
                <Input
                    placeholder="Accommodations Needed (Optional)"
                    className="md:col-span-2"
                    value={restriction.accommodations_needed}
                    onChange={(e) => onChange({...restriction, accommodations_needed: e.target.value})}
                />
            </div>
            <div className="flex gap-2 mt-4">
                <Button type="button" onClick={handleSave} size="sm">
                    Add Restriction
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} size="sm">
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

// Allergy Card Component - defined outside main component
const AllergyCardComponent: React.FC<{
    allergy: Allergy;
    onRemove: (id: string) => void;
    isApproved: boolean;
}> = ({ allergy, onRemove, isApproved }) => (
    <Card className="p-4 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h4 className="font-medium">{allergy.allergen}</h4>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${
                        allergy.severity === 'mild' ? 'bg-green-100 text-green-800' :
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        allergy.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {allergy.severity}
                    </span>
                </div>
                
                <div className="space-y-1 text-sm">
                    <div><strong>Reaction:</strong> {allergy.reaction}</div>
                    {allergy.emergency_plan && (
                        <div><strong>Emergency Plan:</strong> {allergy.emergency_plan}</div>
                    )}
                </div>
            </div>
            
            {!isApproved && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(allergy.id)}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            )}
        </div>
    </Card>
);

// Restriction Card Component - defined outside main component
const RestrictionCardComponent: React.FC<{
    restriction: DietaryRestriction;
    onRemove: (id: string) => void;
    isApproved: boolean;
}> = ({ restriction, onRemove, isApproved }) => (
    <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium">{restriction.description}</h4>
                    <span className="text-xs text-gray-600 capitalize">
                        ({restriction.type})
                    </span>
                </div>
                
                <div className="space-y-1 text-sm">
                    <div><strong>Restrictions:</strong> {restriction.restrictions}</div>
                    {restriction.accommodations_needed && (
                        <div><strong>Accommodations Needed:</strong> {restriction.accommodations_needed}</div>
                    )}
                </div>
            </div>
            
            {!isApproved && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(restriction.id)}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            )}
        </div>
    </Card>
);

export default function DietaryRequirementsForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    const [otherAllergies, setOtherAllergies] = useState<Allergy[]>([]);
    
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
    const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
    const [showAllergyForm, setShowAllergyForm] = useState(false);
    const [showRestrictionForm, setShowRestrictionForm] = useState(false);
    const [newAllergy, setNewAllergy] = useState<Allergy>({
        id: "",
        allergen: "",
        severity: "mild",
        reaction: "",
        emergency_plan: ""
    });
    const [newRestriction, setNewRestriction] = useState<DietaryRestriction>({
        id: "",
        type: "religious",
        description: "",
        restrictions: "",
        accommodations_needed: ""
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
        // Load other allergies and dietary restrictions from form data
        if (formDataObject.other_allergies) {
            const parsedAllergies = parseArrayData(formDataObject.other_allergies);
            setOtherAllergies(parsedAllergies);
        }

        if (formDataObject.dietary_restrictions) {
            const parsedRestrictions = parseArrayData(formDataObject.dietary_restrictions);
            setDietaryRestrictions(parsedRestrictions);
        }

        // Set form values after component mounts
        const defaultValues = getDefaultValues();
        Object.keys(defaultValues).forEach(key => {
            rhForm.setValue(key as keyof FormValues, defaultValues[key as keyof FormValues]);
        });
    }, [formDataObject]);

    // Get default values for the form
    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (hasData) {
            // Use formDataObject directly (already denormalized)
            // Make sure array fields are properly parsed
            return {
                form_id: form.id,
                ...formDataObject,
                other_allergies: parseArrayData(formDataObject.other_allergies),
                dietary_restrictions: parseArrayData(formDataObject.dietary_restrictions),
            } as FormValues;
        }
        
        return {
            form_id: form.id,

            // Food Allergies
            has_food_allergies: false,
            food_allergy_severity: "",
                
            // Specific Food Allergies
            allergy_dairy: false,
            allergy_dairy_details: "",
                
            allergy_eggs: false,
            allergy_eggs_details: "",
                
            allergy_peanuts: false,
            allergy_peanuts_details: "",
                
            allergy_tree_nuts: false,
            allergy_tree_nuts_details: "",
                
            allergy_soy: false,
            allergy_soy_details: "",
                
            allergy_wheat: false,
            allergy_wheat_details: "",
                
            allergy_fish: false,
            allergy_fish_details: "",
                
            allergy_shellfish: false,
            allergy_shellfish_details: "",
                
            allergy_seeds: false,
            allergy_seeds_details: "",
                
            allergy_fruits: false,
            allergy_fruits_details: "",
                
            allergy_vegetables: false,
            allergy_vegetables_details: "",
                
            // Other Allergies
            other_allergies: otherAllergies,

            // Dietary Restrictions
            dietary_restrictions: dietaryRestrictions,

            // Special Dietary Needs
            requires_special_diet: false,
            special_diet_type: "",
            special_diet_details: "",
            prescribed_by_doctor: false,
            doctor_name: "",
            doctor_contact: "",

            // Meal Program Participation
            school_meal_program: "full_participation",
            meal_program_accommodations: "",
                
            // Free/Reduced Lunch Program
            free_reduced_lunch_app: false,
            free_reduced_lunch_status: "not_applied",
                
            // Lunch from Home
            brings_lunch_from_home: false,
            lunch_restrictions: "",
            lunch_preferences: "",

            // Snack Information
            classroom_snacks_allowed: false,
            snack_restrictions: "",
            preferred_snacks: "",
                
            // Special Occasions
            birthday_celebrations: false,
            birthday_treat_restrictions: "",
            alternative_celebration: "",

            // Emergency Information
            epipen_required: false,
            epipen_location: "",
            antihistamine_required: false,
            antihistamine_details: "",
            emergency_action_plan: "",

            // Medical Documentation
            medical_documentation_provided: false,
            documentation_type: "",
            care_plan_on_file: false,

            // Consent & Authorization
            consent_meal_modifications: false,
            consent_emergency_treatment: false,
            consent_share_info: false,
            signature: "",
            signature_date: ""
        };
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    // Watch for important checkbox changes
    const hasFoodAllergies = rhForm.watch("has_food_allergies");
    const requiresSpecialDiet = rhForm.watch("requires_special_diet");
    const prescribedByDoctor = rhForm.watch("prescribed_by_doctor");
    const bringsLunchFromHome = rhForm.watch("brings_lunch_from_home");
    const freeReducedLunchApp = rhForm.watch("free_reduced_lunch_app");
    const epipenRequired = rhForm.watch("epipen_required");
    const antihistamineRequired = rhForm.watch("antihistamine_required");
    const medicalDocumentationProvided = rhForm.watch("medical_documentation_provided");

    // Other Allergies Management
    const addOtherAllergy = () => {
        if (newAllergy.allergen.trim() && newAllergy.reaction.trim()) {
            const allergy = {
                ...newAllergy,
                id: Math.random().toString(36).substr(2, 9)
            };
            const updatedAllergies = [...otherAllergies, allergy];
            setOtherAllergies(updatedAllergies);
            rhForm.setValue("other_allergies", updatedAllergies);
            
            setNewAllergy({
                id: "",
                allergen: "",
                severity: "mild",
                reaction: "",
                emergency_plan: ""
            });
            setShowAllergyForm(false);
            
            handleFieldUpdate("other_allergies", JSON.stringify(updatedAllergies));
        }
    };

    const removeOtherAllergy = (id: string) => {
        const updatedAllergies = otherAllergies.filter(allergy => allergy.id !== id);
        setOtherAllergies(updatedAllergies);
        rhForm.setValue("other_allergies", updatedAllergies);
        handleFieldUpdate("other_allergies", JSON.stringify(updatedAllergies));
    };

    // Dietary Restrictions Management
    const addDietaryRestriction = () => {
        if (newRestriction.description.trim() && newRestriction.restrictions.trim()) {
            const restriction = {
                ...newRestriction,
                id: Math.random().toString(36).substr(2, 9)
            };
            const updatedRestrictions = [...dietaryRestrictions, restriction];
            setDietaryRestrictions(updatedRestrictions);
            rhForm.setValue("dietary_restrictions", updatedRestrictions);
            
            setNewRestriction({
                id: "",
                type: "religious",
                description: "",
                restrictions: "",
                accommodations_needed: ""
            });
            setShowRestrictionForm(false);
            
            handleFieldUpdate("dietary_restrictions", JSON.stringify(updatedRestrictions));
        }
    };

    const removeDietaryRestriction = (id: string) => {
        const updatedRestrictions = dietaryRestrictions.filter(restriction => restriction.id !== id);
        setDietaryRestrictions(updatedRestrictions);
        rhForm.setValue("dietary_restrictions", updatedRestrictions);
        handleFieldUpdate("dietary_restrictions", JSON.stringify(updatedRestrictions));
    };

    const handleInitialSubmit = async (values: FormValues) => {
        setIsFormSubmitting(true);

        try {
            const submitData = {
                ...values,
                student_id: student.id,
                other_allergies: JSON.stringify(otherAllergies),
                dietary_restrictions: JSON.stringify(dietaryRestrictions)
            };

            await router.post(route("parent.forms.submit"), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormSubmitting(false);
                    toast.success("Dietary Requirements submitted successfully!");
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
            (name === 'food_allergy_severity' && hasFoodAllergies) ||
            (name.includes('_details') && rhForm.watch(name.replace('_details', '') as keyof FormValues)) ||
            (name === 'special_diet_type' && requiresSpecialDiet) ||
            (name === 'special_diet_details' && requiresSpecialDiet) ||
            (name === 'doctor_name' && (requiresSpecialDiet && prescribedByDoctor)) ||
            (name === 'doctor_contact' && (requiresSpecialDiet && prescribedByDoctor)) ||
            (name === 'meal_program_accommodations' && rhForm.watch("school_meal_program") !== "bring_own_lunch") ||
            (name === 'free_reduced_lunch_status' && freeReducedLunchApp) ||
            (name === 'lunch_restrictions' && bringsLunchFromHome) ||
            (name === 'lunch_preferences' && bringsLunchFromHome) ||
            (name === 'snack_restrictions' && !rhForm.watch("classroom_snacks_allowed")) ||
            (name === 'preferred_snacks' && rhForm.watch("classroom_snacks_allowed")) ||
            (name === 'birthday_treat_restrictions' && !rhForm.watch("birthday_celebrations")) ||
            (name === 'alternative_celebration' && !rhForm.watch("birthday_celebrations")) ||
            (name === 'epipen_location' && epipenRequired) ||
            (name === 'antihistamine_details' && antihistamineRequired) ||
            (name === 'documentation_type' && medicalDocumentationProvided) ||
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
                                {name.includes('severity') || name.includes('type') || name.includes('program') || name.includes('status') ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {name === 'food_allergy_severity' ? (
                                                <>
                                                    <SelectItem value="mild">Mild</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="severe">Severe</SelectItem>
                                                    <SelectItem value="anaphylactic">Anaphylactic (Life-threatening)</SelectItem>
                                                </>
                                            ) : name === 'special_diet_type' ? (
                                                <>
                                                    <SelectItem value="diabetic">Diabetic</SelectItem>
                                                    <SelectItem value="low_sodium">Low Sodium</SelectItem>
                                                    <SelectItem value="gluten_free">Gluten Free</SelectItem>
                                                    <SelectItem value="ketogenic">Ketogenic</SelectItem>
                                                    <SelectItem value="pureed">Pureed</SelectItem>
                                                    <SelectItem value="tube_feeding">Tube Feeding</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </>
                                            ) : name === 'school_meal_program' ? (
                                                <>
                                                    <SelectItem value="full_participation">Full Participation</SelectItem>
                                                    <SelectItem value="modified_meals">Modified Meals</SelectItem>
                                                    <SelectItem value="bring_own_lunch">Bring Own Lunch</SelectItem>
                                                    <SelectItem value="varies">Varies Daily</SelectItem>
                                                </>
                                            ) : name === 'free_reduced_lunch_status' ? (
                                                <>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="denied">Denied</SelectItem>
                                                    <SelectItem value="not_applied">Not Applied</SelectItem>
                                                </>
                                            ) : null}
                                        </SelectContent>
                                    </Select>
                                ) : ['special_diet_details', 'meal_program_accommodations', 'lunch_restrictions', 'lunch_preferences', 
                                    'snack_restrictions', 'preferred_snacks', 'birthday_treat_restrictions', 'alternative_celebration',
                                    'emergency_action_plan', 'antihistamine_details', 'documentation_type'].includes(name as string) ? (
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
                                        "Your dietary requirements have been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your dietary requirements have pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your dietary requirements have been submitted. You can update them freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please provide complete information about food allergies, dietary restrictions, and meal program participation."
                                )}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {!isSubmitted && (
                                <Button 
                                    type="submit" 
                                    disabled={isFormSubmitting}
                                >
                                    {isFormSubmitting ? "Submitting..." : "Submit Information"}
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

                    {/* Food Allergies Section */}
                    <Card className="shadow-none border-0 border-l-4 border-l-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-700">Food Allergies & Intolerances</CardTitle>
                            <p className="text-sm text-gray-600">Please indicate all food allergies and sensitivities</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <CheckboxField 
                                name="has_food_allergies" 
                                label="My child has food allergies or intolerances" 
                            />

                            {hasFoodAllergies && (
                                <>
                                    {renderFormField("food_allergy_severity", "Overall Allergy Severity", true)}

                                    {/* Common Food Allergies */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Common Food Allergies</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <CheckboxField name="allergy_dairy" label="Dairy/Milk" />
                                                <CheckboxField name="allergy_eggs" label="Eggs" />
                                                <CheckboxField name="allergy_peanuts" label="Peanuts" />
                                                <CheckboxField name="allergy_tree_nuts" label="Tree Nuts" />
                                                <CheckboxField name="allergy_soy" label="Soy" />
                                            </div>
                                            <div className="space-y-3">
                                                <CheckboxField name="allergy_wheat" label="Wheat/Gluten" />
                                                <CheckboxField name="allergy_fish" label="Fish" />
                                                <CheckboxField name="allergy_shellfish" label="Shellfish" />
                                                <CheckboxField name="allergy_seeds" label="Seeds" />
                                                <CheckboxField name="allergy_fruits" label="Fruits" />
                                                <CheckboxField name="allergy_vegetables" label="Vegetables" />
                                            </div>
                                        </div>

                                        {/* Allergy Details */}
                                        <div className="space-y-3">
                                            {renderFormField("allergy_dairy_details", "Dairy Allergy Details")}
                                            {renderFormField("allergy_eggs_details", "Egg Allergy Details")}
                                            {renderFormField("allergy_peanuts_details", "Peanut Allergy Details")}
                                            {renderFormField("allergy_tree_nuts_details", "Tree Nut Allergy Details")}
                                            {renderFormField("allergy_soy_details", "Soy Allergy Details")}
                                            {renderFormField("allergy_wheat_details", "Wheat/Gluten Allergy Details")}
                                            {renderFormField("allergy_fish_details", "Fish Allergy Details")}
                                            {renderFormField("allergy_shellfish_details", "Shellfish Allergy Details")}
                                            {renderFormField("allergy_seeds_details", "Seed Allergy Details")}
                                            {renderFormField("allergy_fruits_details", "Fruit Allergy Details")}
                                            {renderFormField("allergy_vegetables_details", "Vegetable Allergy Details")}
                                        </div>
                                    </div>

                                    {/* Other Allergies */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium">Other Food Allergies</h4>
                                            {!isApproved && (
                                                <Button 
                                                    type="button"
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setShowAllergyForm(true)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Other Allergy
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {showAllergyForm && (
                                            <AllergyFormComponent
                                                allergy={newAllergy}
                                                onChange={setNewAllergy}
                                                onSave={addOtherAllergy}
                                                onCancel={() => setShowAllergyForm(false)}
                                            />
                                        )}
                                        
                                        {otherAllergies.length > 0 ? (
                                            <div className="space-y-3">
                                                {otherAllergies.map((allergy) => (
                                                    <AllergyCardComponent
                                                        key={allergy.id}
                                                        allergy={allergy}
                                                        onRemove={removeOtherAllergy}
                                                        isApproved={isApproved}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No other allergies added yet.
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Dietary Restrictions & Preferences */}
                    <Card className="shadow-none border-0 border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="text-blue-700">Dietary Restrictions & Preferences</CardTitle>
                            <p className="text-sm text-gray-600">Religious, cultural, ethical, or personal dietary needs</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Dietary Restrictions */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Dietary Restrictions</h4>
                                    {!isApproved && (
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowRestrictionForm(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Restriction
                                        </Button>
                                    )}
                                </div>
                                
                                {showRestrictionForm && (
                                    <RestrictionFormComponent
                                        restriction={newRestriction}
                                        onChange={setNewRestriction}
                                        onSave={addDietaryRestriction}
                                        onCancel={() => setShowRestrictionForm(false)}
                                    />
                                )}
                                
                                {dietaryRestrictions.length > 0 ? (
                                    <div className="space-y-3">
                                        {dietaryRestrictions.map((restriction) => (
                                            <RestrictionCardComponent
                                                key={restriction.id}
                                                restriction={restriction}
                                                onRemove={removeDietaryRestriction}
                                                isApproved={isApproved}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No dietary restrictions added yet.
                                    </p>
                                )}
                            </div>

                            {/* Special Dietary Needs */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Special Medical Dietary Needs</h4>
                                <CheckboxField 
                                    name="requires_special_diet" 
                                    label="My child requires a special medically-necessary diet" 
                                />

                                {requiresSpecialDiet && (
                                    <div className="space-y-4">
                                        {renderFormField("special_diet_type", "Type of Special Diet", true)}
                                        {renderFormField("special_diet_details", "Diet Details and Requirements", true)}
                                        
                                        <CheckboxField 
                                            name="prescribed_by_doctor" 
                                            label="This diet is prescribed by a healthcare provider" 
                                        />

                                        {prescribedByDoctor && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderFormField("doctor_name", "Healthcare Provider Name")}
                                                {renderFormField("doctor_contact", "Provider Contact Information")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* School Meal Program */}
                    <Card className="shadow-none border-0 border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle className="text-green-700">School Meal Program</CardTitle>
                            <p className="text-sm text-gray-600">Lunch and snack participation information</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Meal Program Participation */}
                            <div className="space-y-4">
                                {renderFormField("school_meal_program", "School Meal Program Participation", true, true)}
                                {renderFormField("meal_program_accommodations", "Meal Program Accommodations Needed")}

                                {/* Free/Reduced Lunch */}
                                <CheckboxField 
                                    name="free_reduced_lunch_app" 
                                    label="Applied for Free/Reduced Price Lunch Program" 
                                />
                                {renderFormField("free_reduced_lunch_status", "Application Status")}
                            </div>

                            {/* Lunch from Home */}
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="brings_lunch_from_home" 
                                    label="My child will regularly bring lunch from home" 
                                />
                                {renderFormField("lunch_restrictions", "Lunch Restrictions from Home")}
                                {renderFormField("lunch_preferences", "Lunch Preferences")}
                            </div>

                            {/* Snack Information */}
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="classroom_snacks_allowed" 
                                    label="My child may participate in classroom snacks" 
                                />
                                {renderFormField("snack_restrictions", "Snack Restrictions")}
                                {renderFormField("preferred_snacks", "Preferred Snacks")}
                            </div>

                            {/* Special Occasions */}
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="birthday_celebrations" 
                                    label="My child may participate in birthday/holiday treat celebrations" 
                                />
                                {renderFormField("birthday_treat_restrictions", "Birthday Treat Restrictions")}
                                {renderFormField("alternative_celebration", "Alternative Celebration Preference")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency & Medical Information */}
                    <Card className="shadow-none border-0 border-l-4 border-l-orange-500">
                        <CardHeader>
                            <CardTitle className="text-orange-700">Emergency & Medical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Emergency Medications */}
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="epipen_required" 
                                    label="EpiPen required for allergic reactions" 
                                />
                                {renderFormField("epipen_location", "EpiPen Storage Location")}

                                <CheckboxField 
                                    name="antihistamine_required" 
                                    label="Antihistamine medication required" 
                                />
                                {renderFormField("antihistamine_details", "Antihistamine Details")}

                                {renderFormField("emergency_action_plan", "Emergency Action Plan Details")}
                            </div>

                            {/* Medical Documentation */}
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="medical_documentation_provided" 
                                    label="Medical documentation has been provided to the school" 
                                />
                                {renderFormField("documentation_type", "Type of Documentation Provided")}
                                <CheckboxField 
                                    name="care_plan_on_file" 
                                    label="Individualized Healthcare Plan on file" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Consent & Authorization */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Consent & Authorization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="consent_meal_modifications" 
                                    label="I authorize the school to make appropriate meal modifications based on the dietary needs outlined above." 
                                />
                                <CheckboxField 
                                    name="consent_emergency_treatment" 
                                    label="I authorize the school to administer emergency treatment (EpiPen, antihistamine) as outlined in the emergency action plan." 
                                    required 
                                />
                                <CheckboxField 
                                    name="consent_share_info" 
                                    label="I authorize the school to share this dietary information with food service staff, teachers, and other school personnel as needed for my child's safety." 
                                />
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