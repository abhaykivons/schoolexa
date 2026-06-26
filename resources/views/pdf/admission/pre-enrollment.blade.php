@extends('pdf.admission.layout')
@include('pdf.admission.components')

@section('title', 'Pre-Enrollment Form - ' . $student->first_name . ' ' . $student->last_name)
@section('form-title', 'Pre-Enrollment Form')

@php
    $safe = function($value) {
        if (is_array($value)) {
            $filtered = array_filter($value, fn($v) => $v !== null && $v !== '');
            return empty($filtered) ? '' : implode(', ', array_map(fn($v) => is_array($v) ? json_encode($v) : (string)$v, $filtered));
        }
        if (is_object($value)) { return json_encode($value); }
        return $value ?? '';
    };
    
    $getValue = function($key) use ($formData, $safe) {
        $val = $safe($formData[$key] ?? '');
        // Escape parent-supplied data so it can't inject HTML/CSS into the PDF.
        return $val !== '' ? e($val) : '<span class="text-muted" style="font-style:italic;">—</span>';
    };

    $getGradeName = function($gradeId) use ($grades) {
        $name = $grades->firstWhere('id', $gradeId)?->name;
        return $name ? e($name) : '<span class="text-muted" style="font-style:italic;">—</span>';
    };
@endphp

