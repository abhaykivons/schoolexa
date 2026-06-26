<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SpamProtection
{
    /**
     * Maximum submissions per IP per hour
     */
    protected int $maxSubmissionsPerHour = 10;

    /**
     * Maximum submissions per IP per day
     */
    protected int $maxSubmissionsPerDay = 30;

    /**
     * Block duration in minutes when limit exceeded
     */
    protected int $blockDurationMinutes = 60;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Check if IP is blocked
        if ($this->isBlocked($ip)) {
            Log::warning('Blocked IP attempted form submission', ['ip' => $ip]);
            return $this->blockedResponse();
        }

        // Check honeypot field (if filled, it's a bot)
        if ($this->honeypotFilled($request)) {
            Log::warning('Honeypot triggered - bot detected', ['ip' => $ip]);
            $this->blockIp($ip);
            // Return success to fool the bot, but don't process
            return back()->with('success', 'Thank you for your submission!');
        }

        // Check submission rate
        if (!$this->checkRateLimit($ip)) {
            Log::warning('Rate limit exceeded for IP', ['ip' => $ip]);
            $this->blockIp($ip);
            return $this->rateLimitResponse();
        }

        // Check for spam patterns in content
        if ($this->containsSpamPatterns($request)) {
            Log::warning('Spam patterns detected', ['ip' => $ip]);
            return back()->withErrors(['message' => 'Your submission appears to contain spam. Please try again.']);
        }

        // Check minimum time between page load and submission (bot detection)
        if ($this->submittedTooFast($request)) {
            Log::warning('Form submitted too fast - possible bot', ['ip' => $ip]);
            return back()->withErrors(['message' => 'Please take your time to fill out the form.']);
        }

        // Increment submission counter
        $this->incrementSubmissionCount($ip);

        return $next($request);
    }

    /**
     * Check if IP is blocked
     */
    protected function isBlocked(string $ip): bool
    {
        return Cache::has("blocked_ip:{$ip}");
    }

    /**
     * Block an IP address
     */
    protected function blockIp(string $ip): void
    {
        Cache::put("blocked_ip:{$ip}", true, now()->addMinutes($this->blockDurationMinutes));
        Log::info("IP blocked for {$this->blockDurationMinutes} minutes", ['ip' => $ip]);
    }

    /**
     * Check if honeypot field is filled (indicates bot)
     */
    protected function honeypotFilled(Request $request): bool
    {
        // These are hidden fields that should be empty
        $honeypotFields = ['website_url', 'company_address', 'fax_number'];
        
        foreach ($honeypotFields as $field) {
            if ($request->filled($field)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check rate limits
     */
    protected function checkRateLimit(string $ip): bool
    {
        $hourlyKey = "submissions_hourly:{$ip}";
        $dailyKey = "submissions_daily:{$ip}";

        $hourlyCount = Cache::get($hourlyKey, 0);
        $dailyCount = Cache::get($dailyKey, 0);

        if ($hourlyCount >= $this->maxSubmissionsPerHour) {
            return false;
        }

        if ($dailyCount >= $this->maxSubmissionsPerDay) {
            return false;
        }

        return true;
    }

    /**
     * Increment submission count for IP
     */
    protected function incrementSubmissionCount(string $ip): void
    {
        $hourlyKey = "submissions_hourly:{$ip}";
        $dailyKey = "submissions_daily:{$ip}";

        // Increment hourly counter (expires in 1 hour)
        $hourlyCount = Cache::get($hourlyKey, 0);
        Cache::put($hourlyKey, $hourlyCount + 1, now()->addHour());

        // Increment daily counter (expires at midnight)
        $dailyCount = Cache::get($dailyKey, 0);
        Cache::put($dailyKey, $dailyCount + 1, now()->endOfDay());
    }

    /**
     * Check for common spam patterns
     */
    protected function containsSpamPatterns(Request $request): bool
    {
        $spamPatterns = [
            '/\b(viagra|cialis|casino|poker|lottery|winner|prize|congratulations)\b/i',
            '/\b(click here|buy now|limited time|act now|urgent)\b/i',
            '/https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i', // Suspicious TLDs
            '/(.)\1{10,}/', // Repeated characters (aaaaaaaaaa)
            '/\b[A-Z]{20,}\b/', // Long strings of caps
        ];

        $fieldsToCheck = ['message', 'name', 'email', 'school_name', 'company_name'];

        foreach ($fieldsToCheck as $field) {
            $value = $request->input($field, '');
            if (empty($value)) continue;

            foreach ($spamPatterns as $pattern) {
                if (preg_match($pattern, $value)) {
                    return true;
                }
            }
        }

        // Check for too many URLs in message
        $message = $request->input('message', '');
        $urlCount = preg_match_all('/https?:\/\//', $message);
        if ($urlCount > 3) {
            return true;
        }

        return false;
    }

    /**
     * Check if form was submitted too quickly (bot behavior)
     */
    protected function submittedTooFast(Request $request): bool
    {
        $timestamp = $request->input('_form_token_time');
        
        if (!$timestamp) {
            return false; // No timestamp, skip this check
        }

        $loadTime = (int) base64_decode($timestamp);
        $submitTime = time();
        $timeDiff = $submitTime - $loadTime;

        // If submitted in less than 3 seconds, likely a bot
        return $timeDiff < 3;
    }

    /**
     * Return blocked response
     */
    protected function blockedResponse(): Response
    {
        return back()->withErrors([
            'message' => 'Too many requests. Please try again later.',
        ])->setStatusCode(429);
    }

    /**
     * Return rate limit response
     */
    protected function rateLimitResponse(): Response
    {
        return back()->withErrors([
            'message' => 'You have made too many submissions. Please try again in an hour.',
        ])->setStatusCode(429);
    }
}
