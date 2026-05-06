<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products (admin)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'variants']);

        if ($request->has('search')) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => ['products' => $products],
        ]);
    }

    /**
     * Store a new product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:products',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'status' => 'required|in:active,inactive',
            'variants' => 'nullable|array',
        ]);

        $product = Product::create($validated);

        if ($request->has('variants') && is_array($request->variants)) {
            foreach ($request->variants as $variant) {
                $product->variants()->create($variant);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => ['product' => $product->load('variants')],
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => ['product' => $product->load('variants')],
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'sometimes|required|string|unique:products,sku,' . $product->id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => ['product' => $product->fresh('variants')],
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}
