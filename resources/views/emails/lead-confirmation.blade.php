<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SchoolExa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #116B11; padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">SchoolExa</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                                @if($leadType === 'free_trial')
                                    Welcome to SchoolExa! 🎉
                                @elseif($leadType === 'demo')
                                    Thank You for Your Demo Request!
                                @elseif($leadType === 'partner')
                                    Thank You for Your Partner Application!
                                @elseif($leadType === 'contact_sales')
                                    Thank You for Contacting Us!
                                @elseif($leadType === 'contact')
                                    We Received Your Message!
                                @else
                                    You're on the List!
                                @endif
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Hi {{ $lead->name }},
                            </p>
                            
                            @if($leadType === 'free_trial')
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for starting your free trial with SchoolExa! We're excited to have you on board.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Your 30-day free trial gives you full access to all SchoolExa features. Our team is setting up your account and you'll receive your login credentials shortly.
                                </p>
                                <div style="background-color: #f0fdf4; border-left: 4px solid #116B11; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                                    <p style="margin: 0; color: #166534; font-size: 14px;">
                                        <strong>What's Next?</strong><br>
                                        • Check your email for login credentials<br>
                                        • Complete your school profile setup<br>
                                        • Explore our documentation at schoolexa.com/docs
                                    </p>
                                </div>
                            @elseif($leadType === 'demo')
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for requesting a demo of SchoolExa! We're thrilled you're interested in transforming your school's management.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    One of our product specialists will reach out to you within <strong>24 hours</strong> to schedule your personalized demo at a time that works best for you.
                                </p>
                                <div style="background-color: #f0fdf4; border-left: 4px solid #116B11; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                                    <p style="margin: 0; color: #166534; font-size: 14px;">
                                        <strong>In the meantime:</strong><br>
                                        • Browse our features at schoolexa.com<br>
                                        • Check out customer success stories<br>
                                        • Review our pricing plans
                                    </p>
                                </div>
                            @elseif($leadType === 'partner')
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for your interest in becoming a SchoolExa partner! We've received your application and are excited about the possibility of working together.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Our partnerships team will review your application and get back to you within <strong>2-3 business days</strong>.
                                </p>
                                @if($lead->partner_type)
                                <div style="background-color: #f0fdf4; border-left: 4px solid #116B11; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                                    <p style="margin: 0; color: #166534; font-size: 14px;">
                                        <strong>Application Details:</strong><br>
                                        Partner Type: {{ $lead->partner_type }}<br>
                                        Company: {{ $lead->company_name ?? 'Not specified' }}
                                    </p>
                                </div>
                                @endif
                            @elseif($leadType === 'contact_sales')
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for reaching out to our sales team! We've received your inquiry and will get back to you shortly.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    A member of our sales team will contact you within <strong>24 hours</strong> to discuss your school's needs and how SchoolExa can help.
                                </p>
                            @elseif($leadType === 'contact')
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for contacting us! We've received your message and will respond as soon as possible.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Our team typically responds within <strong>2-4 hours</strong> during business hours.
                                </p>
                            @else
                                <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for joining the SchoolExa waitlist! We'll notify you as soon as we have availability.
                                </p>
                            @endif
                            
                            <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Best regards,<br>
                                <strong>The SchoolExa Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@schoolexa.com" style="color: #116B11; text-decoration: none;">support@schoolexa.com</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © {{ date('Y') }} SchoolExa. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
