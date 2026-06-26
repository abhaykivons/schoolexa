<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PublicHoliday extends Model
{
    use HasFactory;

    protected $fillable = [
        'country_code',
        'title',
        'description',
        'date',
        'end_date',
        'recurring',
        'recurrence_type',
        'month',
        'day',
        'color',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'end_date' => 'date',
        'recurring' => 'boolean',
        'is_active' => 'boolean',
        'month' => 'integer',
        'day' => 'integer',
    ];

    public static function getHolidaysForYear(int $year, ?string $countryCode = null): array
    {
        $holidays = [];

        $fixedHolidays = static::where('is_active', true)
            ->where('recurring', false)
            ->whereYear('date', $year)
            ->when($countryCode, function ($query) use ($countryCode) {
                $query->where(function ($q) use ($countryCode) {
                    $q->where('country_code', $countryCode)
                      ->orWhereNull('country_code');
                });
            }, function ($query) {
                $query->whereNull('country_code');
            })
            ->get();

        foreach ($fixedHolidays as $holiday) {
            $holidays[] = [
                'id' => 'holiday_' . $holiday->id . '_' . $holiday->date->format('Y-m-d'),
                'title' => $holiday->title,
                'description' => $holiday->description,
                'date' => $holiday->date,
                'end_date' => $holiday->end_date,
                'color' => $holiday->color,
                'is_holiday' => true,
            ];
        }

        $recurringHolidays = static::where('is_active', true)
            ->where('recurring', true)
            ->where('recurrence_type', 1)
            ->when($countryCode, function ($query) use ($countryCode) {
                $query->where(function ($q) use ($countryCode) {
                    $q->where('country_code', $countryCode)
                      ->orWhereNull('country_code');
                });
            }, function ($query) {
                $query->whereNull('country_code');
            })
            ->whereNotNull('month')
            ->whereNotNull('day')
            ->get();

        foreach ($recurringHolidays as $holiday) {
            try {
                $holidayDate = Carbon::create($year, $holiday->month, $holiday->day);
                $endDate = null;
                if ($holiday->end_date) {
                    $startDate = Carbon::create($year, $holiday->month, $holiday->day);
                    $originalEndDate = Carbon::parse($holiday->end_date);
                    $daysDiff = $originalEndDate->diffInDays($holiday->date);
                    $endDate = $startDate->copy()->addDays($daysDiff);
                }
                
                $holidays[] = [
                    'id' => 'holiday_' . $holiday->id . '_' . $year,
                    'title' => $holiday->title,
                    'description' => $holiday->description,
                    'date' => $holidayDate,
                    'end_date' => $endDate,
                    'color' => $holiday->color,
                    'is_holiday' => true,
                ];
            } catch (\Exception $e) {
                continue;
            }
        }

        $calculatedHolidays = static::where('is_active', true)
            ->where('recurring', true)
            ->where('recurrence_type', 2)
            ->when($countryCode, function ($query) use ($countryCode) {
                $query->where(function ($q) use ($countryCode) {
                    $q->where('country_code', $countryCode)
                      ->orWhereNull('country_code');
                });
            }, function ($query) {
                $query->whereNull('country_code');
            })
            ->get();

        foreach ($calculatedHolidays as $holiday) {
            if ($holiday->date) {
                $calculatedDate = Carbon::parse($holiday->date)->setYear($year);
                $endDate = null;
                if ($holiday->end_date) {
                    $originalEndDate = Carbon::parse($holiday->end_date);
                    $daysDiff = $originalEndDate->diffInDays($holiday->date);
                    $endDate = $calculatedDate->copy()->addDays($daysDiff);
                }
                
                $holidays[] = [
                    'id' => 'holiday_' . $holiday->id . '_' . $year,
                    'title' => $holiday->title,
                    'description' => $holiday->description,
                    'date' => $calculatedDate,
                    'end_date' => $endDate,
                    'color' => $holiday->color,
                    'is_holiday' => true,
                ];
            }
        }

        return $holidays;
    }

    public static function getHolidaysForDateRange(Carbon $startDate, Carbon $endDate, ?string $countryCode = null): array
    {
        $holidays = [];
        $startYear = $startDate->year;
        $endYear = $endDate->year;

        for ($year = $startYear; $year <= $endYear; $year++) {
            $yearHolidays = static::getHolidaysForYear($year, $countryCode);
            foreach ($yearHolidays as $holiday) {
                $holidayDate = Carbon::parse($holiday['date']);
                if ($holidayDate->gte($startDate) && $holidayDate->lte($endDate)) {
                    $holidays[] = $holiday;
                }
            }
        }

        return $holidays;
    }
}

