<?php
// app/Http/Controllers/Api/QuoteController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsuranceProduct;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $quotes = Quote::where('user_id', $user->id)
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $quotes
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching quotes: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quotes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $quote = Quote::where('user_id', $user->id)
                ->with('product')
                ->find($id);
            
            if (!$quote) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $quote
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching quote: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            // Validate the request
            $validated = $request->validate([
                'insurance_product_id' => 'required|exists:insurance_products,id',
                'coverage_amount' => 'nullable|numeric|min:0',
                'deductible' => 'nullable|numeric|min:0',
                'calculated_price' => 'required|numeric|min:0',
                'additional_options' => 'nullable|string'
            ]);
            
            // Generate quote number
            $quoteNumber = 'Q-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            
            // Create quote
            $quote = Quote::create([
                'user_id' => $user->id,
                'insurance_product_id' => $validated['insurance_product_id'],
                'quote_number' => $quoteNumber,
                'estimated_premium' => $validated['calculated_price'],
                'coverage_amount' => $validated['coverage_amount'] ?? 100000,
                'deductible' => $validated['deductible'] ?? 500,
                'additional_options' => $validated['additional_options'] ?? null,
                'status' => 'Pending'
            ]);
            
            Log::info('Quote created', ['quote_id' => $quote->id, 'user_id' => $user->id]);
            
            // Load product relationship for response
            $quote->load('product');
            
            return response()->json([
                'success' => true,
                'message' => 'Quote generated successfully',
                'data' => $quote
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error creating quote: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}