// SignatureInput Component - Canvas drawing and file upload for signatures
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Pencil, Upload, Trash2, RotateCcw, Check } from 'lucide-react';

interface SignatureInputProps {
    value: string;
    onChange: (value: string) => void;
    onSignatureSaved?: () => void; // Callback when signature is saved (for auto-setting date)
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const SignatureInput: React.FC<SignatureInputProps> = ({
    value,
    onChange,
    onSignatureSaved,
    label = "Signature",
    required = false,
    disabled = false,
    className = ""
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(value ? 'preview' : 'draw');
    const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Set drawing styles
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [activeTab]);

    // Get position from mouse or touch event
    const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        
        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }, []);

    // Start drawing
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        e.preventDefault();
        
        const pos = getPosition(e);
        setIsDrawing(true);
        setLastPoint(pos);
        setHasDrawn(true);
    }, [disabled, getPosition]);

    // Draw on canvas
    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !lastPoint) return;

        const currentPos = getPosition(e);

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        setLastPoint(currentPos);
    }, [isDrawing, disabled, lastPoint, getPosition]);

    // Stop drawing
    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setLastPoint(null);
    }, []);

    // Clear canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    }, []);

    // Save signature from canvas
    const saveSignature = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;

        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
        setActiveTab('preview');
        
        // Call the callback to auto-set date
        if (onSignatureSaved) {
            onSignatureSaved();
        }
    }, [hasDrawn, onChange, onSignatureSaved]);

    // Handle file upload
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            onChange(result);
            setActiveTab('preview');
            
            // Call the callback to auto-set date
            if (onSignatureSaved) {
                onSignatureSaved();
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    }, [onChange, onSignatureSaved]);

    // Clear signature
    const clearSignature = useCallback(() => {
        onChange('');
        clearCanvas();
        setActiveTab('draw');
    }, [onChange, clearCanvas]);

    // Check if value is a base64 image or text
    const isImageSignature = value?.startsWith('data:image');

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <Label className="text-sm font-medium mb-2 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            {disabled && value ? (
                // Read-only view
                <Card className="p-4 bg-gray-50">
                    {isImageSignature ? (
                        <div className="flex flex-col items-center">
                            <img 
                                src={value} 
                                alt="Signature" 
                                className="max-h-24 border border-gray-200 rounded bg-white p-2"
                            />
                            <span className="text-xs text-muted-foreground mt-2">Saved Signature</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="font-signature text-2xl italic text-gray-700">{value}</p>
                            <span className="text-xs text-muted-foreground">Text Signature</span>
                        </div>
                    )}
                </Card>
            ) : value ? (
                // Show saved signature with option to change
                <div className="space-y-2">
                    <Card className="p-4 bg-gray-50">
                        {isImageSignature ? (
                            <div className="flex flex-col items-center">
                                <img 
                                    src={value} 
                                    alt="Signature" 
                                    className="max-h-24 border border-gray-200 rounded bg-white p-2"
                                />
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="font-signature text-2xl italic text-gray-700">{value}</p>
                            </div>
                        )}
                    </Card>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearSignature}
                            className="w-full"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Change Signature
                        </Button>
                    )}
                </div>
            ) : (
                // Input mode - Draw or Upload
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="draw" disabled={disabled}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Draw
                        </TabsTrigger>
                        <TabsTrigger value="upload" disabled={disabled}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="draw" className="mt-2">
                        <div className="space-y-2">
                            <Card className="p-1 bg-white">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-32 border border-gray-200 rounded cursor-crosshair touch-none"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </Card>
                            <p className="text-xs text-muted-foreground text-center">
                                Draw your signature above using mouse or touch
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCanvas}
                                    disabled={!hasDrawn || disabled}
                                    className="flex-1"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={saveSignature}
                                    disabled={!hasDrawn || disabled}
                                    className="flex-1"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Save Signature
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-2">
                        <div className="space-y-2">
                            <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600 font-medium">
                                        Click to upload signature image
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG up to 2MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={disabled}
                                        className="hidden"
                                    />
                                </label>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default SignatureInput;

