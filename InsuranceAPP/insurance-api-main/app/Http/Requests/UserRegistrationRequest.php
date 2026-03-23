<?php
// app/Http/Requests/UserRegistrationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        echo "\n🔐 Authorization check for registration\n";
        echo "✅ User is authorized\n";
        return true;
    }

    public function rules(): array
    {
        echo "\n📋 Loading validation rules for registration\n";
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip_code' => 'nullable|string|max:20',
            'auth0_id' => 'nullable|string|unique:users,auth0_id',
            'password' => 'nullable|string|min:6|confirmed',
        ];
        
        echo "Rules: " . json_encode($rules, JSON_PRETTY_PRINT) . "\n";
        
        return $rules;
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'name.required' => 'Full name is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.confirmed' => 'Password confirmation does not match',
            'auth0_id.unique' => 'This Auth0 ID is already registered',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        echo "\n❌ Validation failed!\n";
        echo "Errors:\n";
        echo json_encode($validator->errors()->toArray(), JSON_PRETTY_PRINT) . "\n";
        
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'errors' => $validator->errors()
        ], 422));
    }

    protected function prepareForValidation()
    {
        echo "\n📝 Preparing request data for validation\n";
        echo "Raw request data:\n";
        echo json_encode($this->all(), JSON_PRETTY_PRINT) . "\n";
        
        // Sanitize input
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/[^0-9+\-\(\)\s]/', '', $this->phone)
            ]);
            echo "📱 Phone sanitized: {$this->phone}\n";
        }
        
        if ($this->has('zip_code')) {
            $this->merge([
                'zip_code' => strtoupper(trim($this->zip_code))
            ]);
            echo "📮 Zip code normalized: {$this->zip_code}\n";
        }
    }
}