<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering and search
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'variants'])
            ->where('status', 'active');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Stock filter
        if ($request->has('in_stock') && $request->in_stock === 'true') {
            $query->where('stock', '>', 0);
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $order = $request->get('order', 'desc');
        $validSorts = ['name', 'price', 'stock', 'created_at', 'updated_at'];
        
        if (in_array($sortBy, $validSorts)) {
            $query->orderBy($sortBy, $order);
        }

        $perPage = min((int) $request->get('per_page', 15), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        $product->load(['category', 'variants']);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
            ],
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
            ],
        ]);
    }
}
