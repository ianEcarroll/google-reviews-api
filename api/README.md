// File 5: /README.md
# Google Reviews API

This API fetches Google Business reviews using a service account.

## Setup

1. Deploy to Vercel
2. Add environment variables in Vercel:
   - `PROJECT_ID`
   - `PRIVATE_KEY_ID`
   - `PRIVATE_KEY`
   - `CLIENT_EMAIL`
   - `CLIENT_ID`
   - `CLIENT_CERT_URL`

## Endpoints

- `POST /api/google-reviews` - Fetch reviews for a location
- `GET /api/test` - Test endpoint

## Usage

```json
{
  "accountId": "your-account-id",
  "locationId": "your-location-id"
}
```
