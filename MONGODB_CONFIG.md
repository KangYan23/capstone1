# MongoDB Configuration for Your Database

## ✅ Current Setup

Your MongoDB connection is configured and ready to use!

**Connection String:** `mongodb+srv://dltyx04_db_user:DvtVn9ExJQWDeEdx@cluster0.hjleolt.mongodb.net/`

## 📋 Configuration Details

### Database Connection
- **File:** `app/api/chat/route.js`
- **Configuration:** Uses default database from your MongoDB Atlas cluster
- **Code:** `const db = client.db();` (line 11 and line 75)

### Collection Name
**Important:** Update the collection name to match your actual MongoDB collection!

In `app/api/chat/route.js`, find this line (appears twice):
```javascript
const collection = db.collection('scenarios'); // Replace 'scenarios' with your actual collection name
```

Change `'scenarios'` to your actual collection name. For example:
```javascript
const collection = db.collection('medical_cases');  // If your collection is named 'medical_cases'
const collection = db.collection('referrals');      // If your collection is named 'referrals'
const collection = db.collection('examinations');   // If your collection is named 'examinations'
```

## 🔍 How to Find Your Collection Name

### Option 1: MongoDB Atlas Web Interface
1. Go to https://cloud.mongodb.com
2. Log in with your credentials
3. Click "Browse Collections"
4. You'll see your database name and collection name

### Option 2: MongoDB Compass
1. Open MongoDB Compass
2. Connect using your connection string
3. Browse to see your databases and collections

### Option 3: MongoDB Shell
```javascript
// Connect to your database
mongosh "mongodb+srv://dltyx04_db_user:DvtVn9ExJQWDeEdx@cluster0.hjleolt.mongodb.net/"

// Show databases
show dbs

// Use your database
use your_database_name

// Show collections
show collections
```

## 📊 Required Fields in Your Collection

Your MongoDB documents should have these fields:

```javascript
{
  bodyArea: "Cardia",           // Required - Step 1 options
  panel: "Cardia",              // Required - Step 2 options
  ageGroup: "All (0-150)",      // Required - Step 3 options
  sex: "All",                   // Required - Step 4 options
  scenario: "chest pain",       // Recommended - searchable
  description: "...",           // Optional - searchable & displayed
  symptoms: "...",              // Optional - searchable & displayed
  recommendations: "..."        // Optional - displayed
}
```

## ✏️ Update Steps

1. **Find your collection name** using one of the methods above
2. **Edit `app/api/chat/route.js`**:
   - Line 12: Change `'scenarios'` to your collection name
   - Line 76: Change `'scenarios'` to your collection name
3. **Save the file**
4. **Restart your dev server** if it's running

## 🚀 Test Connection

Run this command to test:
```bash
npm run dev
```

Then open http://localhost:3000/chats

If you see options appearing from your database, it's working! ✅

## 🐛 Troubleshooting

### Error: "Collection not found"
- Verify collection name matches exactly (case-sensitive)
- Check you have data in the collection

### Error: "Authentication failed"
- Your connection string is correct (already in `.env.local`)
- Make sure your IP is whitelisted in MongoDB Atlas

### No options showing up
- Verify your documents have the required fields (bodyArea, panel, ageGroup, sex)
- Check browser console for errors (F12 → Console tab)
- Check terminal for API errors

### Empty database
- Add sample documents with the required structure
- Ensure field names match exactly

## 📝 Example: Adding Test Data

You can add test data using MongoDB Compass or shell:

```javascript
db.your_collection_name.insertOne({
  bodyArea: "Cardia",
  panel: "Cardia",
  ageGroup: "All (0-150)",
  sex: "All",
  scenario: "chest pain",
  description: "Patient with acute chest pain",
  symptoms: "chest pain, shortness of breath, discomfort",
  recommendations: "ECG, Chest X-ray, Consider cardiac CT angiography"
})
```

## ✅ Checklist

- [x] `.env.local` file created with your MongoDB URI
- [ ] Collection name updated in `app/api/chat/route.js` (line 12 & 76)
- [ ] Database has documents with required fields
- [ ] Dev server running (`npm run dev`)
- [ ] Tested at http://localhost:3000/chats

Once you update the collection name, everything will work automatically! 🎉
