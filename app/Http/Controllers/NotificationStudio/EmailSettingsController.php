<?php

namespace App\Http\Controllers\NotificationStudio;

use App\Http\Controllers\Controller;
use App\Models\EmailSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EmailSettingsController extends Controller
{
    /**
     * Display email settings
     */
    public function index()
    {

        $settings = EmailSettings::first();

        return Inertia::render('modules/notification-studio/settings/index', [
            'settings' => $settings ? [
                'id' => $settings->id,
                'mail_driver' => $settings->mail_driver,
                'smtp_host' => $settings->smtp_host,
                'smtp_port' => $settings->smtp_port,
                'smtp_username' => $settings->smtp_username,
                'smtp_encryption' => $settings->smtp_encryption,
                'mailgun_domain' => $settings->mailgun_domain,
                'mailgun_endpoint' => $settings->mailgun_endpoint,
                'ses_key' => $settings->ses_key,
                'ses_region' => $settings->ses_region,
                'from_name' => $settings->from_name,
                'from_email' => $settings->from_email,
                'reply_to_email' => $settings->reply_to_email,
                'is_active' => $settings->is_active,
                'is_verified' => $settings->is_verified,
                'verified_at' => $settings->verified_at?->toISOString(),
                'last_test_at' => $settings->last_test_at?->toISOString(),
                'last_test_result' => $settings->last_test_result,
                // Don't send passwords to frontend
                'has_smtp_password' => ! empty($settings->getRawOriginal('smtp_password')),
                'has_mailgun_secret' => ! empty($settings->getRawOriginal('mailgun_secret')),
                'has_ses_secret' => ! empty($settings->getRawOriginal('ses_secret')),
                'has_postmark_token' => ! empty($settings->getRawOriginal('postmark_token')),
            ] : null,
            'mailDrivers' => EmailSettings::getMailDrivers(),
            'encryptionTypes' => EmailSettings::getEncryptionTypes(),
        ]);
    }

    /**
     * Save email settings
     */
    public function store(Request $request)
    {

        $validated = Validator::make($request->all(), [
            'mail_driver' => ['required', 'in:smtp,sendmail,mailgun,ses,postmark'],
            'smtp_host' => ['nullable', 'string', 'max:255'],
            'smtp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'smtp_username' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_encryption' => ['nullable', 'in:tls,ssl,none'],
            'mailgun_domain' => ['nullable', 'string', 'max:255'],
            'mailgun_secret' => ['nullable', 'string', 'max:255'],
            'mailgun_endpoint' => ['nullable', 'string', 'max:255'],
            'ses_key' => ['nullable', 'string', 'max:255'],
            'ses_secret' => ['nullable', 'string', 'max:255'],
            'ses_region' => ['nullable', 'string', 'max:50'],
            'postmark_token' => ['nullable', 'string', 'max:255'],
            'from_name' => ['required', 'string', 'max:255'],
            'from_email' => ['required', 'email', 'max:255'],
            'reply_to_email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['boolean'],
        ])->validate();

        $settings = EmailSettings::first();

        if ($settings) {
            // Only update password fields if provided
            $updateData = collect($validated)->except([
                'smtp_password', 'mailgun_secret', 'ses_secret', 'postmark_token',
            ])->toArray();

            if (! empty($validated['smtp_password'])) {
                $updateData['smtp_password'] = $validated['smtp_password'];
            }
            if (! empty($validated['mailgun_secret'])) {
                $updateData['mailgun_secret'] = $validated['mailgun_secret'];
            }
            if (! empty($validated['ses_secret'])) {
                $updateData['ses_secret'] = $validated['ses_secret'];
            }
            if (! empty($validated['postmark_token'])) {
                $updateData['postmark_token'] = $validated['postmark_token'];
            }

            // Reset verification status if settings changed
            $updateData['is_verified'] = false;
            $updateData['verified_at'] = null;

            $settings->update($updateData);
        } else {
            $settings = EmailSettings::create($validated);
        }

        return redirect()
            ->back()
            ->with('success', 'Email settings saved successfully.');
    }

    /**
     * Test email configuration
     */
    public function test(Request $request)
    {

        $request->validate([
            'test_email' => ['required', 'email'],
        ]);

        $settings = EmailSettings::first();

        if (! $settings) {
            return response()->json([
                'success' => false,
                'message' => 'Please save your email settings first.',
            ], 400);
        }

        if (! $settings->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Email settings are incomplete. Please check your configuration.',
            ], 400);
        }

        try {
            // Configure the mailer dynamically
            $this->configureMailer($settings);

            // Send test email
            Mail::raw('This is a test email from your Notification Studio. If you received this, your email settings are working correctly!', function ($message) use ($request, $settings) {
                $message->to($request->test_email)
                    ->subject('Test Email from '.($settings->from_name ?? config('app.name')));

                if ($settings->from_email) {
                    $message->from($settings->from_email, $settings->from_name);
                }
            });

            // Record success
            $settings->recordTestResult(true, 'Test email sent successfully');

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully to '.$request->test_email,
            ]);

        } catch (\Exception $e) {
            // Record failure
            $settings->recordTestResult(false, $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Configure mailer dynamically based on settings
     */
    private function configureMailer(EmailSettings $settings): void
    {
        $config = $settings->getMailConfig();

        switch ($settings->mail_driver) {
            case 'smtp':
                config([
                    'mail.default' => 'smtp',
                    'mail.mailers.smtp.host' => $config['host'],
                    'mail.mailers.smtp.port' => $config['port'],
                    'mail.mailers.smtp.username' => $config['username'],
                    'mail.mailers.smtp.password' => $config['password'],
                    'mail.mailers.smtp.encryption' => $config['encryption'],
                    'mail.from.address' => $config['from']['address'],
                    'mail.from.name' => $config['from']['name'],
                ]);
                break;

            case 'mailgun':
                config([
                    'mail.default' => 'mailgun',
                    'services.mailgun.domain' => $config['domain'],
                    'services.mailgun.secret' => $config['secret'],
                    'services.mailgun.endpoint' => $config['endpoint'],
                    'mail.from.address' => $config['from']['address'],
                    'mail.from.name' => $config['from']['name'],
                ]);
                break;

            case 'ses':
                config([
                    'mail.default' => 'ses',
                    'services.ses.key' => $config['key'],
                    'services.ses.secret' => $config['secret'],
                    'services.ses.region' => $config['region'],
                    'mail.from.address' => $config['from']['address'],
                    'mail.from.name' => $config['from']['name'],
                ]);
                break;

            case 'postmark':
                config([
                    'mail.default' => 'postmark',
                    'services.postmark.token' => $config['token'],
                    'mail.from.address' => $config['from']['address'],
                    'mail.from.name' => $config['from']['name'],
                ]);
                break;
        }

        // Refresh the mailer with new config
        app()->forgetInstance('mail.manager');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus()
    {

        $settings = EmailSettings::first();

        if (! $settings) {
            return redirect()
                ->back()
                ->with('error', 'Please configure your email settings first.');
        }

        if (! $settings->is_active && ! $settings->isConfigured()) {
            return redirect()
                ->back()
                ->with('error', 'Cannot enable incomplete email settings. Please fill in all required fields.');
        }

        $settings->update([
            'is_active' => ! $settings->is_active,
        ]);

        $status = $settings->is_active ? 'enabled' : 'disabled';

        return redirect()
            ->back()
            ->with('success', "Email settings {$status} successfully.");
    }
}
