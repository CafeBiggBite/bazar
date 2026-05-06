<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LocationController;

// Public routes
Route::prefix('v1')->group(function () {
    // Locations (Bangladesh divisions, districts, upazilas)
    Route::get('/locations', [LocationController::class, 'index']);
    
    // Products (public browsing)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
    
    // Guest cart
    Route::post('/cart/sync', [CartController::class, 'sync']);
    
    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Password reset
    Route::post('/password/email', [AuthController::class, 'sendResetLink']);
    Route::post('/password/reset', [AuthController::class, 'resetPassword']);
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{id}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
    Route::post('/cart/apply-coupon', [CartController::class, 'applyCoupon']);
    
    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    
    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        
        // Product management
        Route::apiResource('products', \App\Http\Controllers\AdminProductController::class);
        
        // Order management
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::put('/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
        
        // User management
        Route::get('/users', [AdminController::class, 'users']);
        
        // Categories
        Route::apiResource('categories', \App\Http\Controllers\AdminCategoryController::class);
    });
});