@section('content')
    <!-- Student Information Section -->
    <div class="section">
        <div class="section-header info">Student Information</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Student Last Name</span>
                            <span class="value">{!! $getValue('student_last_name') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">First Name</span>
                            <span class="value">{!! $getValue('student_first_name') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Middle Name</span>
                            <span class="value">{!! $getValue('student_middle_name') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Legal Last Name</span>
                            <span class="value">{!! $getValue('legal_last_name') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="field-cell">
                            <span class="label">Present Grade</span>
                            <span class="value">{!! $getValue('present_grade') !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Grade Entering</span>
                            <span class="value">{!! $getGradeName($formData['grade_entering'] ?? null) !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Sex</span>
                            <span class="value">{{ ucfirst($safe($formData['sex'] ?? '')) ?: '—' }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Birthdate</span>
                            <span class="value">
                                @if(!empty($formData['birthdate']))
                                    {{ \Carbon\Carbon::parse($formData['birthdate'])->format('M d, Y') }}
                                @else
                                    <span class="text-muted" style="font-style:italic;">—</span>
                                @endif
                            </span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Home Phone</span>
                            <span class="value">{!! $getValue('home_phone') !!}</span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Home Language</span>
                            <span class="value">{!! $getValue('home_language') !!}</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Parent/Guardian 1 Section -->
    <div class="section">
        <div class="section-header">Parent / Guardian 1 (Primary Contact)</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Last Name</span>
                            <span class="value">{!! $getValue('parent1_last') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">First Name</span>
                            <span class="value">{!! $getValue('parent1_first') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Workplace</span>
                            <span class="value">{!! $getValue('parent1_workplace') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Business Phone</span>
                            <span class="value">{!! $getValue('parent1_business_phone') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Cell / Email</span>
                            <span class="value">{!! $getValue('parent1_cell_email') !!}</span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Address</span>
                            <span class="value">{!! $getValue('parent1_address') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="field-cell">
                            <span class="label">City</span>
                            <span class="value">{!! $getValue('parent1_city') !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">State</span>
                            <span class="value">{!! $getValue('parent1_state') !!}</span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">ZIP Code</span>
                            <span class="value">{!! $getValue('parent1_zip') !!}</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Parent/Guardian 2 Section -->
    <div class="section">
        <div class="section-header">Parent / Guardian 2 (Secondary Contact)</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Last Name</span>
                            <span class="value">{!! $getValue('parent2_last') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">First Name</span>
                            <span class="value">{!! $getValue('parent2_first') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Workplace</span>
                            <span class="value">{!! $getValue('parent2_workplace') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Business Phone</span>
                            <span class="value">{!! $getValue('parent2_business_phone') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Cell / Email</span>
                            <span class="value">{!! $getValue('parent2_cell_email') !!}</span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">Address</span>
                            <span class="value">{!! $getValue('parent2_address') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="field-cell">
                            <span class="label">City</span>
                            <span class="value">{!! $getValue('parent2_city') !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">State</span>
                            <span class="value">{!! $getValue('parent2_state') !!}</span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="field-cell">
                            <span class="label">ZIP Code</span>
                            <span class="value">{!! $getValue('parent2_zip') !!}</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Emergency Contacts Section -->
    <div class="section">
        <div class="section-header required">Emergency Contacts</div>
        <div class="section-content">
            <div class="alert alert-warning" style="margin-bottom:10px;">
                List two local persons (other than yourself) usually available during the school day who may be contacted in case of emergency.
            </div>
            <table class="form-table">
                <tr>
                    <td style="width:5%;text-align:center;background:#f7fafc;">
                        <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;color:#fff;border-radius:50%;line-height:22px;font-size:9pt;font-weight:bold;">1</span>
                    </td>
                    <td style="width:30%">
                        <div class="field-cell">
                            <span class="label">Name</span>
                            <span class="value">{!! $getValue('emergency1_name') !!}</span>
                        </div>
                    </td>
                    <td style="width:25%">
                        <div class="field-cell">
                            <span class="label">Relationship</span>
                            <span class="value">{!! $getValue('emergency1_relationship') !!}</span>
                        </div>
                    </td>
                    <td style="width:40%">
                        <div class="field-cell">
                            <span class="label">Phone Number</span>
                            <span class="value">{!! $getValue('emergency1_phone') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="text-align:center;background:#f7fafc;">
                        <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;color:#fff;border-radius:50%;line-height:22px;font-size:9pt;font-weight:bold;">2</span>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Name</span>
                            <span class="value">{!! $getValue('emergency2_name') !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Relationship</span>
                            <span class="value">{!! $getValue('emergency2_relationship') !!}</span>
                        </div>
                    </td>
                    <td>
                        <div class="field-cell">
                            <span class="label">Phone Number</span>
                            <span class="value">{!! $getValue('emergency2_phone') !!}</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Medical Information Section -->
    <div class="section">
        <div class="section-header health">Medical Information</div>
        <div class="section-content">
            <div class="alert alert-info" style="margin-bottom:10px;">
                Enter the name of your family physician who may be contacted when parents cannot be reached and medical assistance is indicated.
            </div>
            <table class="form-table" style="margin-bottom:10px;">
                <tr>
                    <td style="width:50%">
                        <div class="field-cell">
                            <span class="label">Family Doctor</span>
                            <span class="value">{!! $getValue('family_doctor') !!}</span>
                        </div>
                    </td>
                    <td style="width:50%">
                        <div class="field-cell">
                            <span class="label">Family Dentist</span>
                            <span class="value">{!! $getValue('family_dentist') !!}</span>
                        </div>
                    </td>
                </tr>
            </table>
            
            <div class="field-cell">
                <span class="label">Medical Notes / Allergies / Special Conditions</span>
                <div class="notes-area">
                    {{ $safe($formData['medical_notes'] ?? '') ?: 'None specified' }}
                </div>
            </div>
        </div>
    </div>

    <!-- Residency Verification & Signature Section -->
    <div class="section">
        <div class="section-header consent">Residency Verification & Signature</div>
        <div class="section-content">
            <div class="highlight-card">
                <p style="font-size:8pt;color:#2d3748;line-height:1.6;">
                    <strong style="color:#4f46e5;">RESIDENCY VERIFICATION:</strong> The residency information provided on this form is true and accurate as of this date. 
                    I understand that the falsification of an address or the use of any other fraudulent means to achieve enrollment or assignment 
                    shall be cause for revocation of the student's enrollment and assignment to the school serving the home attendance area.
                </p>
            </div>
            
            <table style="width:100%;margin-top:15px;">
                <tr>
                    <td style="width:60%;vertical-align:bottom;">
                        <div class="field-cell">
                            <span class="label">Parent/Guardian Signature</span>
                            <div class="signature-area">
                                @php
                                    $signature = $formData['residency_signature'] ?? $formData['signature'] ?? null;
                                @endphp
                                @if(!empty($signature))
                                    @if(str_starts_with($signature, 'data:image'))
                                        <img src="{{ $signature }}" alt="Signature" style="max-height:45px;max-width:180px;">
                                    @else
                                        <span class="signature-text">{{ $signature }}</span>
                                    @endif
                                @else
                                    <span style="color:#a0aec0;font-style:italic;font-size:8pt;">No signature provided</span>
                                @endif
                            </div>
                        </div>
                    </td>
                    <td style="width:40%;vertical-align:bottom;padding-left:15px;">
                        <div class="field-cell">
                            <span class="label">Date</span>
                            <span class="value" style="padding:8px;display:block;background:#f7fafc;border-radius:4px;">
                                @if(!empty($formData['residency_signature_date'] ?? $formData['signature_date'] ?? null))
                                    {{ \Carbon\Carbon::parse($formData['residency_signature_date'] ?? $formData['signature_date'])->format('M d, Y') }}
                                @else
                                    <span class="text-muted" style="font-style:italic;">—</span>
                                @endif
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Office Use Only -->
    <div class="section">
        <div class="info-box">
            <div style="font-size:8pt;font-weight:bold;text-transform:uppercase;color:#718096;margin-bottom:8px;letter-spacing:0.5px;">
                For Office Use Only
            </div>
            <table style="width:100%;font-size:8pt;">
                <tr>
                    <td style="width:33%;padding:4px 0;">
                        <span class="text-muted">Form Status:</span> 
                        <strong style="color:#4f46e5;">{{ strtoupper($admissionForm->status ?? 'N/A') }}</strong>
                    </td>
                    <td style="width:33%;padding:4px 0;">
                        <span class="text-muted">Version:</span> 
                        <strong>{{ $admissionForm->version ?? 'N/A' }}</strong>
                    </td>
                    <td style="width:33%;padding:4px 0;">
                        <span class="text-muted">Submitted:</span> 
                        <strong>{{ $admissionForm->updated_at?->format('M d, Y') ?? 'N/A' }}</strong>
                    </td>
                </tr>
            </table>
        </div>
    </div>
@endsection
