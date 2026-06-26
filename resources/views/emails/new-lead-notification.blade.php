<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #116B11; padding: 20px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold;">🎯 New Lead Received</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <!-- Lead Type Badge -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        @php
                                            $typeColors = [
                                                'free_trial' => '#10b981',
                                                'demo' => '#3b82f6',
                                                'partner' => '#8b5cf6',
                                                'contact_sales' => '#f59e0b',
                                                'contact' => '#6366f1',
                                                'waitlist' => '#6b7280',
                                            ];
                                            $typeLabels = [
                                                'free_trial' => 'Free Trial',
                                                'demo' => 'Demo Request',
                                                'partner' => 'Partner Application',
                                                'contact_sales' => 'Sales Inquiry',
                                                'contact' => 'Contact Form',
                                                'waitlist' => 'Waitlist',
                                            ];
                                            $bgColor = $typeColors[$lead->type] ?? '#6b7280';
                                            $label = $typeLabels[$lead->type] ?? 'Unknown';
                                        @endphp
                                        <span style="display: inline-block; background-color: {{ $bgColor }}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                                            {{ $label }}
                                        </span>
                                    </td>
                                </tr>
                                
                                <!-- Lead Details -->
                                <tr>
                                    <td>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Name</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->name }}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Email</strong><br>
                                                                <a href="mailto:{{ $lead->email }}" style="color: #116B11; font-size: 16px; text-decoration: none;">{{ $lead->email }}</a>
                                                            </td>
                                                        </tr>
                                                        @if($lead->phone)
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Phone</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->phone }}</span>
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if($lead->school_name)
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">School</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->school_name }}</span>
                                                                @if($lead->school_size)
                                                                    <span style="color: #6b7280; font-size: 14px;">({{ $lead->school_size }} students)</span>
                                                                @endif
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if($lead->company_name)
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Company</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->company_name }}</span>
                                                                @if($lead->company_website)
                                                                    <br><a href="{{ $lead->company_website }}" style="color: #116B11; font-size: 14px;">{{ $lead->company_website }}</a>
                                                                @endif
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if($lead->partner_type)
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Partner Type</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->partner_type }}</span>
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if($lead->role)
                                                        <tr>
                                                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Role</strong><br>
                                                                <span style="color: #1f2937; font-size: 16px;">{{ $lead->role }}</span>
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if($lead->message)
                                                        <tr>
                                                            <td style="padding: 8px 0;">
                                                                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Message</strong><br>
                                                                <span style="color: #1f2937; font-size: 14px; line-height: 1.5;">{{ $lead->message }}</span>
                                                            </td>
                                                        </tr>
                                                        @endif
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Action Button -->
                                <tr>
                                    <td style="padding-top: 24px; text-align: center;">
                                        <a href="{{ config('app.url') }}/settings/leads" style="display: inline-block; background-color: #116B11; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                            View in Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Received at {{ $lead->created_at->format('M d, Y g:i A') }} • Source: {{ $lead->source ?? 'Website' }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
