<?php
// app/Http/Controllers/Api/ClaimController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClaimController extends Controller
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
            
            $claims = Claim::where('user_id', $user->id)
                ->with('policy')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $claims
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching claims: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch claims',
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
                'policy_id' => 'required|exists:policies,id',
                'incident_date' => 'required|date',
                'description' => 'required|string',
                'claim_amount' => 'required|numeric|min:0'
            ]);
            
            // Check if policy belongs to user
            $policy = \App\Models\Policy::where('id', $validated['policy_id'])
                ->where('user_id', $user->id)
                ->first();
            
            if (!$policy) {
                return response()->json([
                    'success' => false,
                    'message' => 'Policy not found or does not belong to you'
                ], 404);
            }
            
            // Check if policy is active
            if ($policy->status !== 'Active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot file claim on inactive policy'
                ], 422);
            }
            
            // Generate claim number
            $claimNumber = 'CLM-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            
            // Create claim
            $claim = Claim::create([
                'user_id' => $user->id,
                'policy_id' => $validated['policy_id'],
                'claim_number' => $claimNumber,
                'incident_date' => $validated['incident_date'],
                'description' => $validated['description'],
                'claim_amount' => $validated['claim_amount'],
                'status' => 'Submitted'
            ]);
            
            Log::info('Claim created', [
                'claim_id' => $claim->id,
                'claim_number' => $claimNumber,
                'user_id' => $user->id,
                'policy_id' => $validated['policy_id']
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Claim submitted successfully',
                'data' => $claim
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error creating claim: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit claim',
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
            
            $claim = Claim::where('user_id', $user->id)
                ->with('policy')
                ->find($id);
            
            if (!$claim) {
                return response()->json([
                    'success' => false,
                    'message' => 'Claim not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $claim
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching claim: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}