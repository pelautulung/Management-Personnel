<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Response;
use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;

/**
 * Application Exception Handler
 *
 * Handles all exceptions thrown by the application for the SBTC Personnel
 * Management System. Provides proper error reporting and response rendering.
 */
class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        // Add exception classes that should not be reported
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register(): void
    {
        // Report all exceptions
        $this->reportable(function (Throwable $e) {
            // Custom error reporting logic can be added here
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e);
            }
        });

        // Handle authentication exceptions
        $this->renderable(function (AuthenticationException $e) {
            return response()->json([
                'message' => 'Unauthenticated',
                'status' => Response::HTTP_UNAUTHORIZED,
            ], Response::HTTP_UNAUTHORIZED);
        });

        // Handle validation exceptions
        $this->renderable(function (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
                'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        });
    }

    /**
     * Render an exception into a response.
     *
     * @param \Illuminate\Http\Request $request
     * @param Throwable $e
     * @return Response
     *
     * @throws Throwable
     */
    public function render($request, Throwable $e)
    {
        try {
            // Return parent render for standard exceptions
            return parent::render($request, $e);
        } catch (Throwable $exception) {
            // Fallback error response if rendering fails
            return response()->json([
                'message' => 'An error occurred',
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
