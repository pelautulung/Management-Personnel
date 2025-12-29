<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

/**
 * Encrypt Cookies Middleware
 *
 * This middleware automatically encrypts and decrypts cookies for the application.
 * Sensitive cookies can be excluded from encryption if needed.
 */
class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Add cookie names that should NOT be encrypted here
        // Example: 'XSRF-TOKEN', 'laravel_session'
    ];

    /**
     * Indicates if cookies should be encrypted.
     *
     * @var bool
     */
    protected $encrypt = true;

    /**
     * Bootstrap the middleware.
     *
     * Configure encryption behavior based on the application environment.
     *
     * @return void
     */
    public function boot(): void
    {
        // Disable encryption in development if needed for debugging
        if (app()->environment('local')) {
            // In development, you might want to exclude certain cookies
            // to make debugging easier
            $this->except[] = 'debug_toolbar';
        }
    }
}
