@extends('pdf.admission.layout')
@include('pdf.admission.components')

@section('title', 'Enrollment Document Checklist - ' . $student->first_name . ' ' . $student->last_name)
@section('form-title', 'Enrollment Document Checklist')

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

    $documentTypes = [
        'required' => [
            ['key' => 'birth_certificate', 'label' => 'Birth Certificate / Passport', 'desc' => 'Official document to verify age and identity'],
            ['key' => 'immunization_records', 'label' => 'Immunization Records', 'desc' => 'Current immunization records from healthcare provider'],
            ['key' => 'previous_transcripts', 'label' => 'Previous School Transcripts', 'desc' => 'Report cards or academic transcripts'],
            ['key' => 'proof_of_residency', 'label' => 'Proof of Residency', 'desc' => 'Utility bill, lease agreement, or similar'],
            ['key' => 'parent_guardian_id', 'label' => 'Parent/Guardian Photo ID', 'desc' => "Driver's license, state ID, or passport"],
        ],
        'health' => [
            ['key' => 'physical_exam_form', 'label' => 'Physical Examination Form', 'desc' => 'Completed within the last 12 months'],
            ['key' => 'dental_exam_form', 'label' => 'Dental Examination Form', 'desc' => 'Completed within the last 12 months'],
            ['key' => 'emergency_contact_form', 'label' => 'Emergency Contact Form', 'desc' => 'Complete emergency contact information'],
        ],
        'additional' => [
            ['key' => 'custody_documents', 'label' => 'Custody Documents', 'desc' => 'Court orders, custody agreements (if applicable)'],
            ['key' => 'iep_504_plan', 'label' => 'IEP / 504 Plan', 'desc' => 'Individualized Education Program (if applicable)'],
            ['key' => 'special_services_docs', 'label' => 'Special Services Documents', 'desc' => 'Additional support documentation (if applicable)'],
        ],
    ];
@endphp

