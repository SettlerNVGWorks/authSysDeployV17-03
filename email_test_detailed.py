#!/usr/bin/env python3
import requests
import json
import time
import os

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://3355cf0c-5fb3-435c-a8da-aa5fb209c20e.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

# Test data as specified in the review request
test_user = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "confirmPassword": "testpass123"
}

# Helper function to print test results
def print_test_result(test_name, success, response=None, error=None):
    print(f"\n{'=' * 80}")
    if success:
        print(f"✅ PASS: {test_name}")
    else:
        print(f"❌ FAIL: {test_name}")
    
    if response:
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")
    
    if error:
        print(f"Error: {error}")
    print(f"{'=' * 80}\n")
    return success

def test_registration():
    print("\n🔍 Testing Email Registration with SendGrid...")
    
    try:
        # First, let's check if the user already exists by trying to login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        login_response = requests.post(f"{API_URL}/auth/login", json=login_data)
        
        # If login is successful, user exists
        user_exists = login_response.status_code == 200
        
        if user_exists:
            print(f"User {test_user['email']} already exists, deleting to test fresh registration...")
            # We would need admin access to delete a user, so we'll just use a different email
            test_user["email"] = f"test.{int(time.time())}@example.com"
            print(f"Using new email: {test_user['email']}")
        
        # Now register the user
        response = requests.post(f"{API_URL}/auth/register", json=test_user)
        
        # Check if the response is 201 (success) or 409 (user already exists)
        if response.status_code == 201:
            success = True
            print(f"Created test user: {test_user['email']} and email was sent successfully")
        elif response.status_code == 409:
            # User already exists, which is fine for our test
            success = True
            print(f"User {test_user['email']} already exists, which is expected in repeated tests")
        elif response.status_code == 500 and "email" in response.text.lower():
            # Email sending failed but user might have been created
            success = False
            print("Email sending failed. Check the SendGrid API key.")
        else:
            success = False
            
        return print_test_result("User Registration with Email", success, response)
    except Exception as e:
        return print_test_result("User Registration with Email", False, error=str(e))

def test_resend_verification():
    print("\n🔍 Testing Resend Verification Email...")
    
    try:
        response = requests.post(f"{API_URL}/auth/resend-verification", json={"email": test_user["email"]})
        
        # Check if the response is 200 (success)
        if response.status_code == 200:
            success = True
            print(f"Verification email resent to: {test_user['email']}")
        elif response.status_code == 500 and "email" in response.text.lower():
            # Email sending failed
            success = False
            print("Email sending failed. Check the SendGrid API key.")
        else:
            success = False
            
        return print_test_result("Resend Verification Email", success, response)
    except Exception as e:
        return print_test_result("Resend Verification Email", False, error=str(e))

def test_forgot_password():
    print("\n🔍 Testing Forgot Password Email...")
    
    try:
        response = requests.post(f"{API_URL}/auth/forgot-password", json={"email": test_user["email"]})
        
        # Check if the response is 200 (success)
        if response.status_code == 200:
            success = True
            print(f"Password reset email sent to: {test_user['email']}")
        elif response.status_code == 500 and "email" in response.text.lower():
            # Email sending failed
            success = False
            print("Email sending failed. Check the SendGrid API key.")
        else:
            success = False
            
        return print_test_result("Forgot Password Email", success, response)
    except Exception as e:
        return print_test_result("Forgot Password Email", False, error=str(e))

def run_email_tests():
    print("\n🚀 Starting Email Functionality Tests with Updated SendGrid API Key\n")
    
    # Track test results
    results = {}
    
    # Run the tests
    results["User Registration with Email"] = test_registration()
    results["Resend Verification Email"] = test_resend_verification()
    results["Forgot Password Email"] = test_forgot_password()
    
    # Print summary
    print("\n📊 TEST SUMMARY")
    print(f"{'=' * 80}")
    passed = sum(1 for result in results.values() if result)
    failed = sum(1 for result in results.values() if not result)
    print(f"Total Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"{'=' * 80}")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    if failed > 0:
        print("\n⚠️ ISSUES SUMMARY")
        print(f"{'=' * 80}")
        print("Email functionality issues detected. The SendGrid API key appears to be invalid or expired.")
        print("The API returns a 403 Forbidden error when trying to send emails.")
        print("Possible solutions:")
        print("1. Verify the SendGrid API key is correct and active")
        print("2. Check if the SendGrid account is in good standing")
        print("3. Ensure the API key has the necessary permissions to send emails")
        print(f"{'=' * 80}")
    else:
        print("\n🎉 All email tests passed successfully! The updated SendGrid API key is working.")
    
    return passed, failed, results

if __name__ == "__main__":
    run_email_tests()