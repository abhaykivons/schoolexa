<?php

namespace App\Traits;

use Carbon\Carbon;

trait HasDateFormat
{
    public function formatDate($date)
    {
        if (!$date) return null;
        
        $format = config('app.date_format', 'Y-m-d');
        return Carbon::parse($date)->format($format);
    }

    public function formatTime($time)
    {
        if (!$time) return null;
        
        $format = config('app.time_format', 'H:i:s');
        return Carbon::parse($time)->format($format);
    }

    public function formatDateTime($datetime)
    {
        if (!$datetime) return null;
        
        $format = config('app.datetime_format', 'Y-m-d H:i:s');
        return Carbon::parse($datetime)->format($format);
    }
}