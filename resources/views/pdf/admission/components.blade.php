{{-- Modern PDF Components - Only declare functions if not already declared --}}
@php
if (!function_exists('pdfCheckbox')) {
    function pdfCheckbox($checked, $label = '') {
        $isChecked = $checked === true || $checked === '1' || $checked === 'true' || $checked === 1;
        $checkmark = $isChecked ? '✓' : '';
        $boxClass = $isChecked ? 'checkbox-box checked' : 'checkbox-box';
        
        $html = '<span class="' . $boxClass . '">' . $checkmark . '</span>';
        if ($label) {
            $html .= '<span class="checkbox-label">' . e($label) . '</span>';
        }
        return $html;
    }
}

if (!function_exists('pdfYesNo')) {
    function pdfYesNo($value) {
        $isYes = $value === true || $value === '1' || $value === 'true' || $value === 1;
        if ($isYes) {
            return '<span class="yes-badge">Yes</span>';
        }
        return '<span class="no-badge">No</span>';
    }
}

if (!function_exists('pdfFormatValue')) {
    function pdfFormatValue($value) {
        // Handle null/empty
        if ($value === null || $value === '' || $value === 'undefined') {
            return null;
        }
        
        // Handle arrays - convert to readable string
        if (is_array($value)) {
            // Filter out empty values and join with comma
            $filtered = array_filter($value, function($v) {
                return $v !== null && $v !== '' && $v !== 'undefined';
            });
            if (empty($filtered)) {
                return null;
            }
            return implode(', ', array_map(function($v) {
                return is_array($v) ? json_encode($v) : (string)$v;
            }, $filtered));
        }
        
        // Handle objects
        if (is_object($value)) {
            return json_encode($value);
        }
        
        return (string)$value;
    }
}

if (!function_exists('pdfField')) {
    function pdfField($label, $value, $type = 'text') {
        $formattedValue = pdfFormatValue($value);
        
        if ($formattedValue === null) {
            $displayValue = '<span class="value empty">—</span>';
        } elseif ($type === 'boolean') {
            $displayValue = '<span class="value">' . pdfYesNo($value) . '</span>';
        } elseif ($type === 'date' && $formattedValue) {
            try {
                $displayValue = '<span class="value">' . \Carbon\Carbon::parse($formattedValue)->format('M d, Y') . '</span>';
            } catch (\Exception $e) {
                $displayValue = '<span class="value">' . e($formattedValue) . '</span>';
            }
        } else {
            $displayValue = '<span class="value">' . e($formattedValue) . '</span>';
        }
        
        return '
            <div class="label">' . e($label) . '</div>
            ' . $displayValue;
    }
}

if (!function_exists('pdfDocumentStatus')) {
    function pdfDocumentStatus($status) {
        $class = $status === 'approved' ? 'approved' : ($status === 'rejected' ? 'rejected' : 'pending');
        return '<span class="doc-status ' . $class . '">' . ucfirst($status ?? 'pending') . '</span>';
    }
}

if (!function_exists('pdfSignature')) {
    function pdfSignature($value, $label = 'Signature') {
        $html = '<div class="field-cell">';
        $html .= '<div class="label">' . e($label) . '</div>';
        $html .= '<div class="signature-area">';
        
        if ($value) {
            // Check if it's a base64 image or URL
            if (strpos($value, 'data:image') === 0 || strpos($value, 'http') === 0) {
                $html .= '<img src="' . $value . '" alt="Signature">';
            } else {
                // Treat as text signature
                $html .= '<div class="signature-text">' . e($value) . '</div>';
            }
        } else {
            $html .= '<span style="color:#a0aec0;font-style:italic;font-size:8pt;">Not signed</span>';
        }
        
        $html .= '</div></div>';
        return $html;
    }
}
@endphp

