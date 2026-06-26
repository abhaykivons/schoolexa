// emergency-contact.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useRHF } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, Plus, Trash2, Phone, Mail, User, MessageSquare, AlertCircle } from "lucide-react";
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
const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const schema = z.object({
    form_id: z.number().min(1),

    // Primary Parent/Guardian Contacts
    primary_guardian1_name: z.string().min(1, "Primary guardian name is required"),
    primary_guardian1_relationship: z.string().min(1, "Relationship is required"),
    primary_guardian1_phone: z.string().min(1, "Phone is required").refine((v) => phoneRegex.test(v), "Invalid phone number"),
    primary_guardian1_phone_type: z.enum(["mobile", "home", "work"]).default("mobile"),
    primary_guardian1_email: z.string().min(1, "Email is required").refine((v) => emailRegex.test(v), "Invalid email"),
    primary_guardian1_address: z.string().optional().or(z.literal("")),

    primary_guardian2_name: z.string().optional().or(z.literal("")),
    primary_guardian2_relationship: z.string().optional().or(z.literal("")),
    primary_guardian2_phone: z.string().optional().or(z.literal("")).refine((v) => !v || phoneRegex.test(v), "Invalid phone number"),
    primary_guardian2_phone_type: z.enum(["mobile", "home", "work"]).optional().default("mobile"),
    primary_guardian2_email: z.string().optional().or(z.literal("")).refine((v) => !v || emailRegex.test(v), "Invalid email"),
    primary_guardian2_address: z.string().optional().or(z.literal("")),

    // Emergency Contacts (Non-Parents)
    emergency_contacts: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        relationship: z.string().min(1, "Relationship is required"),
        primary_phone: z.string().min(1, "Phone is required").refine((v) => phoneRegex.test(v), "Invalid phone number"),
        primary_phone_type: z.enum(["mobile", "home", "work"]),
        alternate_phone: z.string().optional().or(z.literal("")),
        email: z.string().optional().or(z.literal("")).refine((v) => !v || emailRegex.test(v), "Invalid email"),
        address: z.string().optional().or(z.literal("")),
        can_pickup: z.boolean().default(false),
        priority_order: z.number().default(1)
    })).default([]),

    // Authorized Pickup Persons
    authorized_pickup: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        relationship: z.string().min(1, "Relationship is required"),
        primary_phone: z.string().min(1, "Phone is required").refine((v) => phoneRegex.test(v), "Invalid phone number"),
        primary_phone_type: z.enum(["mobile", "home", "work"]),
        alternate_phone: z.string().optional().or(z.literal("")),
        email: z.string().optional().or(z.literal("")).refine((v) => !v || emailRegex.test(v), "Invalid email"),
        address: z.string().optional().or(z.literal("")),
        identification_required: z.boolean().default(true),
        notes: z.string().optional().or(z.literal(""))
    })).default([]),

    // Emergency Procedures
    preferred_hospital: z.string().optional().or(z.literal("")),
    medical_alert_info: z.string().optional().or(z.literal("")),
    emergency_instructions: z.string().optional().or(z.literal("")),

    // Communication Preferences
    contact_preference_emergency: z.enum(["phone_call", "text_message", "email", "any"]).default("phone_call"),
    contact_preference_general: z.enum(["phone_call", "text_message", "email", "any"]).default("email"),
    contact_time_preference: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
    language_preference: z.string().optional().or(z.literal("")),
    special_communication_needs: z.string().optional().or(z.literal("")),

    // Consent & Authorization
    consent_medical_emergency: z.boolean().refine(val => val === true, "Consent for medical emergency treatment is required"),
    consent_contact_emergency: z.boolean().default(true),
    consent_share_contact_info: z.boolean().default(false),
    signature: z.string().min(1, "Signature is required"),
    signature_date: z.string().min(1, "Signature date is required"),
});

type FormValues = z.infer<typeof schema>;
type ContactPerson = {
    id: string;
    name: string;
    relationship: string;
    primary_phone: string;
    primary_phone_type: "mobile" | "home" | "work";
    alternate_phone: string;
    email: string;
    address: string;
    can_pickup?: boolean;
    priority_order?: number;
    identification_required?: boolean;
    notes?: string;
};

