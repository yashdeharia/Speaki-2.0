// Test the matching API
// 1. Register users with interests, intent, location, activities
// 2. Login to get JWT token
// 3. Call GET /matches to see calculated matches

// Example registration payload:
{
  "email": "user1@example.com",
  "password": "password123",
  "interests": ["music", "sports", "travel"],
  "intent": "dating",
  "location": "New York",
  "activities": ["hiking", "cooking", "movies"]
}

// Example API calls:
// POST /register (with above payload)
// POST /login {"email": "user1@example.com", "password": "password123"}
// GET /matches (with Authorization: Bearer <token>)

// Matching score formula:
// score = (commonInterests * 5) + (sameIntent * 10) + (locationMatch * 3) + (activityScore * 2)