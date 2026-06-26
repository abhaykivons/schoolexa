@extends('pdf.admission.layout')
@include('pdf.admission.components')

@section('title', 'Health Summary Form - ' . $student->first_name . ' ' . $student->last_name)
@section('form-title', 'Health Summary Form')

@php
    $safe = function($value) {
        if (is_array($value)) {
            $filtered = array_filter($value, fn($v) => $v !== null && $v !== '');
            return empty($filtered) ? '' : implode(', ', array_map(fn($v) => is_array($v) ? json_encode($v) : (string)$v, $filtered));
        }
        if (is_object($value)) { return json_encode($value); }
        return $value ?? '';
    };
    
    $isChecked = function($key) use ($formData) {
        $val = $formData[$key] ?? false;
        return $val === true || $val === '1' || $val === 'true' || $val === 1;
    };
    
    $getValue = function($key) use ($formData, $safe) {
        $val = $safe($formData[$key] ?? '');
        return $val ?: '<span class="text-muted" style="font-style:italic;">—</span>';
    };
@endphp

@section('content')
    <!-- Medical History Section -->
    <div class="section">
        <div class="section-header health">Medical History</div>
        <div class="section-content">
            <table style="width:100%;">
                <tr>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_chronic_illnesses') ? 'checked' : '' }}">{{ $isChecked('has_chronic_illnesses') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Has Chronic Illnesses</span>
                        </div>
                        @if($isChecked('has_chronic_illnesses') && ($formData['chronic_illnesses_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['chronic_illnesses_details']) }}
                            </div>
                        @endif
                    </td>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_hospitalizations') ? 'checked' : '' }}">{{ $isChecked('has_hospitalizations') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Has Been Hospitalized</span>
                        </div>
                        @if($isChecked('has_hospitalizations') && ($formData['hospitalizations_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['hospitalizations_details']) }}
                            </div>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_surgeries') ? 'checked' : '' }}">{{ $isChecked('has_surgeries') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Has Had Surgeries</span>
                        </div>
                        @if($isChecked('has_surgeries') && ($formData['surgeries_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['surgeries_details']) }}
                            </div>
                        @endif
                    </td>
                    <td style="padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_physical_limitations') ? 'checked' : '' }}">{{ $isChecked('has_physical_limitations') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Has Physical Limitations</span>
                        </div>
                        @if($isChecked('has_physical_limitations') && ($formData['physical_limitations_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['physical_limitations_details']) }}
                            </div>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Immunizations Section -->
    <div class="section">
        <div class="section-header info">Immunization Records</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:50%;padding:10px 12px;border:none;">
                        <span class="checkbox-box {{ $isChecked('immunization_up_to_date') ? 'checked' : '' }}">{{ $isChecked('immunization_up_to_date') ? '✓' : '' }}</span>
                        <span class="checkbox-label">Immunizations Are Up to Date</span>
                    </td>
                    <td style="width:50%;border:none;">
                        <div class="field-cell">
                            <span class="label">Immunization Exemptions</span>
                            <div class="notes-area">
                                {{ $safe($formData['immunization_exemptions'] ?? '') ?: 'None' }}
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Allergies Section -->
    <div class="section">
        <div class="section-header required">Allergies</div>
        <div class="section-content">
            <table style="width:100%;">
                <tr>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_drug_allergies') ? 'checked' : '' }}">{{ $isChecked('has_drug_allergies') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Drug Allergies</span>
                        </div>
                        @if($isChecked('has_drug_allergies') && ($formData['drug_allergies_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['drug_allergies_details']) }}
                            </div>
                        @endif
                    </td>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_food_allergies') ? 'checked' : '' }}">{{ $isChecked('has_food_allergies') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Food Allergies</span>
                        </div>
                        @if($isChecked('has_food_allergies') && ($formData['food_allergies_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['food_allergies_details']) }}
                            </div>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_environmental_allergies') ? 'checked' : '' }}">{{ $isChecked('has_environmental_allergies') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Environmental Allergies</span>
                        </div>
                        @if($isChecked('has_environmental_allergies') && ($formData['environmental_allergies_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['environmental_allergies_details']) }}
                            </div>
                        @endif
                    </td>
                    <td style="padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('has_insect_allergies') ? 'checked' : '' }}">{{ $isChecked('has_insect_allergies') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Insect Allergies</span>
                        </div>
                        @if($isChecked('has_insect_allergies') && ($formData['insect_allergies_details'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['insect_allergies_details']) }}
                            </div>
                        @endif
                    </td>
                </tr>
            </table>
            
            <div style="margin-top:12px;border-top:1px solid #e2e8f0;padding-top:12px;">
                <table class="form-table">
                    <tr>
                        <td style="width:30%;border:none;">
                            <div class="field-cell">
                                <span class="label">Allergy Severity</span>
                                <span class="value">
                                    @php $severity = $safe($formData['allergy_severity'] ?? ''); @endphp
                                    @if($severity)
                                        <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:8pt;font-weight:600;
                                            @if($severity === 'severe') background:#fed7d7;color:#742a2a;
                                            @elseif($severity === 'moderate') background:#fefcbf;color:#744210;
                                            @else background:#c6f6d5;color:#22543d;
                                            @endif
                                        ">{{ ucfirst($severity) }}</span>
                                    @else
                                        <span class="text-muted" style="font-style:italic;">—</span>
                                    @endif
                                </span>
                            </div>
                        </td>
                        <td style="width:70%;border:none;">
                            <div class="field-cell">
                                <span class="label">Emergency Allergy Action Plan</span>
                                <div class="notes-area">
                                    {{ $safe($formData['allergy_emergency_plan'] ?? '') ?: 'None specified' }}
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <!-- Medications Section -->
    <div class="section">
        <div class="section-header health">Medications</div>
        <div class="section-content">
            <table style="width:100%;">
                <tr>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <span class="checkbox-box {{ $isChecked('takes_regular_medications') ? 'checked' : '' }}">{{ $isChecked('takes_regular_medications') ? '✓' : '' }}</span>
                        <span class="checkbox-label">Takes Regular Medications</span>
                    </td>
                    <td style="width:50%;padding:10px 0;vertical-align:top;">
                        <div style="margin-bottom:8px;">
                            <span class="checkbox-box {{ $isChecked('uses_emergency_meds') ? 'checked' : '' }}">{{ $isChecked('uses_emergency_meds') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Uses Emergency Medications (EpiPen, Inhaler, etc.)</span>
                        </div>
                        @if($isChecked('uses_emergency_meds') && ($formData['emergency_medications'] ?? ''))
                            <div class="notes-area" style="margin-left:22px;margin-top:5px;">
                                {{ $safe($formData['emergency_medications']) }}
                            </div>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Healthcare Provider Section -->
    <div class="section">
        <div class="section-header">Healthcare Provider & Insurance</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:50%">
                        <div class="field-cell">
                            <span class="label">Primary Care Physician</span>
                            <span class="value">{!! $getValue('primary_care_physician') !!}</span>
                        </div>
                    </td>
                    <td style="width:50%">
                        <div class="field-cell">
                            <span class="label">Physician Phone</span>
                            <span class="value">{!! $getValue('physician_phone') !!}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="field-cell">
                            <span class="label">Insurance Company</span>
                            <span class="value">{!! $getValue('insurance_company') !!}</span>
                        </div>
                    </td>
                    <td>
                        <table style="width:100%;">
                            <tr>
                                <td style="width:50%;border:none;padding:0;">
                                    <div class="field-cell">
                                        <span class="label">Policy Number</span>
                                        <span class="value">{!! $getValue('policy_number') !!}</span>
                                    </div>
                                </td>
                                <td style="width:50%;border:none;padding:0;padding-left:10px;">
                                    <div class="field-cell">
                                        <span class="label">Group Number</span>
                                        <span class="value">{!! $getValue('group_number') !!}</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Additional Information -->
    <div class="section">
        <div class="section-header">Additional Information</div>
        <div class="section-content">
            <div class="field-cell" style="margin-bottom:12px;">
                <span class="label">Special Dietary Needs</span>
                <div class="notes-area">{{ $safe($formData['special_dietary_needs'] ?? '') ?: 'None' }}</div>
            </div>
            <div class="field-cell" style="margin-bottom:12px;">
                <span class="label">Activity Restrictions</span>
                <div class="notes-area">{{ $safe($formData['activity_restrictions'] ?? '') ?: 'None' }}</div>
            </div>
            <div class="field-cell">
                <span class="label">Additional Notes</span>
                <div class="notes-area">{{ $safe($formData['additional_notes'] ?? '') ?: 'None' }}</div>
            </div>
        </div>
    </div>

    <!-- Consent & Signature -->
    <div class="section">
        <div class="section-header consent">Consent & Signature</div>
        <div class="section-content">
            <div class="highlight-card" style="margin-bottom:15px;">
                <table style="width:100%;">
                    <tr>
                        <td style="width:50%;padding:8px 0;">
                            <span class="checkbox-box {{ $isChecked('consent_medical_treatment') ? 'checked' : '' }}">{{ $isChecked('consent_medical_treatment') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Consent for Emergency Medical Treatment</span>
                        </td>
                        <td style="width:50%;padding:8px 0;">
                            <span class="checkbox-box {{ $isChecked('consent_share_info') ? 'checked' : '' }}">{{ $isChecked('consent_share_info') ? '✓' : '' }}</span>
                            <span class="checkbox-label">Consent to Share Medical Information</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <table style="width:100%;">
                <tr>
                    <td style="width:60%;vertical-align:top;">
                        <div class="field-cell">
                            <span class="label">Parent/Guardian Signature</span>
                            <div class="signature-area">
                                @php $signature = $formData['signature'] ?? null; @endphp
                                @if(!empty($signature))
                                    @if(str_starts_with($signature, 'data:image'))
                                        <img src="{{ $signature }}" alt="Signature" style="max-height:45px;max-width:180px;">
                                    @else
                                        <span class="signature-text">{{ $signature }}</span>
                                    @endif
                                @else
                                    <span style="color:#a0aec0;font-style:italic;font-size:8pt;">Not signed</span>
                                @endif
                            </div>
                        </div>
                    </td>
                    <td style="width:40%;vertical-align:top;padding-left:15px;">
                        <div class="field-cell">
                            <span class="label">Date</span>
                            <span class="value" style="display:block;padding:10px;background:#f7fafc;border-radius:4px;text-align:center;">
                                @if(!empty($formData['signature_date']))
                                    {{ \Carbon\Carbon::parse($formData['signature_date'])->format('M d, Y') }}
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
