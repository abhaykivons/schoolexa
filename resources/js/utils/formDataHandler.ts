/**
 * Universal form data handler for all admission forms
 * Works with the new JSON-based architecture
 */

export interface FormDataProps {
    student: any;
    form: any;
    admissionForm?: any;
    formData?: Record<string, any>;
}

/**
 * Check if form has been submitted
 */
export const isFormSubmitted = (admissionForm: any): boolean => {
    return !!admissionForm?.id;
};

/**
 * Get form data object (already denormalized from backend)
 */
export const getFormData = (formData?: Record<string, any>): Record<string, any> => {
    return formData || {};
};

/**
 * Get default value for a field
 */
export const getFieldValue = (
    formData: Record<string, any>,
    key: string,
    defaultValue: any = ""
): any => {
    return formData[key] ?? defaultValue;
};

/**
 * Prepare form submission data
 */
export const prepareSubmitData = (
    values: Record<string, any>,
    studentId: number,
    additionalData?: Record<string, any>
): Record<string, any> => {
    return {
        ...values,
        student_id: studentId,
        ...additionalData,
    };
};

/**
 * Handle form submission
 */
export const handleFormSubmit = async (
    routeName: string,
    submitData: Record<string, any>,
    callbacks: {
        onSuccess?: () => void;
        onError?: (errors: any) => void;
        onStart?: () => void;
        onFinish?: () => void;
    } = {}
) => {
    const { onStart, onSuccess, onError, onFinish } = callbacks;
    
    if (onStart) onStart();

    try {
        const { router } = await import("@inertiajs/react");
        const { toast } = await import("sonner");

        await router.post(routeName, submitData, {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
                toast.success("Form submitted successfully!");
            },
            onError: (errors) => {
                if (onError) onError(errors);
                toast.error("Failed to submit form. Please check the errors.");
            },
            onFinish: () => {
                if (onFinish) onFinish();
            }
        });
    } catch (error) {
        const { toast } = await import("sonner");
        toast.error("An unexpected error occurred. Please try again.");
        if (onFinish) onFinish();
    }
};

/**
 * Handle single field update
 */
export const handleFieldUpdate = async (
    routeName: string,
    formId: number,
    studentId: number,
    fieldName: string,
    value: any,
    callbacks: {
        onSuccess?: () => void;
        onError?: () => void;
        onStart?: () => void;
        onFinish?: () => void;
    } = {}
) => {
    const { onStart, onSuccess, onError, onFinish } = callbacks;
    
    if (onStart) onStart();

    try {
        const { router } = await import("@inertiajs/react");
        const { toast } = await import("sonner");

        await router.post(routeName, {
            form_id: formId,
            student_id: studentId,
            key: fieldName,
            value: value
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
                toast.success("Field updated successfully!");
            },
            onError: () => {
                if (onError) onError();
                toast.error("Failed to update field.");
            },
            onFinish: () => {
                if (onFinish) onFinish();
            }
        });
    } catch (error) {
        const { toast } = await import("sonner");
        toast.error("An unexpected error occurred.");
        if (onFinish) onFinish();
    }
};

