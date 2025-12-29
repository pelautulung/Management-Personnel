<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

/**
 * Application Console Kernel
 *
 * Define console application schedules and register console commands
 * for the SBTC Personnel Management System.
 */
class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param Schedule $schedule The schedule instance
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        // Example: Uncomment to enable inspire command
        // $schedule->command('inspire')->hourly();
        
        // Add your scheduled tasks here
        // Example:
        // $schedule->command('personnel:sync')->daily();
        // $schedule->job(new ProcessCertificationExpiry())->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     * @throws \Exception
     */
    protected function commands(): void
    {
        // Load commands from the Commands directory
        $this->load(__DIR__ . '/Commands');

        // Load console route definitions
        try {
            $consoleFile = base_path('routes/console.php');
            if (file_exists($consoleFile)) {
                require $consoleFile;
            }
        } catch (\Exception $e) {
            // Log error if console route file fails
            \Log::warning('Console route file error: ' . $e->getMessage());
        }
    }
}