// Contact Person Form Component - defined outside main component to prevent re-creation on render
const ContactFormComponent: React.FC<{
    type: 'emergency' | 'pickup';
    contact: ContactPerson;
    onChange: (contact: ContactPerson) => void;
    onSave: () => void;
    onCancel: () => void;
}> = ({ type, contact, onChange, onSave, onCancel }) => {
    const [errors, setErrors] = useState<{ name?: string; relationship?: string; primary_phone?: string }>({});

    const handleSave = () => {
        const newErrors: { name?: string; relationship?: string; primary_phone?: string } = {};
        
        if (!contact.name.trim()) {
            newErrors.name = "Full name is required";
        }
        if (!contact.relationship.trim()) {
            newErrors.relationship = "Relationship is required";
        }
        if (!contact.primary_phone.trim()) {
            newErrors.primary_phone = "Primary phone is required";
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
            <h4 className="font-medium mb-4">
                {type === 'emergency' ? 'Add Emergency Contact' : 'Add Authorized Pickup Person'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Full Name *"
                        value={contact.name}
                        onChange={(e) => {
                            onChange({...contact, name: e.target.value});
                            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <Input
                        placeholder="Relationship *"
                        value={contact.relationship}
                        onChange={(e) => {
                            onChange({...contact, relationship: e.target.value});
                            if (errors.relationship) setErrors(prev => ({ ...prev, relationship: undefined }));
                        }}
                        className={errors.relationship ? "border-red-500" : ""}
                    />
                    {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
                </div>
                <div>
                    <Input
                        placeholder="Primary Phone *"
                        value={contact.primary_phone}
                        onChange={(e) => {
                            onChange({...contact, primary_phone: e.target.value});
                            if (errors.primary_phone) setErrors(prev => ({ ...prev, primary_phone: undefined }));
                        }}
                        className={errors.primary_phone ? "border-red-500" : ""}
                    />
                    {errors.primary_phone && <p className="text-red-500 text-xs mt-1">{errors.primary_phone}</p>}
                </div>
                <Select 
                    value={contact.primary_phone_type} 
                    onValueChange={(value: "mobile" | "home" | "work") => onChange({...contact, primary_phone_type: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Phone type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Alternate Phone (optional)"
                    value={contact.alternate_phone}
                    onChange={(e) => onChange({...contact, alternate_phone: e.target.value})}
                />
                <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={contact.email}
                    onChange={(e) => onChange({...contact, email: e.target.value})}
                />
                <Input
                    placeholder="Address (optional)"
                    className="md:col-span-2"
                    value={contact.address}
                    onChange={(e) => onChange({...contact, address: e.target.value})}
                />
                {type === 'pickup' && (
                    <>
                        <div className="flex items-center space-x-2 md:col-span-2">
                            <Checkbox
                                checked={contact.identification_required}
                                onCheckedChange={(checked) => 
                                    onChange({...contact, identification_required: checked as boolean})
                                }
                            />
                            <Label>Require ID verification at pickup</Label>
                        </div>
                        <Input
                            placeholder="Additional notes (optional)"
                            className="md:col-span-2"
                            value={contact.notes}
                            onChange={(e) => onChange({...contact, notes: e.target.value})}
                        />
                    </>
                )}
                {type === 'emergency' && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                        <Checkbox
                            checked={contact.can_pickup}
                            onCheckedChange={(checked) => 
                                onChange({...contact, can_pickup: checked as boolean})
                            }
                        />
                        <Label>Also authorized for pickup</Label>
                    </div>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                <Button type="button" onClick={handleSave} size="sm">
                    Add
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} size="sm">
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

// Contact Card Component - defined outside main component
const ContactCardComponent: React.FC<{
    contact: ContactPerson;
    onRemove: (id: string) => void;
    type: 'emergency' | 'pickup';
    isApproved: boolean;
}> = ({ contact, onRemove, type, isApproved }) => (
    <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium">{contact.name}</h4>
                    <span className="text-sm text-gray-600">({contact.relationship})</span>
                </div>
                
                <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{contact.primary_phone}</span>
                        <span className="text-xs text-gray-500 capitalize">({contact.primary_phone_type})</span>
                    </div>
                    
                    {contact.alternate_phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{contact.alternate_phone}</span>
                            <span className="text-xs text-gray-500">(alternate)</span>
                        </div>
                    )}
                    
                    {contact.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{contact.email}</span>
                        </div>
                    )}
                    
                    {contact.address && (
                        <div className="text-gray-600">{contact.address}</div>
                    )}
                    
                    {type === 'pickup' && contact.identification_required && (
                        <div className="text-xs text-orange-600 font-medium">
                            ID verification required at pickup
                        </div>
                    )}
                    
                    {type === 'emergency' && contact.can_pickup && (
                        <div className="text-xs text-green-600 font-medium">
                            Also authorized for student pickup
                        </div>
                    )}
                    
                    {contact.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                            Notes: {contact.notes}
                        </div>
                    )}
                </div>
            </div>
            
            {!isApproved && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(contact.id)}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            )}
        </div>
    </Card>
);

export default function EmergencyContactForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Form is submitted only if status is not draft (null, undefined, or 'draft' means not submitted)
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    const [emergencyContacts, setEmergencyContacts] = useState<ContactPerson[]>([]);
    
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
    const [authorizedPickup, setAuthorizedPickup] = useState<ContactPerson[]>([]);
    const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
    const [showPickupForm, setShowPickupForm] = useState(false);
    const [newEmergencyContact, setNewEmergencyContact] = useState<ContactPerson>({
        id: "",
        name: "",
        relationship: "",
        primary_phone: "",
        primary_phone_type: "mobile",
        alternate_phone: "",
        email: "",
        address: "",
        can_pickup: false,
        priority_order: 1
    });
    const [newPickupPerson, setNewPickupPerson] = useState<ContactPerson>({
        id: "",
        name: "",
        relationship: "",
        primary_phone: "",
        primary_phone_type: "mobile",
        alternate_phone: "",
        email: "",
        address: "",
        identification_required: true,
        notes: ""
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
        // Load emergency contacts and authorized pickup from form data
        if (formDataObject.emergency_contacts) {
            const parsedContacts = parseArrayData(formDataObject.emergency_contacts);
            setEmergencyContacts(parsedContacts);
        }

        if (formDataObject.authorized_pickup) {
            const parsedPickup = parseArrayData(formDataObject.authorized_pickup);
            setAuthorizedPickup(parsedPickup);
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
                emergency_contacts: parseArrayData(formDataObject.emergency_contacts) || emergencyContacts,
                authorized_pickup: parseArrayData(formDataObject.authorized_pickup) || authorizedPickup,
            } as FormValues;
        }

        return {
            form_id: form.id,

            // Primary Parent/Guardian Contacts
            primary_guardian1_name: "",
            primary_guardian1_relationship: "",
            primary_guardian1_phone: "",
            primary_guardian1_phone_type: "mobile",
            primary_guardian1_email: "",
            primary_guardian1_address: "",

            primary_guardian2_name: "",
            primary_guardian2_relationship: "",
            primary_guardian2_phone: "",
            primary_guardian2_phone_type: "mobile",
            primary_guardian2_email: "",
            primary_guardian2_address: "",

            // Emergency Contacts
            emergency_contacts: [],

            // Authorized Pickup Persons
            authorized_pickup: [],

            // Emergency Procedures
            preferred_hospital: "",
            medical_alert_info: "",
            emergency_instructions: "",

            // Communication Preferences
            contact_preference_emergency: "phone_call",
            contact_preference_general: "email",
            contact_time_preference: "anytime",
            language_preference: "",
            special_communication_needs: "",

            // Consent & Authorization
            consent_medical_emergency: false,
            consent_contact_emergency: true,
            consent_share_contact_info: false,
            signature: "",
            signature_date: ""
        };
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    // Emergency Contact Management
    const addEmergencyContact = () => {
        if (newEmergencyContact.name.trim() && newEmergencyContact.primary_phone.trim()) {
            const contact = {
                ...newEmergencyContact,
                id: Math.random().toString(36).substr(2, 9)
            };
            const updatedContacts = [...emergencyContacts, contact];
            setEmergencyContacts(updatedContacts);
            rhForm.setValue("emergency_contacts", updatedContacts);
            
            setNewEmergencyContact({
                id: "",
                name: "",
                relationship: "",
                primary_phone: "",
                primary_phone_type: "mobile",
                alternate_phone: "",
                email: "",
                address: "",
                can_pickup: false,
                priority_order: updatedContacts.length + 1
            });
            setShowEmergencyContactForm(false);
            
            handleFieldUpdate("emergency_contacts", JSON.stringify(updatedContacts));
        }
    };

    const removeEmergencyContact = (id: string) => {
        const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
        setEmergencyContacts(updatedContacts);
        rhForm.setValue("emergency_contacts", updatedContacts);
        handleFieldUpdate("emergency_contacts", JSON.stringify(updatedContacts));
    };

    // Authorized Pickup Management
    const addPickupPerson = () => {
        if (newPickupPerson.name.trim() && newPickupPerson.primary_phone.trim()) {
            const person = {
                ...newPickupPerson,
                id: Math.random().toString(36).substr(2, 9)
            };
            const updatedPickup = [...authorizedPickup, person];
            setAuthorizedPickup(updatedPickup);
            rhForm.setValue("authorized_pickup", updatedPickup);
            
            setNewPickupPerson({
                id: "",
                name: "",
                relationship: "",
                primary_phone: "",
                primary_phone_type: "mobile",
                alternate_phone: "",
                email: "",
                address: "",
                identification_required: true,
                notes: ""
            });
            setShowPickupForm(false);
            
            handleFieldUpdate("authorized_pickup", JSON.stringify(updatedPickup));
        }
    };

    const removePickupPerson = (id: string) => {
        const updatedPickup = authorizedPickup.filter(person => person.id !== id);
        setAuthorizedPickup(updatedPickup);
        rhForm.setValue("authorized_pickup", updatedPickup);
        handleFieldUpdate("authorized_pickup", JSON.stringify(updatedPickup));
    };

    const handleInitialSubmit = async (values: FormValues) => {
        setIsFormSubmitting(true);

        try {
            const submitData = {
                ...values,
                student_id: student.id,
                emergency_contacts: emergencyContacts,
                authorized_pickup: authorizedPickup
            };

            await router.post(route("parent.forms.submit"), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormSubmitting(false);
                    toast.success("Emergency Contact Information submitted successfully!");
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
                                {name.includes('preference') ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {name.includes('emergency') ? (
                                                <>
                                                    <SelectItem value="phone_call">Phone Call</SelectItem>
                                                    <SelectItem value="text_message">Text Message</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="any">Any Method</SelectItem>
                                                </>
                                            ) : name.includes('time') ? (
                                                <>
                                                    <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                                                    <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                                                    <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                                                    <SelectItem value="anytime">Anytime</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="phone_call">Phone Call</SelectItem>
                                                    <SelectItem value="text_message">Text Message</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="any">Any Method</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : name.includes('phone_type') ? (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id={name as string}>
                                            <SelectValue placeholder="Phone type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mobile">Mobile</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="work">Work</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : ['medical_alert_info', 'emergency_instructions', 'special_communication_needs'].includes(name as string) ? (
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
                                        type={name.includes('email') ? 'email' : name.includes('date') ? 'date' : 'text'}
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
                                        "Your emergency contact information has been approved. Any changes you make will require school approval."
                                    ) : hasPendingChanges ? (
                                        "Your contact information has pending changes awaiting approval. You can make additional updates before final approval."
                                    ) : (
                                        "Your contact information has been submitted. You can update it freely until school approval. Click the edit icon next to any field to update it."
                                    )
                                ) : (
                                    "Please provide complete and accurate emergency contact information. Required fields are marked with *."
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

                    {/* Primary Parent/Guardian Contacts */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Primary Parent/Guardian Contacts</CardTitle>
                            <p className="text-sm text-gray-600">Primary contacts will be called first in case of emergency</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Primary Guardian 1 */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">Primary Guardian 1</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("primary_guardian1_name", "Full Name", true)}
                                    {renderFormField("primary_guardian1_relationship", "Relationship to Student", true)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("primary_guardian1_phone", "Primary Phone", true)}
                                    {renderFormField("primary_guardian1_phone_type", "Phone Type", true)}
                                    {renderFormField("primary_guardian1_email", "Email Address", true)}
                                </div>
                                {renderFormField("primary_guardian1_address", "Address")}
                            </div>

                            {/* Primary Guardian 2 */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">Primary Guardian 2 (Optional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderFormField("primary_guardian2_name", "Full Name")}
                                    {renderFormField("primary_guardian2_relationship", "Relationship to Student")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("primary_guardian2_phone", "Primary Phone")}
                                    {renderFormField("primary_guardian2_phone_type", "Phone Type")}
                                    {renderFormField("primary_guardian2_email", "Email Address")}
                                </div>
                                {renderFormField("primary_guardian2_address", "Address")}
                            </div>
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency Contacts */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Emergency Contacts</CardTitle>
                            <p className="text-sm text-gray-600">Additional contacts if parents cannot be reached</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isSubmitted && (
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Additional Emergency Contacts</h4>
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowEmergencyContactForm(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Emergency Contact
                                    </Button>
                                </div>
                            )}
                            
                            {showEmergencyContactForm && (
                                <ContactFormComponent
                                    type="emergency"
                                    contact={newEmergencyContact}
                                    onChange={setNewEmergencyContact}
                                    onSave={addEmergencyContact}
                                    onCancel={() => setShowEmergencyContactForm(false)}
                                />
                            )}
                            
                            {emergencyContacts.length > 0 ? (
                                <div className="space-y-3">
                                    {emergencyContacts.map((contact) => (
                                        <ContactCardComponent
                                            key={contact.id}
                                            contact={contact}
                                            onRemove={removeEmergencyContact}
                                            type="emergency"
                                            isApproved={isApproved}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No additional emergency contacts added yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Authorized Pickup Persons */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Authorized Pickup Persons</CardTitle>
                            <p className="text-sm text-gray-600">People authorized to pick up your child from school</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isSubmitted && (
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Authorized Pickup Persons</h4>
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowPickupForm(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Pickup Person
                                    </Button>
                                </div>
                            )}
                            
                            {showPickupForm && (
                                <ContactFormComponent
                                    type="pickup"
                                    contact={newPickupPerson}
                                    onChange={setNewPickupPerson}
                                    onSave={addPickupPerson}
                                    onCancel={() => setShowPickupForm(false)}
                                />
                            )}
                            
                            {authorizedPickup.length > 0 ? (
                                <div className="space-y-3">
                                    {authorizedPickup.map((person) => (
                                        <ContactCardComponent
                                            key={person.id}
                                            contact={person}
                                            onRemove={removePickupPerson}
                                            type="pickup"
                                            isApproved={isApproved}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No authorized pickup persons added yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Emergency Procedures */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Emergency Procedures & Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renderFormField("preferred_hospital", "Preferred Hospital/Clinic")}
                            {renderFormField("medical_alert_info", "Medical Alert Information")}
                            {renderFormField("emergency_instructions", "Special Emergency Instructions")}
                        </CardContent>
                    </Card>

                    <hr />

                    {/* Communication Preferences */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Communication Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("contact_preference_emergency", "Emergency Contact Preference", true)}
                                {renderFormField("contact_preference_general", "General Contact Preference", true)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("contact_time_preference", "Preferred Contact Time", true)}
                                {renderFormField("language_preference", "Language Preference")}
                            </div>
                            {renderFormField("special_communication_needs", "Special Communication Needs")}
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
                                    name="consent_medical_emergency" 
                                    label="I authorize the school to seek emergency medical treatment for my child if I cannot be reached." 
                                    required 
                                />
                                <CheckboxField 
                                    name="consent_contact_emergency" 
                                    label="I authorize the school to contact the emergency contacts listed above if I cannot be reached." 
                                />
                                <CheckboxField 
                                    name="consent_share_contact_info" 
                                    label="I authorize the school to share this contact information with teachers and staff as needed for the safety and well-being of my child." 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("signature", "Parent/Guardian Signature", true)}
                                {renderFormField("signature_date", "Date", true)}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}