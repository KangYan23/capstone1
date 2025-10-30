# Dynamic Database Integration Guide

## How It Works

The chatbot now **fully integrates with your MongoDB database** - no hardcoded values!

## 🔄 Dynamic Flow

### Step 1: Body Area Selection
```
GET /api/chat?type=bodyArea
→ Returns: ["Cardia", "Thorax", "Abdomen", ...] (all unique bodyArea values from your database)
```

### Step 2: Panel Selection
```
GET /api/chat?type=panel&filters={"bodyArea":"Cardia"}
→ Returns: ["Cardia", "Neurological", ...] (panels where bodyArea = "Cardia")
```

### Step 3: Age Group Selection
```
GET /api/chat?type=ageGroup&filters={"bodyArea":"Cardia","panel":"Cardia"}
→ Returns: ["All (0-150)", "Adult (18-65)", ...] (age groups matching previous selections)
```

### Step 4: Sex Selection
```
GET /api/chat?type=sex&filters={"bodyArea":"Cardia","panel":"Cardia","ageGroup":"All (0-150)"}
→ Returns: ["All", "Male", "Female", ...] (sex options matching all previous selections)
```

### Step 5: Scenario Search
```
POST /api/chat
Body: {
  "scenario": "chest pain",
  "bodyArea": "Cardia",
  "panel": "Cardia",
  "ageGroup": "All (0-150)",
  "sex": "All"
}
→ Returns: [matching documents with scenario, description, symptoms, recommendations]
```

## 📊 Database Structure Requirements

Your MongoDB collection must have these fields for the flow to work:

```javascript
{
  bodyArea: String,    // Required - appears in step 1
  panel: String,       // Required - appears in step 2
  ageGroup: String,    // Required - appears in step 3
  sex: String,         // Required - appears in step 4
  scenario: String,    // Optional but recommended - searchable
  description: String, // Optional - searchable
  symptoms: String,    // Optional - searchable
  recommendations: String, // Optional - displayed in results
  // ... any other fields you want to store
}
```

## ✅ Advantages of Dynamic Approach

1. **Automatic Updates**: Add new data to MongoDB → options appear instantly
2. **No Code Changes**: Never need to modify JavaScript when adding options
3. **Data-Driven**: Your database is the single source of truth
4. **Filtered Options**: Each step shows only relevant options based on previous selections
5. **Scalable**: Works with any size database

## 🎯 Example Scenarios

### Scenario 1: Adding a New Body Area

**Before:**
```javascript
// Database has only "Cardia"
Collection: [
  { bodyArea: "Cardia", panel: "Cardia", ... }
]
// Chatbot shows: [Cardia]
```

**After:**
```javascript
// Add new document with "Thorax"
db.scenarios.insertOne({
  bodyArea: "Thorax",
  panel: "Respiratory",
  ageGroup: "All (0-150)",
  sex: "All",
  scenario: "pneumonia",
  description: "...",
  symptoms: "...",
  recommendations: "..."
})

// Chatbot now shows: [Cardia, Thorax]
// No code changes needed!
```

### Scenario 2: Filtered Options

If your database has:
```javascript
[
  { bodyArea: "Cardia", panel: "Cardia", ... },
  { bodyArea: "Cardia", panel: "Neurological", ... },
  { bodyArea: "Thorax", panel: "Respiratory", ... }
]
```

**User Flow:**
1. User selects "Cardia" → Chatbot fetches panels for Cardia
2. Chatbot shows: [Cardia, Neurological] (only panels linked to Cardia)
3. User selects "Cardia" panel → continues...

This ensures users only see relevant options at each step!

## 🔧 API Endpoints

### GET /api/chat

**Query Parameters:**
- `type` (required): "bodyArea" | "panel" | "ageGroup" | "sex"
- `filters` (optional): JSON string with previous selections

**Example Requests:**

```javascript
// Get all body areas
fetch('/api/chat?type=bodyArea')

// Get panels for a specific body area
fetch('/api/chat?type=panel&filters={"bodyArea":"Cardia"}')

// Get age groups for body area and panel
fetch('/api/chat?type=ageGroup&filters={"bodyArea":"Cardia","panel":"Cardia"}')

// Get sex options for all previous selections
fetch('/api/chat?type=sex&filters={"bodyArea":"Cardia","panel":"Cardia","ageGroup":"All (0-150)"}')
```

**Response Format:**
```json
{
  "success": true,
  "options": ["Option1", "Option2", "Option3"]
}
```

### POST /api/chat

**Request Body:**
```json
{
  "scenario": "chest pain",
  "bodyArea": "Cardia",
  "panel": "Cardia",
  "ageGroup": "All (0-150)",
  "sex": "All"
}
```

**Response Format:**
```json
{
  "success": true,
  "count": 2,
  "results": [
    {
      "_id": "...",
      "bodyArea": "Cardia",
      "panel": "Cardia",
      "scenario": "chest pain",
      "description": "...",
      "symptoms": "...",
      "recommendations": "..."
    }
  ]
}
```

## 🚀 Testing the Integration

1. **Add Test Data** to your MongoDB collection:
```javascript
db.scenarios.insertMany([
  {
    bodyArea: "Cardia",
    panel: "Cardia",
    ageGroup: "All (0-150)",
    sex: "All",
    scenario: "chest pain",
    description: "Acute chest pain assessment",
    symptoms: "chest pain, shortness of breath",
    recommendations: "ECG, Chest X-ray"
  },
  {
    bodyArea: "Cardia",
    panel: "Neurological",
    ageGroup: "Adult (18-65)",
    sex: "Male",
    scenario: "stroke symptoms",
    description: "Acute stroke protocol",
    symptoms: "weakness, speech difficulty",
    recommendations: "Emergency CT scan"
  }
])
```

2. **Start the app**:
```bash
npm run dev
```

3. **Open the chatbot**: http://localhost:3000/chats

4. **Verify**:
   - Step 1 shows body areas from your database
   - Step 2 shows only panels linked to selected body area
   - Step 3 shows only age groups matching previous selections
   - Step 4 shows only sex options matching all selections
   - Step 5 searches and returns matching scenarios

## 🐛 Troubleshooting

### No options appear
- Check your `.env.local` has correct `MONGODB_URI`
- Verify database and collection names in `app/api/chat/route.js`
- Ensure documents have the required fields (bodyArea, panel, ageGroup, sex)
- Check browser console for API errors

### Options don't filter correctly
- Verify your data has consistent field values
- Check the filters are being passed correctly
- Look at API responses in Network tab of browser DevTools

### Database query errors
- Ensure MongoDB user has read permissions
- Check collection name matches exactly
- Verify connection string is correct

## 📝 Key Takeaways

✅ **No hardcoded options** - everything from database  
✅ **Automatic filtering** - each step shows relevant options  
✅ **Instant updates** - add data to MongoDB, see it immediately  
✅ **Scalable** - works with any amount of data  
✅ **Maintainable** - no code changes when adding options
