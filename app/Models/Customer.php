<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $guarded = array();

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    public function getTableColumn(): array
    {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }

    public function ecommerceAffiliates(): HasMany
    {
        return $this->hasMany(EcommerceAffiliate::class);
    }
}
