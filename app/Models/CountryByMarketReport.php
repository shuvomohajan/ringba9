<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CountryByMarketReport extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function getTableColumn()
    {
       return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