@section('content')
    <!-- Document Summary -->
    @if($documents && $documents->count() > 0)
        <div class="section">
            <div class="section-header info">Document Summary</div>
            <div class="section-content">
                <table style="width:100%;">
                    <tr>
                        <td style="width:25%;text-align:center;padding:15px;">
                            <div style="font-size:24pt;font-weight:bold;color:#4f46e5;">{{ $documents->flatten()->count() }}</div>
                            <div style="font-size:8pt;text-transform:uppercase;color:#718096;letter-spacing:0.5px;">Total Uploaded</div>
                        </td>
                        <td style="width:25%;text-align:center;padding:15px;background:#f0fff4;border-radius:6px;">
                            <div style="font-size:24pt;font-weight:bold;color:#22543d;">{{ $documents->flatten()->where('status', 'approved')->count() }}</div>
                            <div style="font-size:8pt;text-transform:uppercase;color:#22543d;letter-spacing:0.5px;">Approved</div>
                        </td>
                        <td style="width:25%;text-align:center;padding:15px;background:#fffff0;border-radius:6px;">
                            <div style="font-size:24pt;font-weight:bold;color:#744210;">{{ $documents->flatten()->where('status', 'pending')->count() }}</div>
                            <div style="font-size:8pt;text-transform:uppercase;color:#744210;letter-spacing:0.5px;">Pending</div>
                        </td>
                        <td style="width:25%;text-align:center;padding:15px;background:#fff5f5;border-radius:6px;">
                            <div style="font-size:24pt;font-weight:bold;color:#742a2a;">{{ $documents->flatten()->where('status', 'rejected')->count() }}</div>
                            <div style="font-size:8pt;text-transform:uppercase;color:#742a2a;letter-spacing:0.5px;">Rejected</div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    @endif

    <!-- Required Documents Section -->
    <div class="section">
        <div class="section-header required">Required Documents</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:5%;background:#f7fafc;font-weight:600;text-align:center;font-size:7pt;padding:8px;color:#718096;">✓</td>
                    <td style="width:28%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Document Type</td>
                    <td style="width:35%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Description</td>
                    <td style="width:12%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Files</td>
                    <td style="width:20%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Status</td>
                </tr>
                @foreach($documentTypes['required'] as $docType)
                    @php
                        $uploaded = $isChecked($docType['key'] . '_uploaded');
                        $uploadedDocs = $documents->get($docType['key'], collect());
                        $hasApproved = $uploadedDocs->where('status', 'approved')->count() > 0;
                        $hasPending = $uploadedDocs->where('status', 'pending')->count() > 0;
                        $hasRejected = $uploadedDocs->where('status', 'rejected')->count() > 0;
                    @endphp
                    <tr>
                        <td style="text-align:center;padding:10px;">
                            <span class="checkbox-box {{ $uploaded ? 'checked' : '' }}">{{ $uploaded ? '✓' : '' }}</span>
                        </td>
                        <td style="padding:10px;font-weight:600;font-size:9pt;color:#2d3748;">{{ $docType['label'] }}</td>
                        <td style="padding:10px;font-size:8pt;color:#718096;">{{ $docType['desc'] }}</td>
                        <td style="text-align:center;padding:10px;">
                            @if($uploadedDocs->count() > 0)
                                <span style="display:inline-block;background:#4f46e5;color:#fff;padding:2px 8px;border-radius:10px;font-size:8pt;font-weight:600;">{{ $uploadedDocs->count() }}</span>
                            @else
                                <span style="color:#a0aec0;">0</span>
                            @endif
                        </td>
                        <td style="text-align:center;padding:10px;">
                            @if($hasApproved)
                                <span class="doc-status approved">Approved</span>
                            @elseif($hasPending)
                                <span class="doc-status pending">Pending</span>
                            @elseif($hasRejected)
                                <span class="doc-status rejected">Rejected</span>
                            @else
                                <span style="color:#a0aec0;font-size:8pt;">—</span>
                            @endif
                        </td>
                    </tr>
                    @if($safe($formData[$docType['key'] . '_notes'] ?? ''))
                        <tr>
                            <td></td>
                            <td colspan="4" style="padding:6px 10px;background:#ebf8ff;font-size:8pt;border-left:3px solid #3182ce;">
                                <strong style="color:#2c5282;">Notes:</strong> 
                                <span style="color:#2c5282;">{{ $safe($formData[$docType['key'] . '_notes']) }}</span>
                            </td>
                        </tr>
                    @endif
                @endforeach
            </table>
        </div>
    </div>

    <!-- Health Documents Section -->
    <div class="section">
        <div class="section-header health">Health Documents</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:5%;background:#f7fafc;font-weight:600;text-align:center;font-size:7pt;padding:8px;color:#718096;">✓</td>
                    <td style="width:28%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Document Type</td>
                    <td style="width:35%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Description</td>
                    <td style="width:12%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Files</td>
                    <td style="width:20%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Status</td>
                </tr>
                @foreach($documentTypes['health'] as $docType)
                    @php
                        $uploaded = $isChecked($docType['key'] . '_uploaded');
                        $uploadedDocs = $documents->get($docType['key'], collect());
                        $hasApproved = $uploadedDocs->where('status', 'approved')->count() > 0;
                        $hasPending = $uploadedDocs->where('status', 'pending')->count() > 0;
                        $hasRejected = $uploadedDocs->where('status', 'rejected')->count() > 0;
                    @endphp
                    <tr>
                        <td style="text-align:center;padding:10px;">
                            <span class="checkbox-box {{ $uploaded ? 'checked' : '' }}">{{ $uploaded ? '✓' : '' }}</span>
                        </td>
                        <td style="padding:10px;font-weight:600;font-size:9pt;color:#2d3748;">{{ $docType['label'] }}</td>
                        <td style="padding:10px;font-size:8pt;color:#718096;">{{ $docType['desc'] }}</td>
                        <td style="text-align:center;padding:10px;">
                            @if($uploadedDocs->count() > 0)
                                <span style="display:inline-block;background:#ed8936;color:#fff;padding:2px 8px;border-radius:10px;font-size:8pt;font-weight:600;">{{ $uploadedDocs->count() }}</span>
                            @else
                                <span style="color:#a0aec0;">0</span>
                            @endif
                        </td>
                        <td style="text-align:center;padding:10px;">
                            @if($hasApproved)
                                <span class="doc-status approved">Approved</span>
                            @elseif($hasPending)
                                <span class="doc-status pending">Pending</span>
                            @elseif($hasRejected)
                                <span class="doc-status rejected">Rejected</span>
                            @else
                                <span style="color:#a0aec0;font-size:8pt;">—</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <!-- Additional Documents Section -->
    <div class="section">
        <div class="section-header">Additional Documents (If Applicable)</div>
        <div class="section-content">
            <table class="form-table">
                <tr>
                    <td style="width:5%;background:#f7fafc;font-weight:600;text-align:center;font-size:7pt;padding:8px;color:#718096;">✓</td>
                    <td style="width:28%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Document Type</td>
                    <td style="width:35%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Description</td>
                    <td style="width:12%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Files</td>
                    <td style="width:20%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Status</td>
                </tr>
                @foreach($documentTypes['additional'] as $docType)
                    @php
                        $uploaded = $isChecked($docType['key'] . '_uploaded');
                        $uploadedDocs = $documents->get($docType['key'], collect());
                        $hasApproved = $uploadedDocs->where('status', 'approved')->count() > 0;
                        $hasPending = $uploadedDocs->where('status', 'pending')->count() > 0;
                        $hasRejected = $uploadedDocs->where('status', 'rejected')->count() > 0;
                    @endphp
                    <tr>
                        <td style="text-align:center;padding:10px;">
                            <span class="checkbox-box {{ $uploaded ? 'checked' : '' }}">{{ $uploaded ? '✓' : '' }}</span>
                        </td>
                        <td style="padding:10px;font-weight:600;font-size:9pt;color:#2d3748;">{{ $docType['label'] }}</td>
                        <td style="padding:10px;font-size:8pt;color:#718096;">{{ $docType['desc'] }}</td>
                        <td style="text-align:center;padding:10px;">
                            @if($uploadedDocs->count() > 0)
                                <span style="display:inline-block;background:#718096;color:#fff;padding:2px 8px;border-radius:10px;font-size:8pt;font-weight:600;">{{ $uploadedDocs->count() }}</span>
                            @else
                                <span style="color:#a0aec0;">0</span>
                            @endif
                        </td>
                        <td style="text-align:center;padding:10px;">
                            @if($hasApproved)
                                <span class="doc-status approved">Approved</span>
                            @elseif($hasPending)
                                <span class="doc-status pending">Pending</span>
                            @elseif($hasRejected)
                                <span class="doc-status rejected">Rejected</span>
                            @else
                                <span style="color:#a0aec0;font-size:8pt;">—</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <!-- Uploaded Files Detail -->
    @if($documents && $documents->flatten()->count() > 0)
        <div class="section">
            <div class="section-header">Uploaded Files Detail</div>
            <div class="section-content">
                <table class="form-table">
                    <tr>
                        <td style="width:5%;background:#f7fafc;font-weight:600;text-align:center;font-size:7pt;padding:8px;color:#718096;">#</td>
                        <td style="width:22%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Document Type</td>
                        <td style="width:33%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">File Name</td>
                        <td style="width:10%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Size</td>
                        <td style="width:12%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Watermark</td>
                        <td style="width:18%;background:#f7fafc;font-weight:600;font-size:7pt;padding:8px;text-align:center;color:#718096;text-transform:uppercase;letter-spacing:0.3px;">Status</td>
                    </tr>
                    @php $num = 1; @endphp
                    @foreach($documents as $type => $docs)
                        @foreach($docs as $doc)
                            <tr>
                                <td style="text-align:center;padding:8px;">
                                    <span style="display:inline-block;width:20px;height:20px;background:#4f46e5;color:#fff;border-radius:50%;line-height:20px;font-size:8pt;">{{ $num++ }}</span>
                                </td>
                                <td style="padding:8px;font-size:8pt;color:#2d3748;">{{ ucwords(str_replace('_', ' ', $type)) }}</td>
                                <td style="padding:8px;font-size:8pt;color:#4a5568;">{{ $doc->original_filename }}</td>
                                <td style="padding:8px;font-size:8pt;color:#718096;">{{ $doc->formatted_size }}</td>
                                <td style="text-align:center;padding:8px;">
                                    @if($doc->is_watermarked)
                                        <span class="checkbox-box checked">✓</span>
                                    @else
                                        <span class="checkbox-box"></span>
                                    @endif
                                </td>
                                <td style="text-align:center;padding:8px;">
                                    <span class="doc-status {{ $doc->status }}">{{ ucfirst($doc->status) }}</span>
                                </td>
                            </tr>
                        @endforeach
                    @endforeach
                </table>
            </div>
        </div>
    @endif

    <!-- Certification & Signature -->
    <div class="section">
        <div class="section-header consent">Certification & Signature</div>
        <div class="section-content">
            <div class="highlight-card" style="margin-bottom:15px;">
                <div style="display:table;width:100%;">
                    <div style="display:table-cell;width:30px;vertical-align:top;">
                        <span class="checkbox-box {{ $isChecked('documents_certification') ? 'checked' : '' }}">{{ $isChecked('documents_certification') ? '✓' : '' }}</span>
                    </div>
                    <div style="display:table-cell;vertical-align:top;">
                        <span style="font-size:9pt;color:#2d3748;line-height:1.5;">
                            I certify that all documents uploaded are authentic, unaltered, and accurately represent the information provided. 
                            I understand that providing false documentation may result in enrollment denial or withdrawal.
                        </span>
                    </div>
                </div>
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
