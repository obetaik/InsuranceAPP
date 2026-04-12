<?php
// app/Http/Controllers/Api/PolicyController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PolicyController extends Controller
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
            
            $policies = Policy::where('user_id', $user->id)
                ->with(['product', 'quote'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $policies
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching policies: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch policies',
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
                'quote_id' => 'required|exists:quotes,id'
            ]);
            
            // Get the quote
            $quote = Quote::with('product')->findOrFail($validated['quote_id']);
            
            // Check if quote belongs to the authenticated user
            //if ($quote->user_id !== $user->id) {
            if ((int) $quote->user_id !== (int) $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: This quote does not belong to you'
                ], 403);
            }
            
            // Check if quote is already accepted
            if ($quote->status === 'accepted' || $quote->status === 'Accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'This quote has already been accepted'
                ], 422);
            }
            
            // Generate Policy Number
            $policyNumber = 'POL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            
            // Create policy with all required fields
            $policy = Policy::create([
                'user_id' => $user->id,
                'quote_id' => $quote->id,
                'insurance_product_id' => $quote->insurance_product_id,
                'policy_number' => $policyNumber,
                'premium_amount' => $quote->estimated_premium,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addYear()->toDateString(),
                'effective_date' => now()->toDateString(),  // Add effective_date
                'status' => 'Active'
            ]);
            
            // Update Quote Status
            $quote->update([
                'status' => 'accepted'
            ]);
            
            Log::info('Policy created', [
                'policy_id' => $policy->id,
                'policy_number' => $policyNumber,
                'quote_id' => $quote->id,
                'user_id' => $user->id
            ]);
            
            // Load relationships for response
            $policy->load(['product', 'quote']);
            
            return response()->json([
                'success' => true,
                'message' => 'Policy created successfully',
                'data' => $policy
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error creating policy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create policy',
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
            
            $policy = Policy::where('user_id', $user->id)
                ->with(['product', 'quote'])
                ->find($id);
            
            if (!$policy) {
                return response()->json([
                    'success' => false,
                    'message' => 'Policy not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $policy
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching policy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch policy',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}