<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Admin dashboard statistics
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'delivered')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        
        $totalRevenue = Order::where('payment_status', 'paid')
            ->orWhere('payment_method', 'cod')
            ->sum('total');
        
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->orWhere('payment_method', 'cod')
            ->whereMonth('created_at', now()->month)
            ->sum('total');

        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock', '<', 10)->count();
        $outOfStockProducts = Product::where('stock', 0)->count();

        $recentOrders = Order::with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => [
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'completed_orders' => $completedOrders,
                    'cancelled_orders' => $cancelledOrders,
                    'total_revenue' => $totalRevenue,
                    'monthly_revenue' => $monthlyRevenue,
                    'total_products' => $totalProducts,
                    'low_stock_products' => $lowStockProducts,
                    'out_of_stock_products' => $outOfStockProducts,
                ],
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    /**
     * Get all orders with filtering
     */
    public function orders(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $query = Order::with(['user', 'items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number
        if ($request->has('search')) {
            $query->where('order_number', 'LIKE', "%{$request->search}%");
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders->items(),
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ],
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, Order $order)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,refunded',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $order->status = $validated['status'];
            
            if (isset($validated['payment_status'])) {
                $order->payment_status = $validated['payment_status'];
            }

            if (isset($validated['notes'])) {
                $existingNotes = json_decode($order->admin_notes, true) ?? [];
                $existingNotes[] = [
                    'note' => $validated['notes'],
                    'admin' => $user->name,
                    'timestamp' => now()->toIso8601String(),
                ];
                $order->admin_notes = json_encode($existingNotes);
            }

            // If delivered and COD, mark as paid
            if ($validated['status'] === 'delivered' && $order->payment_method === 'cod') {
                $order->payment_status = 'paid';
            }

            // If cancelled, restore stock
            if ($validated['status'] === 'cancelled') {
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        $variant = \App\Models\ProductVariant::find($item->product_variant_id);
                        if ($variant) {
                            $variant->stock += $item->quantity;
                            $variant->save();
                        }
                    } else {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->stock += $item->quantity;
                            $product->save();
                        }
                    }
                }
            }

            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order' => $order->load(['items', 'user']),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
            ], 500);
        }
    }

    /**
     * Get all users
     */
    public function users(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $query = User::where('role', '!=', 'admin');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ],
        ]);
    }
}
