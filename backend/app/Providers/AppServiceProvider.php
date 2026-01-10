<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
        // Named rate limiter for the API middleware group
        RateLimiter::for('api', function (Request $request) {
            return [
                Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip()),
            ];
        });
    }
}
