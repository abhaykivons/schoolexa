<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    protected ?string $secretKey;
    protected float $minScore;

    public function __construct()
    {
        $this->secretKey = config('services.recaptcha.secret_key') ?? '';
        $this->minScore = (float) (config('services.recaptcha.min_score') ?? 0.5);
    }

    /**
     * Verify reCAPTCHA token
     */
    public function verify(?string $token): bool
    {
        // If reCAPTCHA is not configured, skip verification
        if (!$this->secretKey || empty($this->secretKey)) {
            return true;
        }

        if (empty($token)) {
            Log::warning('reCAPTCHA token missing');
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $this->secretKey,
                'response' => $token,
            ]);

            $result = $response->json();

            if (!$result['success']) {
                Log::warning('reCAPTCHA verification failed', ['errors' => $result['error-codes'] ?? []]);
                return false;
            }

            // For reCAPTCHA v3, check the score
            if (isset($result['score']) && $result['score'] < $this->minScore) {
                Log::warning('reCAPTCHA score too low', ['score' => $result['score']]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification error', ['error' => $e->getMessage()]);
            // In case of error, allow submission but log it
            return true;
        }
    }
}
