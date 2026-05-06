<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of categories
     */
    public function index(Request $request)
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ['categories' => $categories],
        ]);
    }

    /**
     * Store a new category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => ['category' => $category],
        ], 201);
    }

    /**
     * Display the specified category
     */
    public function show(Category $category)
    {
        return response()->json([
            'success' => true,
            'data' => ['category' => $category->load('children')],
        ]);
    }

    /**
     * Update the specified category
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => ['category' => $category],
        ]);
    }

    /**
     * Remove the specified category
     */
    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with products',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
