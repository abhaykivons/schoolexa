<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>All Admission Forms - {{ $student->first_name }} {{ $student->last_name }}</title>
    <style>
        /* Base Styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a1a1a;
        }

        @page { margin: 20mm 15mm 25mm 15mm; }

        .header {
            text-align: center;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563eb;
            margin-bottom: 20px;
        }

        .header .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
        }

        .header .title {
            font-size: 14pt;
            font-weight: bold;
            color: #374151;
            margin-top: 10px;
        }

        .header .student-info {
            font-size: 10pt;
            color: #6b7280;
            margin-top: 5px;
        }

        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
            padding: 8px 12px;
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            margin-bottom: 12px;
        }

        .section-title.red { color: #dc2626; background: #fef2f2; border-left-color: #dc2626; }
        .section-title.orange { color: #ea580c; background: #fff7ed; border-left-color: #ea580c; }
        .section-title.green { color: #16a34a; background: #f0fdf4; border-left-color: #16a34a; }

        .two-column { width: 100%; }
        .two-column td { width: 50%; padding: 6px 8px; vertical-align: top; border-bottom: 1px solid #e5e7eb; }
        .three-column { width: 100%; }
        .three-column td { width: 33.33%; padding: 6px 8px; vertical-align: top; border-bottom: 1px solid #e5e7eb; }
        .four-column { width: 100%; }
        .four-column td { width: 25%; padding: 6px 8px; vertical-align: top; border-bottom: 1px solid #e5e7eb; }

        .field-label {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .field-value {
            font-size: 10pt;
            color: #1f2937;
        }

        .field-value.empty {
            color: #9ca3af;
            font-style: italic;
        }

        .checkbox {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #d1d5db;
            border-radius: 3px;
            vertical-align: middle;
            margin-right: 6px;
            text-align: center;
            line-height: 10px;
            font-size: 10px;
        }

        .checkbox.checked {
            background: #16a34a;
            border-color: #16a34a;
            color: #fff;
        }

        .checkbox-label { vertical-align: middle; font-size: 10pt; }
        .checkbox-item { margin-bottom: 6px; }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8pt;
            font-weight: 600;
        }

        .badge.yes { background: #dcfce7; color: #16a34a; }
        .badge.no { background: #fee2e2; color: #dc2626; }
        .badge.approved { background: #dcfce7; color: #16a34a; }
        .badge.pending { background: #fef3c7; color: #d97706; }
        .badge.rejected { background: #fee2e2; color: #dc2626; }

        .signature-box {
            border: 1px solid #d1d5db;
            padding: 10px;
            min-height: 60px;
            background: #f9fafb;
        }

        .signature-box img { max-height: 50px; max-width: 200px; }

        .notes-box {
            border: 1px solid #d1d5db;
            padding: 8px;
            min-height: 30px;
            background: #f9fafb;
            font-size: 9pt;
            border-radius: 4px;
        }

        .document-item {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 5px;
            font-size: 9pt;
        }

        .document-item.approved { border-left: 3px solid #16a34a; background: #f0fdf4; }
        .document-item.pending { border-left: 3px solid #f59e0b; background: #fffbeb; }
        .document-item.rejected { border-left: 3px solid #dc2626; background: #fef2f2; }

        .form-divider {
            border-top: 3px double #2563eb;
            margin: 30px 0;
            padding-top: 20px;
        }

        .form-header {
            background: #1e40af;
            color: white;
            padding: 12px 15px;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 20px;
            border-radius: 6px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 600;
            margin-left: 10px;
        }

        .status-badge.approved { background: #dcfce7; color: #16a34a; }
        .status-badge.submitted { background: #fef3c7; color: #d97706; }
        .status-badge.draft { background: #e5e7eb; color: #6b7280; }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8pt;
            color: #9ca3af;
            padding: 10px 15mm;
            border-top: 1px solid #e5e7eb;
        }

        .page-break { page-break-after: always; }
        .text-muted { color: #6b7280; }
        .text-small { font-size: 8pt; }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .summary-table th, .summary-table td {
            padding: 10px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }

        .summary-table th { background: #f3f4f6; font-weight: 600; }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60pt;
            color: rgba(0, 0, 0, 0.03);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">CONFIDENTIAL</div>

    @include('pdf.admission.components')

    <!-- Cover Page -->
    <div class="header">
        <div class="company-name">{{ $company->name ?? 'School Name' }}</div>
        <div class="title">Complete Admission Package</div>
        <div class="student-info">
            <strong style="font-size: 12pt;">{{ $student->first_name }} {{ $student->last_name }}</strong><br>
            @if($student->grade) Grade: {{ $student->grade->name }} | @endif
            Parent: {{ $student->parent->name ?? 'N/A' }}
        </div>
    </div>

    <!-- Forms Summary -->
    <div class="section">
        <div class="section-title">Forms Summary</div>
        
        <table class="summary-table">
            <tr>
                <th>Form Name</th>
                <th>Status</th>
                <th>Last Updated</th>
            </tr>
            @foreach($formsData as $data)
                <tr>
                    <td style="text-align: left; font-weight: 500;">{{ $data['form']->name }}</td>
                    <td>
                        @if($data['admissionForm']->status === 'approved')
                            <span class="badge approved">✓ Approved</span>
                        @elseif($data['admissionForm']->status === 'submitted')
                            <span class="badge pending">⏳ Pending</span>
                        @else
                            <span class="badge">{{ ucfirst($data['admissionForm']->status) }}</span>
                        @endif
                    </td>
                    <td>{{ $data['admissionForm']->updated_at->format('M d, Y') }}</td>
                </tr>
            @endforeach
        </table>
    </div>

    <div class="page-break"></div>

    <!-- Individual Forms -->
    @foreach($formsData as $index => $data)
        @php
            $form = $data['form'];
            $admissionForm = $data['admissionForm'];
            $formData = $data['formData'];
            $documents = $data['documents'];
        @endphp

        <div class="form-header">
            {{ $form->name }}
            @if($admissionForm->status === 'approved')
                <span class="status-badge approved">✓ Approved</span>
            @elseif($admissionForm->status === 'submitted')
                <span class="status-badge submitted">⏳ Pending</span>
            @else
                <span class="status-badge draft">{{ ucfirst($admissionForm->status) }}</span>
            @endif
        </div>

        @php
            // Categorize fields
            $booleanFields = [];
            $textFields = [];
            $dateFields = [];
            $signatureFields = [];
            $notesFields = [];
            
            // Helper to safely convert value to string
            $safeStr = function($value) {
                if (is_array($value)) {
                    $filtered = array_filter($value, fn($v) => $v !== null && $v !== '');
                    return empty($filtered) ? '' : implode(', ', array_map(fn($v) => is_array($v) ? json_encode($v) : (string)$v, $filtered));
                }
                if (is_object($value)) {
                    return json_encode($value);
                }
                return $value;
            };
            
            foreach ($formData as $key => $value) {
                if ($key === 'form_id') continue;
                
                // Skip array values for boolean check
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

        <!-- Text Fields -->
        @if(count($textFields) > 0)
            <div class="section">
                <div class="section-title">Information</div>
                <table class="two-column">
                    @foreach(array_chunk($textFields, 2, true) as $chunk)
                        <tr>
                            @foreach($chunk as $key => $value)
                                <td>{!! pdfField(ucwords(str_replace('_', ' ', $key)), $value) !!}</td>
                            @endforeach
                            @if(count($chunk) < 2)
                                <td></td>
                            @endif
                        </tr>
                    @endforeach
                </table>
            </div>
        @endif

        <!-- Boolean/Checkbox Fields -->
        @if(count($booleanFields) > 0)
            <div class="section">
                <div class="section-title">Options & Consents</div>
                <div style="padding: 8px; column-count: 2; column-gap: 20px;">
                    @foreach($booleanFields as $key => $value)
                        <div class="checkbox-item">
                            {!! pdfCheckbox($value, ucwords(str_replace('_', ' ', $key))) !!}
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Notes Fields -->
        @if(count($notesFields) > 0)
            <div class="section">
                <div class="section-title">Additional Details</div>
                @foreach($notesFields as $key => $value)
                    @php $safeValue = $safeStr($value); @endphp
                    @if($safeValue)
                        <div style="padding: 5px 8px;">
                            <div class="field-label">{{ ucwords(str_replace('_', ' ', $key)) }}</div>
                            <div class="notes-box">{{ $safeValue }}</div>
                        </div>
                    @endif
                @endforeach
            </div>
        @endif

        <!-- Documents -->
        @if($documents && $documents->count() > 0)
            <div class="section">
                <div class="section-title orange">Uploaded Documents</div>
                @foreach($documents as $type => $docs)
                    <div style="margin-bottom: 8px;">
                        <div class="field-label">{{ ucwords(str_replace('_', ' ', $type)) }}</div>
                        @foreach($docs as $doc)
                            <div class="document-item {{ $doc->status }}">
                                📎 {{ $doc->original_filename }}
                                <span class="text-muted">({{ $doc->formatted_size }})</span>
                                {!! pdfDocumentStatus($doc->status) !!}
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </div>
        @endif

        <!-- Signatures -->
        @if(count($signatureFields) > 0)
            <div class="section">
                <div class="section-title green">Signature</div>
                <table class="two-column">
                    <tr>
                        @foreach($signatureFields as $key => $value)
                            <td>
                                <div class="field-label">{{ ucwords(str_replace('_', ' ', $key)) }}</div>
                                @if(!empty($value) && str_starts_with($value, 'data:image'))
                                    <div class="signature-box">
                                        <img src="{{ $value }}" alt="Signature">
                                    </div>
                                @elseif(!empty($value))
                                    <div class="signature-box">
                                        <span style="font-family: cursive; font-size: 14pt;">{{ $value }}</span>
                                    </div>
                                @else
                                    <div class="signature-box">
                                        <span class="text-muted">No signature</span>
                                    </div>
                                @endif
                            </td>
                        @endforeach
                    </tr>
                </table>
            </div>
        @endif

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach

    <!-- Footer -->
    <div class="footer">
        Generated on {{ $generatedAt }} | {{ $company->name ?? 'School' }} - Confidential Student Records
    </div>
</body>
</html>

