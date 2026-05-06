<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'customer_name',
        'customer_phone',
        'customer_email',
        'division',
        'district',
        'upazila',
        'address',
        'notes',
        'coupon_code',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber()
    {
        return 'ORD-' . strtoupper(uniqid());
    }
}
