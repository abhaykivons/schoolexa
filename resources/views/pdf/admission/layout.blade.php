<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>@yield('title', 'Admission Form')</title>
    <style>
        /* Reset & Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.5;
            color: #2d3748;
            background: #fff;
        }

        /* Page Setup */
        @page {
            margin: 20mm 18mm 25mm 18mm;
        }

        /* Modern Header */
        .pdf-header {
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
        }

        .header-top {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }

        .header-left {
            display: table-cell;
            vertical-align: middle;
            width: 70%;
        }

        .header-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 30%;
        }

        .pdf-header .school-name {
            font-size: 18pt;
            font-weight: bold;
            color: #1a202c;
            letter-spacing: -0.5px;
        }

        .pdf-header .school-tagline {
            font-size: 8pt;
            color: #718096;
            margin-top: 2px;
        }

        .pdf-header .form-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: #fff;
            padding: 10px 25px;
            display: inline-block;
            margin-top: 12px;
            border-radius: 4px;
        }

        .pdf-header .student-info {
            background: #f7fafc;
            border-left: 4px solid #4f46e5;
            padding: 10px 15px;
            margin-top: 12px;
            border-radius: 0 4px 4px 0;
        }

        .student-info-grid {
            display: table;
            width: 100%;
        }

        .student-info-item {
            display: table-cell;
            padding-right: 20px;
        }

        .student-info-label {
            font-size: 7pt;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .student-info-value {
            font-size: 10pt;
            font-weight: bold;
            color: #1a202c;
        }

        /* Status Badge - Modern */
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 20px;
        }

        .status-badge.approved,
        .status-badge.submitted {
            background: #c6f6d5;
            color: #22543d;
        }

        .status-badge.pending,
        .status-badge.draft {
            background: #fefcbf;
            color: #744210;
        }

        .status-badge.rejected {
            background: #fed7d7;
            color: #742a2a;
        }

        /* Section Styles - Modern */
        .section {
            margin-bottom: 18px;
            page-break-inside: avoid;
        }

        .section-header {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #4f46e5;
            color: #fff;
            padding: 8px 12px;
            margin-bottom: 0;
            border-radius: 4px 4px 0 0;
        }

        .section-header.required {
            background: #e53e3e;
        }

        .section-header.health {
            background: #ed8936;
        }

        .section-header.consent {
            background: #38a169;
        }

        .section-header.info {
            background: #3182ce;
        }

        .section-content {
            border: 1px solid #e2e8f0;
            border-top: none;
            padding: 12px;
            border-radius: 0 0 4px 4px;
        }

        /* Form Table - Modern */
        .form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }

        .form-table td {
            border: 1px solid #e2e8f0;
            padding: 0;
            vertical-align: top;
        }

        .form-table .label {
            background: #f7fafc;
            font-size: 7pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 4px 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #718096;
        }

        .form-table .value {
            padding: 6px 8px;
            min-height: 20px;
            font-size: 9pt;
            color: #2d3748;
        }

        .form-table .value.empty {
            color: #a0aec0;
            font-style: italic;
        }

        /* Field Cell */
        .field-cell {
            display: block;
        }

        .field-cell .label {
            display: block;
            background: #f7fafc;
            font-size: 7pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 4px 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #718096;
        }

        .field-cell .value {
            display: block;
            padding: 6px 8px;
            min-height: 22px;
            font-size: 9pt;
            word-wrap: break-word;
            color: #2d3748;
        }

        /* Checkbox Styles - Modern */
        .checkbox-box {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #cbd5e0;
            border-radius: 3px;
            text-align: center;
            line-height: 10px;
            font-size: 10px;
            margin-right: 6px;
            vertical-align: middle;
            font-weight: bold;
        }

        .checkbox-box.checked {
            background: #4f46e5;
            border-color: #4f46e5;
            color: #fff;
        }

        .checkbox-label {
            vertical-align: middle;
            font-size: 9pt;
            color: #2d3748;
        }

        .checkbox-row {
            padding: 6px 8px;
            border-bottom: 1px solid #edf2f7;
        }

        .checkbox-row:last-child {
            border-bottom: none;
        }

        /* Yes/No Display - Modern Pill */
        .yes-badge {
            display: inline-block;
            background: #48bb78;
            color: #fff;
            padding: 2px 10px;
            font-size: 8pt;
            font-weight: bold;
            border-radius: 12px;
        }

        .no-badge {
            display: inline-block;
            background: #fc8181;
            color: #fff;
            padding: 2px 10px;
            font-size: 8pt;
            font-weight: bold;
            border-radius: 12px;
        }

        /* Document Status - Modern */
        .doc-status {
            display: inline-block;
            padding: 2px 8px;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 3px;
        }

        .doc-status.approved {
            background: #c6f6d5;
            color: #22543d;
        }

        .doc-status.pending {
            background: #fefcbf;
            color: #744210;
        }

        .doc-status.rejected {
            background: #fed7d7;
            color: #742a2a;
        }

        /* Signature Area - Modern */
        .signature-area {
            border: 2px dashed #e2e8f0;
            border-radius: 6px;
            min-height: 55px;
            padding: 8px;
            background: #f7fafc;
            text-align: center;
        }

        .signature-area img {
            max-height: 50px;
            max-width: 180px;
        }

        .signature-text {
            font-family: 'Times New Roman', serif;
            font-size: 14pt;
            font-style: italic;
            color: #2d3748;
        }

        /* Notes Box - Modern */
        .notes-area {
            background: #ebf8ff;
            border-left: 4px solid #3182ce;
            padding: 10px 12px;
            min-height: 30px;
            font-size: 9pt;
            border-radius: 0 4px 4px 0;
            color: #2c5282;
        }

        /* Info Box - Modern */
        .info-box {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
        }

        .info-box table {
            width: 100%;
        }

        .info-box td {
            padding: 4px 8px;
            font-size: 9pt;
        }

        .info-box .label {
            font-weight: 600;
            color: #718096;
            width: 120px;
        }

        /* Highlight Card */
        .highlight-card {
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
        }

        .highlight-card-title {
            font-size: 9pt;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e2e8f0;
        }

        /* Footer - Modern */
        .pdf-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7pt;
            color: #a0aec0;
            padding: 10px 18mm;
            border-top: 1px solid #e2e8f0;
            background: #f7fafc;
        }

        /* Watermark - Subtle */
        .watermark {
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 60pt;
            color: rgba(79, 70, 229, 0.04);
            font-weight: bold;
            z-index: -1;
            white-space: nowrap;
            letter-spacing: 15px;
        }

        /* Utility */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
        .text-small { font-size: 8pt; }
        .text-muted { color: #718096; }
        .mt-5 { margin-top: 5px; }
        .mt-10 { margin-top: 10px; }
        .mb-5 { margin-bottom: 5px; }
        .mb-10 { margin-bottom: 10px; }
        .page-break { page-break-after: always; }

        /* Multi-column layout */
        .col-2 { width: 50%; }
        .col-3 { width: 33.33%; }
        .col-4 { width: 25%; }

        /* Modern List */
        .modern-list {
            list-style: none;
        }

        .modern-list li {
            padding: 8px 10px;
            border-bottom: 1px solid #edf2f7;
            display: table;
            width: 100%;
        }

        .modern-list li:last-child {
            border-bottom: none;
        }

        .modern-list li:nth-child(even) {
            background: #f7fafc;
        }

        /* Alert Boxes */
        .alert {
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 9pt;
            margin-bottom: 10px;
        }

        .alert-info {
            background: #ebf8ff;
            border-left: 4px solid #3182ce;
            color: #2c5282;
        }

        .alert-warning {
            background: #fffaf0;
            border-left: 4px solid #ed8936;
            color: #744210;
        }

        .alert-success {
            background: #f0fff4;
            border-left: 4px solid #48bb78;
            color: #22543d;
        }
    </style>
</head>
<body>
    <div class="watermark">CONFIDENTIAL</div>

    <!-- Header -->
    <div class="pdf-header">
        <div class="header-top">
            <div class="header-left">
                <div class="school-name">{{ $company->name ?? 'School Name' }}</div>
                <div class="school-tagline">Student Admission Records</div>
            </div>
            <div class="header-right">
                @if(isset($admissionForm))
                    <span class="status-badge {{ $admissionForm->status }}">
                        {{ strtoupper($admissionForm->status) }}
                    </span>
                @endif
            </div>
        </div>
        
        <div class="text-center">
            <span class="form-title">@yield('form-title', 'Admission Form')</span>
        </div>
        
        <div class="student-info">
            <div class="student-info-grid">
                <div class="student-info-item">
                    <div class="student-info-label">Student Name</div>
                    <div class="student-info-value">{{ $student->first_name }} {{ $student->last_name }}</div>
                </div>
                @if($student->grade)
                <div class="student-info-item">
                    <div class="student-info-label">Grade</div>
                    <div class="student-info-value">{{ $student->grade->name }}</div>
                </div>
                @endif
                <div class="student-info-item">
                    <div class="student-info-label">Date Generated</div>
                    <div class="student-info-value">{{ $generatedAt }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Content -->
    @yield('content')

    <!-- Footer -->
    <div class="pdf-footer">
        {{ $company->name ?? 'School' }} &nbsp;•&nbsp; 
        Confidential Student Record &nbsp;•&nbsp; 
        Generated: {{ $generatedAt }}
    </div>
</body>
</html>
