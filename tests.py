import unittest
import sys
import subprocess
import os
import json
import shutil
from pathlib import Path

# --- Dependency Check ---
try:
    import httpx
except ImportError:
    print("Installing test dependencies (httpx)...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "httpx"])
    import httpx

try:
    from fastapi.testclient import TestClient
except ImportError:
    print("FastAPI not found. Please run 'pip install -r requirements.txt'")
    sys.exit(1)

# --- Import App and Mock DB ---
# We need to mock the DB path BEFORE importing the app or running tests
import db

TEST_DB_PATH = Path("test_db.json")
INITIAL_DB_STATE = {
    "users": [],
    "wallets": [],
    "transactions": []
}

# Redirect DB operations to test file
db.DB_PATH = TEST_DB_PATH

from main import app

# --- Backend Tests ---
class TestBackendAPI(unittest.TestCase):
    def setUp(self):
        # Create a fresh test DB before each test
        with open(TEST_DB_PATH, "w") as f:
            json.dump(INITIAL_DB_STATE, f)
        self.client = TestClient(app)
        
        # Test Data
        self.user_email = "test@example.com"
        self.user_pass = "password123"
        self.user_name = "Test User"

    def tearDown(self):
        # Clean up test DB after each test
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "OK"})

    def test_auth_flow_and_wallet(self):
        # 1. Register
        reg_payload = {
            "name": self.user_name,
            "email": self.user_email,
            "password": self.user_pass
        }
        response = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("userId", data)
        
        # 2. Login to get token
        login_payload = {
            "email": self.user_email,
            "password": self.user_pass
        }
        response = self.client.post("/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        login_data = response.json()
        self.assertIn("token", login_data)
        token = login_data["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Set PIN
        pin = "1234"
        response = self.client.post("/auth/set-pin", json={"pin": pin}, headers=headers)
        self.assertEqual(response.status_code, 200)

        # 4. Get Wallet (Should be 0 initially)
        # Note: /wallet requires X-Wallet-Pin header
        headers_with_pin = headers.copy()
        headers_with_pin["X-Wallet-Pin"] = pin
        
        response = self.client.get("/wallet", headers=headers_with_pin)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["balance"], 0)

        # 5. Add Money
        add_amount = 500
        # /wallet/add-money requires pin in body
        response = self.client.post("/wallet/add-money", json={"amount": add_amount, "pin": pin}, headers=headers)
        self.assertEqual(response.status_code, 200)
        # It returns {"balance": new_balance}
        self.assertEqual(response.json()["balance"], add_amount)

        # 6. Verify Balance Updated
        response = self.client.get("/wallet", headers=headers_with_pin)
        self.assertEqual(response.json()["balance"], add_amount)

# --- Frontend Tests ---
def run_frontend_build_test():
    print("\n" + "="*40)
    print("Running Frontend Build Test...")
    print("="*40)
    
    frontend_dir = Path("FrontEnd")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return False

    # Check if node_modules exists, if not install
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("📦 Installing Frontend Dependencies (this may take a minute)...")
        try:
            subprocess.run("npm install", cwd=frontend_dir, shell=True, check=True)
        except subprocess.CalledProcessError:
            print("❌ 'npm install' failed. Do you have Node.js installed?")
            return False

    # Run Build
    print("🔨 Running 'npm run build'...")
    try:
        # Using shell=True for Windows compatibility
        subprocess.run("npm run build", cwd=frontend_dir, shell=True, check=True)
        print("✅ Frontend Build Successful!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Frontend Build Failed!")
        return False

# --- Main Runner ---
if __name__ == "__main__":
    print("\n" + "="*40)
    print("Running Backend Integration Tests...")
    print("="*40)
    
    # Run unittest suite
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(unittest.makeSuite(TestBackendAPI))
    
    backend_success = result.wasSuccessful()
    
    # Run frontend test
    frontend_success = run_frontend_build_test()
    
    print("\n" + "="*40)
    print("SUMMARY")
    print("="*40)
    print(f"Backend Tests: {'✅ PASS' if backend_success else '❌ FAIL'}")
    print(f"Frontend Build: {'✅ PASS' if frontend_success else '❌ FAIL'}")
    
    if not (backend_success and frontend_success):
        sys.exit(1)
    else:
        print("\n🚀 All Systems Go!")
        sys.exit(0)
