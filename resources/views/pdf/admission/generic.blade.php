@extends('pdf.admission.layout')
@include('pdf.admission.components')

@section('title', $form->name . ' - ' . $student->first_name . ' ' . $student->last_name)
@section('form-title', $form->name)

@section('content')
    @php
        // Helper to safely convert value to string
        if (!function_exists('formatLabel')) {
            function formatLabel($key) {
                return ucwords(str_replace('_', ' ', $key));
            }
        }
        
        if (!function_exists('safeValue')) {
            function safeValue($value) {
                if (is_array($value)) {
                    $filtered = array_filter($value, fn($v) => $v !== null && $v !== '');
                    return empty($filtered) ? '' : implode(', ', array_map(fn($v) => is_array($v) ? json_encode($v) : (string)$v, $filtered));
                }
                if (is_object($value)) {
                    return json_encode($value);
                }
                return $value;
            }
        }
        
        // Group fields by category
        $booleanFields = [];
        $textFields = [];
        $dateFields = [];
        $signatureFields = [];
        $notesFields = [];
        
        foreach ($formData as $key => $value) {
            if ($key === 'form_id') continue;
            
            $isBoolean = !is_array($value) && ($value === true || $value === false || $value === '1' || $value === '0' || $value === 'true' || $value === 'false');
            $isBooleanKey = str_contains($key, 'consent') || str_contains($key, 'has_') || str_contains($key, 'is_') || str_contains($key, '_uploaded') || str_contains($key, 'certification');
            
            if (str_contains($key, 'signature')) {
                $signatureFields[$key] = $value;
            } elseif (str_contains($key, 'date')) {
                $dateFields[$key] = $value;
            } elseif (str_contains($key, 'notes') || str_contains($key, 'details') || str_contains($key, 'additional') || str_contains($key, 'plan') || str_contains($key, 'restrictions') || str_contains($key, 'exemptions')) {
                $notesFields[$key] = $value;
            } elseif ($isBoolean || $isBooleanKey) {
                $booleanFields[$key] = $value;
            } else {
                $textFields[$key] = $value;
            }
        }
    @endphp

    <!-- General Information -->
    @if(count($textFields) > 0)
        <div class="section">
            <div class="section-header info">General Information</div>
            <div class="section-content">
                <table class="form-table">
                    @php $chunks = array_chunk($textFields, 3, true); @endphp
                    @foreach($chunks as $chunk)
                        <tr>
                            @foreach($chunk as $key => $value)
                                <td style="width:{{ 100/count($chunk) }}%">
                                    <div class="field-cell">
                                        <span class="label">{{ formatLabel($key) }}</span>
                                        <span class="value">
                                            @php $val = safeValue($value); @endphp
                                            @if($val)
                                                {{ $val }}
                                            @else
                                                <span class="text-muted" style="font-style:italic;">—</span>
                                            @endif
                                        </span>
                                    </div>
                                </td>
                            @endforeach
                            @for($i = count($chunk); $i < 3; $i++)
                                <td style="width:{{ 100/3 }}%"></td>
                            @endfor
                        </tr>
                    @endforeach
                </table>
            </div>
        </div>
    @endif

    <!-- Date Fields -->
    @if(count($dateFields) > 0)
        <div class="section">
            <div class="section-header">Important Dates</div>
            <div class="section-content">
                <table class="form-table">
                    @php $chunks = array_chunk($dateFields, 3, true); @endphp
                    @foreach($chunks as $chunk)
                        <tr>
                            @foreach($chunk as $key => $value)
                                <td style="width:{{ 100/count($chunk) }}%">
                                    <div class="field-cell">
                                        <span class="label">{{ formatLabel($key) }}</span>
                                        <span class="value">
                                            @if($value)
                                                @try
                                                    {{ \Carbon\Carbon::parse($value)->format('M d, Y') }}
                                                @catch(\Exception $e)
                                                    {{ $value }}
                                                @endtry
                                            @else
                                                <span class="text-muted" style="font-style:italic;">—</span>
                                            @endif
                                        </span>
                                    </div>
                                </td>
                            @endforeach
                        </tr>
                    @endforeach
                </table>
            </div>
        </div>
    @endif

    <!-- Options & Consents (Checkboxes) -->
    @if(count($booleanFields) > 0)
        <div class="section">
            <div class="section-header consent">Options & Consents</div>
            <div class="section-content">
                <table class="form-table">
                    @php $chunks = array_chunk($booleanFields, 2, true); @endphp
                    @foreach($chunks as $chunk)
                        <tr>
                            @foreach($chunk as $key => $value)
                                @php
                                    $isChecked = $value === true || $value === '1' || $value === 'true' || $value === 1;
                                @endphp
                                <td style="width:50%;padding:10px 12px;border-bottom:1px solid #e2e8f0;">
                                    <span class="checkbox-box {{ $isChecked ? 'checked' : '' }}">{{ $isChecked ? '✓' : '' }}</span>
                                    <span class="checkbox-label">{{ formatLabel($key) }}</span>
                                </td>
                            @endforeach
                            @if(count($chunk) < 2)
                                <td style="width:50%;"></td>
                            @endif
                        </tr>
                    @endforeach
                </table>
            </div>
        </div>
    @endif

    <!-- Additional Information / Notes -->
    @if(count($notesFields) > 0)
        <div class="section">
            <div class="section-header">Additional Information</div>
            <div class="section-content">
                @foreach($notesFields as $key => $value)
                    @php $val = safeValue($value); @endphp
                    <div class="field-cell" style="margin-bottom:12px;">
                        <span class="label">{{ formatLabel($key) }}</span>
                        <div class="notes-area">
                            {{ $val ?: 'None provided' }}
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Uploaded Documents -->
    @if($documents && $documents->count() > 0)
        <div class="section">
            <div class="section-header">Uploaded Documents</div>
            <div class="section-content">
                <table class="form-table">
                    <tr>
                        <td style="width:5%;background:#f7fafc;font-weight:600;text-align:center;font-size:8pt;padding:8px;">#</td>
                        <td style="width:30%;background:#f7fafc;font-weight:600;font-size:8pt;padding:8px;">Document Type</td>
                        <td style="width:35%;background:#f7fafc;font-weight:600;font-size:8pt;padding:8px;">File Name</td>
                        <td style="width:15%;background:#f7fafc;font-weight:600;font-size:8pt;padding:8px;">Size</td>
                        <td style="width:15%;background:#f7fafc;font-weight:600;font-size:8pt;text-align:center;padding:8px;">Status</td>
                    </tr>
                    @php $docNum = 1; @endphp
                    @foreach($documents as $type => $docs)
                        @foreach($docs as $doc)
                            <tr>
                                <td style="text-align:center;padding:8px;">
                                    <span style="display:inline-block;width:20px;height:20px;background:#4f46e5;color:#fff;border-radius:50%;line-height:20px;font-size:8pt;">{{ $docNum++ }}</span>
                                </td>
                                <td style="padding:8px;">{{ ucwords(str_replace('_', ' ', $type)) }}</td>
                                <td style="padding:8px;font-size:8pt;color:#4a5568;">{{ $doc->original_filename }}</td>
                                <td style="padding:8px;font-size:8pt;color:#718096;">{{ $doc->formatted_size }}</td>
                                <td style="padding:8px;text-align:center;">
                                    <span class="doc-status {{ $doc->status }}">{{ ucfirst($doc->status) }}</span>
                                </td>
                            </tr>
                        @endforeach
                    @endforeach
                </table>
            </div>
        </div>
    @endif

    <!-- Signatures -->
    @if(count($signatureFields) > 0)
        <div class="section">
            <div class="section-header consent">Signature & Certification</div>
            <div class="section-content">
                <table style="width:100%;">
                    <tr>
                        @foreach($signatureFields as $key => $value)
                            <td style="width:{{ 100/count($signatureFields) }}%;vertical-align:top;padding-right:15px;">
                                <div class="field-cell">
                                    <span class="label">{{ formatLabel($key) }}</span>
                                    <div class="signature-area">
                                        @if(!empty($value))
                                            @if(is_string($value) && str_starts_with($value, 'data:image'))
                                                <img src="{{ $value }}" alt="Signature" style="max-height:45px;max-width:180px;">
                                            @elseif(is_string($value))
                                                <span class="signature-text">{{ $value }}</span>
                                            @else
                                                <span style="color:#a0aec0;font-style:italic;font-size:8pt;">Invalid format</span>
                                            @endif
                                        @else
                                            <span style="color:#a0aec0;font-style:italic;font-size:8pt;">Not signed</span>
                                        @endif
                                    </div>
                                </div>
                            </td>
                        @endforeach
                    </tr>
                </table>
            </div>
        </div>
    @endif

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
