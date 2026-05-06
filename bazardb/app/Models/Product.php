<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name_en',
        'name_bn',
        'slug',
        'description_en',
        'description_bn',
        'price',
        'discount_price',
        'stock',
        'sku',
        'images',
        'is_featured',
        'is_active',
        'brand',
        'view_count',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'images' => 'array',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getDiscountedPriceAttribute()
    {
        return $this->discount_price ?? $this->price;
    }
}
