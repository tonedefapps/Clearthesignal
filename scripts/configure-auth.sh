#!/usr/bin/env bash
set -e

PROJECT_ID="$1"
if [ -z "$PROJECT_ID" ]; then
  echo "Usage: ./scripts/configure-auth.sh <firebase-project-id>"
  exit 1
fi

echo "Getting access token..."
TOKEN=$(firebase auth:print-access-token 2>/dev/null || gcloud auth print-access-token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERROR: Could not get access token. Run 'firebase login' first."
  exit 1
fi

BASE="https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}"

echo "Enabling Email/Password + Email Link (passwordless)..."
curl -s -X PATCH \
  "${BASE}/config?updateMask=signIn" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "signIn": {
      "email": {
        "enabled": true,
        "passwordRequired": false
      }
    }
  }' | python3 -m json.tool 2>/dev/null || true

echo ""
echo "Enabling Google Sign-in..."
curl -s -X PATCH \
  "${BASE}/defaultSupportedIdpConfigs/google.com?updateMask=enabled" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}' | python3 -m json.tool 2>/dev/null || true

echo ""
echo "Enabling Apple Sign-in (base enable — you still need Apple credentials in Firebase Console)..."
curl -s -X PATCH \
  "${BASE}/defaultSupportedIdpConfigs/apple.com?updateMask=enabled" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}' | python3 -m json.tool 2>/dev/null || true

echo ""
echo "Adding authorized domains..."
# Get current config first
CURRENT=$(curl -s "${BASE}/config" -H "Authorization: Bearer ${TOKEN}")
echo "Current authorized domains: $(echo $CURRENT | python3 -c "import sys,json; c=json.load(sys.stdin); print(c.get('authorizedDomains',[]))" 2>/dev/null)"

curl -s -X PATCH \
  "${BASE}/config?updateMask=authorizedDomains" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "authorizedDomains": [
      "localhost",
      "clearthesignal.com",
      "www.clearthesignal.com",
      "clearthesignal.org",
      "clearthesignal.store",
      "clearthesignal.online",
      "clearthesignal.vercel.app"
    ]
  }' | python3 -m json.tool 2>/dev/null || true

echo ""
echo "Done! Check Firebase Console > Authentication > Sign-in method to verify."
echo ""
echo "NOTE: Apple Sign-in requires additional setup in Firebase Console:"
echo "  - Apple Team ID"
echo "  - Apple Service ID (e.g. com.clearthesignal.app)"
echo "  - Apple Private Key + Key ID (from developer.apple.com)"
