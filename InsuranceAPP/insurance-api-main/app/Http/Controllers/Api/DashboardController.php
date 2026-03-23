<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quote;
use App\Models\Policy;
use App\Models\Claim;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
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
            
            // Log to Laravel log instead of echoing
            Log::info('DashboardController: Fetching dashboard data', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            // Get counts
            $activePolicies = Policy::where('user_id', $user->id)
                ->where('status', 'Active')
                ->count();
            
            $pendingQuotes = Quote::where('user_id', $user->id)
                ->where('status', 'Pending')
                ->count();
            
            $openClaims = Claim::where('user_id', $user->id)
                ->whereIn('status', ['Submitted', 'Under Review'])
                ->count();
            
            // Get recent quotes
            $recentQuotes = Quote::where('user_id', $user->id)
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($quote) {
                    return [
                        'id' => $quote->id,
                        'quote_number' => $quote->quote_number ?? 'Q-' . $quote->id,
                        'product_name' => $quote->product ? $quote->product->name : 'N/A',
                        'calculated_price' => $quote->estimated_premium ?? $quote->calculated_price ?? 0,
                        'status' => $quote->status ?? 'Pending',
                        'created_at' => $quote->created_at,
                    ];
                });
            
            // Get recent policies
            $recentPolicies = Policy::where('user_id', $user->id)
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($policy) {
                    return [
                        'id' => $policy->id,
                        'policy_number' => $policy->policy_number ?? 'P-' . $policy->id,
                        'product_name' => $policy->product ? $policy->product->name : 'N/A',
                        'premium_amount' => $policy->premium_amount ?? 0,
                        'status' => $policy->status ?? 'Active',
                        'start_date' => $policy->start_date,
                        'end_date' => $policy->end_date,
                    ];
                });
            
            // Get recent claims
            $recentClaims = Claim::where('user_id', $user->id)
                ->with('policy')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($claim) {
                    return [
                        'id' => $claim->id,
                        'claim_number' => $claim->claim_number,
                        'policy_number' => $claim->policy ? $claim->policy->policy_number : 'N/A',
                        'claim_amount' => $claim->claim_amount,
                        'status' => $claim->status,
                        'incident_date' => $claim->incident_date,
                        'created_at' => $claim->created_at,
                    ];
                });
            
            $response = [
                'success' => true,
                'summary' => [
                    'active_policies' => $activePolicies,
                    'pending_quotes' => $pendingQuotes,
                    'open_claims' => $openClaims,
                ],
                'recent_quotes' => $recentQuotes,
                'recent_policies' => $recentPolicies,
                'recent_claims' => $recentClaims,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ]
            ];
            
            Log::info('Dashboard data prepared', [
                'summary' => $response['summary']
            ]);
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}