<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get cart for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $cart = Cart::with(['items.product', 'items.variant'])
            ->firstOrCreate(
                ['user_id' => $user->id],
                ['subtotal' => 0, 'discount' => 0, 'total' => 0]
            );

        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
            ],
        ]);
    }

    /**
     * Sync guest cart to user cart on login
     */
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
        ]);

        $user = $request->user();
        
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['subtotal' => 0, 'discount' => 0, 'total' => 0]
        );

        DB::beginTransaction();
        try {
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    continue;
                }

                $variant = null;
                if (isset($item['variant_id'])) {
                    $variant = ProductVariant::find($item['variant_id']);
                }

                $price = $variant ? $variant->price : $product->price;
                $quantity = (int) $item['quantity'];

                CartItem::updateOrCreate(
                    [
                        'cart_id' => $cart->id,
                        'product_id' => $product->id,
                        'product_variant_id' => $item['variant_id'] ?? null,
                    ],
                    [
                        'product_name' => $product->name,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $price * $quantity,
                    ]
                );
            }

            $this->recalculateCart($cart);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cart synced successfully',
                'data' => [
                    'cart' => $cart->load(['items.product', 'items.variant']),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync cart',
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['subtotal' => 0, 'discount' => 0, 'total' => 0]
        );

        $product = Product::findOrFail($validated['product_id']);
        
        $variant = null;
        if ($validated['variant_id']) {
            $variant = ProductVariant::findOrFail($validated['variant_id']);
        }

        $price = $variant ? $variant->price : $product->price;
        $quantity = $validated['quantity'];

        // Check stock
        $availableStock = $variant ? $variant->stock : $product->stock;
        if ($quantity > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $cartItem = CartItem::updateOrCreate(
                [
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'product_variant_id' => $validated['variant_id'] ?? null,
                ],
                [
                    'product_name' => $product->name,
                    'quantity' => DB::raw('quantity + ' . $quantity),
                    'price' => $price,
                ]
            );

            $cartItem->total = $cartItem->price * $cartItem->quantity;
            $cartItem->save();

            $this->recalculateCart($cart);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart',
                'data' => [
                    'cart' => $cart->load(['items.product', 'items.variant']),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found',
            ], 404);
        }

        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $product = Product::find($cartItem->product_id);
        $variant = $cartItem->product_variant_id ? ProductVariant::find($cartItem->product_variant_id) : null;

        $availableStock = $variant ? $variant->stock : $product->stock;
        if ($validated['quantity'] > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available',
            ], 422);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->total = $cartItem->price * $cartItem->quantity;
        $cartItem->save();

        $this->recalculateCart($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => [
                'cart' => $cart->load(['items.product', 'items.variant']),
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request, $id)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found',
            ], 404);
        }

        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $cartItem->delete();
        $this->recalculateCart($cart);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => [
                'cart' => $cart->load(['items.product', 'items.variant']),
            ],
        ]);
    }

    /**
     * Apply coupon code
     */
    public function applyCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found',
            ], 404);
        }

        $coupon = Coupon::where('code', $validated['code'])
            ->where('status', 'active')
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code',
            ], 404);
        }

        // Check expiry
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon has expired',
            ], 422);
        }

        // Check minimum order value
        if ($coupon->min_order_value && $cart->subtotal < $coupon->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum order value not met',
            ], 422);
        }

        $discount = 0;
        if ($coupon->type === 'percentage') {
            $discount = ($cart->subtotal * $coupon->value) / 100;
            if ($coupon->max_discount && $discount > $coupon->max_discount) {
                $discount = $coupon->max_discount;
            }
        } else {
            $discount = $coupon->value;
        }

        $cart->discount = $discount;
        $cart->total = $cart->subtotal - $discount;
        $cart->coupon_code = $coupon->code;
        $cart->save();

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully',
            'data' => [
                'cart' => $cart,
                'discount' => $discount,
            ],
        ]);
    }

    /**
     * Recalculate cart totals
     */
    private function recalculateCart(Cart $cart)
    {
        $subtotal = $cart->items()->sum('total');
        
        // Calculate shipping based on district (simplified)
        $shipping = 0;
        if ($cart->delivery_district) {
            // Dhaka: 60, Other divisions: 120
            $dhakaDistricts = ['Dhaka', 'Gazipur', 'Narayanganj', 'Savar'];
            $shipping = in_array($cart->delivery_district, $dhakaDistricts) ? 60 : 120;
        }

        // VAT (15%)
        $vat = ($subtotal - $cart->discount) * 0.15;

        $cart->subtotal = $subtotal;
        $cart->shipping = $shipping;
        $cart->vat = $vat;
        $cart->total = $subtotal + $shipping + $vat - $cart->discount;
        $cart->save();
    }
}
