<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Place a new order
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'delivery_name' => 'required|string|max:255',
            'delivery_phone' => 'required|string|size:10',
            'delivery_division' => 'required|string',
            'delivery_district' => 'required|string',
            'delivery_upazila' => 'nullable|string',
            'delivery_address' => 'required|string',
            'payment_method' => 'required|in:cod,bkash,nagad',
            'bkash_number' => 'nullable|string|size:10',
            'nagad_number' => 'nullable|string|size:10',
            'notes' => 'nullable|string',
        ]);

        // Validate Bangladesh phone format
        if (!preg_match('/^[1][3-9]\d{8}$/', $validated['delivery_phone'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid delivery phone number. Please provide a valid 10-digit Bangladesh phone number.',
            ], 422);
        }

        if ($validated['payment_method'] === 'bkash' && $validated['bkash_number']) {
            if (!preg_match('/^[1][3-9]\d{8}$/', $validated['bkash_number'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid bKash number.',
                ], 422);
            }
        }

        if ($validated['payment_method'] === 'nagad' && $validated['nagad_number']) {
            if (!preg_match('/^[1][3-9]\d{8}$/', $validated['nagad_number'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Nagad number.',
                ], 422);
            }
        }

        $cart = Cart::where('user_id', $user->id)->with('items')->first();

        if (!$cart || $cart->items->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Check stock availability for all items
            foreach ($cart->items as $item) {
                $product = Product::find($item->product_id);
                $variant = $item->product_variant_id ? ProductVariant::find($item->product_variant_id) : null;

                $availableStock = $variant ? $variant->stock : $product->stock;
                if ($item->quantity > $availableStock) {
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for {$item->product_name}",
                    ], 422);
                }
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'subtotal' => $cart->subtotal,
                'discount' => $cart->discount,
                'shipping' => $cart->shipping,
                'vat' => $cart->vat,
                'total' => $cart->total,
                'delivery_name' => $validated['delivery_name'],
                'delivery_phone' => '+880' . $validated['delivery_phone'],
                'delivery_division' => $validated['delivery_division'],
                'delivery_district' => $validated['delivery_district'],
                'delivery_upazila' => $validated['delivery_upazila'] ?? null,
                'delivery_address' => $validated['delivery_address'],
                'payment_method' => $validated['payment_method'],
                'bkash_number' => $validated['bkash_number'] ? '+880' . $validated['bkash_number'] : null,
                'nagad_number' => $validated['nagad_number'] ? '+880' . $validated['nagad_number'] : null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            // Create order items and update stock
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                ]);

                // Update stock
                if ($item->product_variant_id) {
                    $variant = ProductVariant::find($item->product_variant_id);
                    $variant->stock -= $item->quantity;
                    $variant->save();
                } else {
                    $product = Product::find($item->product_id);
                    $product->stock -= $item->quantity;
                    $product->save();
                }
            }

            // Clear cart
            $cart->items()->delete();
            $cart->subtotal = 0;
            $cart->discount = 0;
            $cart->shipping = 0;
            $cart->vat = 0;
            $cart->total = 0;
            $cart->coupon_code = null;
            $cart->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'order' => $order->load('items'),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's orders
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Order::where('user_id', $user->id)
            ->with(['items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

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
     * Get single order details
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Only allow users to view their own orders (unless admin)
        if ($order->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $order->load(['items']);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
            ],
        ]);
    }
}
