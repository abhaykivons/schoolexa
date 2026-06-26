import { useCallback } from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Hook for handling form validation errors
 * - Shows toast notification with the first validation error
 * - Scrolls to the first field with an error
 */
export function useFormValidation() {
    /**
     * Scroll to the first field with an error
     */
    const scrollToFirstError = useCallback((errors: FieldErrors<FieldValues>) => {
        // Get the first error field name
        const firstErrorField = Object.keys(errors)[0];
        
        if (!firstErrorField) return;

        // Try to find the element by ID (most form fields use name as ID)
        let element = document.getElementById(firstErrorField);
        
        // If not found by ID, try to find by name attribute
        if (!element) {
            element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        }
        
        // If still not found, try to find the FormMessage or error element
        if (!element) {
            element = document.querySelector(`[data-error-field="${firstErrorField}"]`) as HTMLElement;
        }

        if (element) {
            // Scroll the element into view with smooth behavior
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });

            // Focus the element if it's focusable
            setTimeout(() => {
                if (element && 'focus' in element && typeof element.focus === 'function') {
                    element.focus();
                }
            }, 500);
        }
    }, []);

    /**
     * Get the first error message from the errors object
     */
    const getFirstErrorMessage = useCallback((errors: FieldErrors<FieldValues>): string | null => {
        const firstErrorKey = Object.keys(errors)[0];
        
        if (!firstErrorKey) return null;

        const error = errors[firstErrorKey];
        
        if (!error) return null;

        // Handle nested errors (like arrays)
        if (typeof error === 'object' && 'message' in error) {
            return error.message as string;
        }

        // Handle array field errors (like emergency_contacts.0.name)
        if (Array.isArray(error)) {
            const firstArrayError = error.find((e) => e);
            if (firstArrayError && typeof firstArrayError === 'object') {
                const nestedKeys = Object.keys(firstArrayError);
                if (nestedKeys.length > 0) {
                    const nestedError = firstArrayError[nestedKeys[0]];
                    if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
                        return nestedError.message as string;
                    }
                }
            }
        }

        // Handle nested object errors
        if (typeof error === 'object') {
            const nestedKeys = Object.keys(error);
            for (const nestedKey of nestedKeys) {
                const nestedError = (error as Record<string, any>)[nestedKey];
                if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
                    return nestedError.message as string;
                }
            }
        }

        return null;
    }, []);

    /**
     * Handle validation errors - shows toast and scrolls to first error
     */
    const handleValidationErrors = useCallback((errors: FieldErrors<FieldValues>) => {
        const errorCount = Object.keys(errors).length;
        
        if (errorCount === 0) return;

        const firstErrorMessage = getFirstErrorMessage(errors);
        
        // Show toast with first error message
        if (firstErrorMessage) {
            toast.error(firstErrorMessage, {
                description: errorCount > 1 
                    ? `Please fix this and ${errorCount - 1} other validation ${errorCount - 1 === 1 ? 'error' : 'errors'}.`
                    : 'Please fix this error and try again.',
            });
        } else {
            toast.error('Please fix the validation errors', {
                description: `There ${errorCount === 1 ? 'is' : 'are'} ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} that need${errorCount === 1 ? 's' : ''} to be fixed.`,
            });
        }

        // Scroll to first error
        scrollToFirstError(errors);
    }, [getFirstErrorMessage, scrollToFirstError]);

    /**
     * Create an onInvalid handler for react-hook-form
     */
    const onFormInvalid = useCallback((errors: FieldErrors<FieldValues>) => {
        handleValidationErrors(errors);
    }, [handleValidationErrors]);

    return {
        scrollToFirstError,
        getFirstErrorMessage,
        handleValidationErrors,
        onFormInvalid,
    };
}

