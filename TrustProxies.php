<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

/**
 * Trust Proxies Middleware
 *
 * Configure trusted proxies for the application. This middleware allows you to
 * specify which proxies should be trusted when behind a load balancer or reverse proxy.
 */
class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = [
        // Add trusted proxy IP addresses here
        // Example: '10.0.0.1', '10.0.0.2'
    ];

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR |
                         Request::HEADER_X_FORWARDED_HOST |
                         Request::HEADER_X_FORWARDED_PROTO |
                         Request::HEADER_X_FORWARDED_AWS_ELB |
                         Request::HEADER_X_FORWARDED_PORT;

    /**
     * Bootstrap the middleware.
     *
     * This method is called when the middleware is applied to a request.
     * It can be used to perform any setup required before processing.
     *
     * @return void
     */
    public function boot(): void
    {
        // Configure proxy settings based on environment
        if (app()->environment('production')) {
            // In production, trust all proxies from X-Forwarded-For header
            $this->proxies = '*';
        }
    }
}
