<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'name_bn',
        'slug',
        'description',
        'description_bn',
        'price',
        'discount_price',
        'stock',
        'sku',
        'image',
        'images',
        'is_featured',
        'status',
        'brand',
        'view_count',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'status' => 'string',
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
