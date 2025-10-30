# Quick Start Guide - Dynamic Chatbot

## ✅ What Changed

- ❌ **Removed**: Hardcoded sample data (`sample_scenarios.json`)
- ✅ **Added**: Dynamic option fetching from YOUR MongoDB database
- ✅ **Enhanced**: API now has GET endpoints for fetching options
- ✅ **Improved**: Options are filtered based on previous selections

## 🚀 Quick Setup (3 Steps)

### 1. Add MongoDB Connection String

Create `.env.local` in your project root:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database_name?retryWrites=true&w=majority
```

### 2. Update Database Configuration

Edit `app/api/chat/route.js` (lines 9-10):

```javascript
const db = client.db('your_database_name');        // Replace with your actual database name
const collection = db.collection('scenarios');      // Replace with your actual collection name
```

### 3. Ensure Your Database Has Required Fields

Your MongoDB documents MUST have these fields:

```javascript
{
  bodyArea: "Cardia",           // Required
  panel: "Cardia",              // Required
  ageGroup: "All (0-150)",      // Required
  sex: "All",                   // Required
  scenario: "chest pain",       // Recommended (searchable)
  description: "...",           // Optional (searchable)
  symptoms: "...",              // Optional (searchable)
  recommendations: "..."        // Optional (displayed in results)
}
```

## ▶️ Run the App

```bash
npm run dev
```

Visit: http://localhost:3000/chats

## 🎯 How It Works

The chatbot automatically:

1. **Fetches Body Areas** from your database → Shows as buttons
2. **Fetches Panels** filtered by selected body area → Shows as buttons
3. **Fetches Age Groups** filtered by body area + panel → Shows as buttons
4. **Fetches Sex Options** filtered by all previous selections → Shows as buttons
5. **Searches Scenarios** matching all criteria and user's typed scenario

## 📊 Example Database Structure

```javascript
// Example documents in your MongoDB collection:
[
  {
    bodyArea: "Cardia",
    panel: "Cardia",
    ageGroup: "All (0-150)",
    sex: "All",
    scenario: "chest pain",
    description: "Patient with acute chest pain",
    symptoms: "chest pain, shortness of breath",
    recommendations: "ECG, Chest X-ray, Consider CT angiography"
  },
  {
    bodyArea: "Cardia",
    panel: "Neurological",
    ageGroup: "Adult (18-65)",
    sex: "Male",
    scenario: "stroke symptoms",
    description: "Patient showing stroke signs",
    symptoms: "weakness, speech difficulty, facial droop",
    recommendations: "Emergency CT scan, MRI brain"
  },
  {
    bodyArea: "Thorax",
    panel: "Respiratory",
    ageGroup: "All (0-150)",
    sex: "All",
    scenario: "pneumonia",
    description: "Suspected pneumonia case",
    symptoms: "cough, fever, difficulty breathing",
    recommendations: "Chest X-ray, Consider CT chest"
  }
]
```

## 🔍 Testing

1. Open http://localhost:3000/chats
2. Click "New Chat"
3. You should see options from YOUR database:
   - Step 1: Body areas from your data
   - Step 2: Panels linked to selected body area
   - Step 3: Age groups
   - Step 4: Sex options
   - Step 5: Type a scenario to search

## 💡 Key Benefits

✅ **Fully Dynamic** - Add data to MongoDB, options appear automatically  
✅ **Smart Filtering** - Each step shows only relevant options  
✅ **No Code Changes** - Never update JavaScript when adding options  
✅ **Scalable** - Works with any size database  
✅ **Real-time** - Changes in database reflect immediately

## 📚 Documentation Files

- **CHATBOT_SETUP.md** - Complete setup and configuration guide
- **DYNAMIC_INTEGRATION.md** - Detailed API and integration documentation
- **FLOW_DIAGRAM.md** - Visual flow diagrams and architecture
- **This file** - Quick start reference

## 🐛 Common Issues

### "No options appearing"
- Check `.env.local` has correct MongoDB URI
- Verify database/collection names in `app/api/chat/route.js`
- Ensure your documents have required fields

### "Connection error"
- Whitelist your IP in MongoDB Atlas
- Verify credentials in connection string

### "Empty results"
- Make sure you have data in your collection
- Check field names match exactly (case-sensitive)

## 📞 Next Steps

1. ✅ Add your MongoDB connection string to `.env.local`
2. ✅ Update database/collection names in API route
3. ✅ Ensure your database has the required field structure
4. ✅ Run `npm run dev` and test!

Your chatbot will now pull ALL options directly from your MongoDB database! 🎉
