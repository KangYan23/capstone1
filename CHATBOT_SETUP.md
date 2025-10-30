# Smart Referral System - Structured Chatbot Flow

This chatbot implementation guides doctors through a structured conversation flow to find relevant radiological examination cases from MongoDB.

## 🎯 Conversation Flow

The chatbot follows this structured flow, **dynamically fetching all options from your MongoDB database**:

1. **Body Area Selection** → Fetches distinct body areas from your database
2. **Panel Selection** → Fetches panels filtered by selected body area
3. **Age Group Selection** → Fetches age groups filtered by body area and panel
4. **Sex Selection** → Fetches sex options filtered by all previous selections
5. **Scenario Input** → User types scenario (e.g., "chest pain", "shortness of breath")
6. **Database Search** → Queries MongoDB and displays matching results
7. **Free Conversation** → User can ask follow-up questions or type "restart" to begin again

**Note:** All options (Body Area, Panel, Age Group, Sex) are fetched dynamically from your MongoDB collection, so they will automatically reflect whatever data you have in your database.

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

The `mongodb` package has already been installed.

### 2. Configure MongoDB Connection

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your_database_name?retryWrites=true&w=majority
   ```

### 3. Update Database Configuration

In `app/api/chat/route.js`, update the following lines with your actual database and collection names:

```javascript
const db = client.db('your_database_name'); // Replace with your database name
const collection = db.collection('scenarios'); // Replace with your collection name
```

### 4. MongoDB Schema

Your MongoDB collection should have documents with this structure. The chatbot will automatically use the unique values from these fields:

```json
{
  "bodyArea": "Cardia",           // Will appear as option in step 1
  "panel": "Cardia",              // Will appear as option in step 2
  "ageGroup": "All (0-150)",      // Will appear as option in step 3
  "sex": "All",                   // Will appear as option in step 4
  "scenario": "chest pain",       // Searchable field
  "description": "Detailed description of the case",  // Searchable field
  "symptoms": "List of symptoms",                     // Searchable field
  "recommendations": "Recommended imaging procedures"
}
```

**Important:** The chatbot dynamically fetches all unique values from your database for each field, so you don't need to update any code when you add new body areas, panels, age groups, or sex options to your database.

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/chats](http://localhost:3000/chats) to use the chatbot.

## 📁 Files Created/Modified

### New Files:
- `lib/mongodb.js` - MongoDB connection utility
- `app/api/chat/route.js` - API endpoints for fetching options (GET) and searching scenarios (POST)
- `.env.local.example` - Environment variable template

### Modified Files:
- `app/chats/page.js` - Updated with structured conversation flow and dynamic option fetching

## 🔧 Key Features

### Conversation State Management
- Tracks current step in the conversation (0-6)
- Stores user selections (bodyArea, panel, ageGroup, sex, scenario)
- Automatically progresses through the flow

### Dynamic Option Fetching
- **GET /api/chat?type=bodyArea** - Fetches all unique body areas from database
- **GET /api/chat?type=panel&filters={bodyArea}** - Fetches panels filtered by body area
- **GET /api/chat?type=ageGroup&filters={bodyArea,panel}** - Fetches age groups
- **GET /api/chat?type=sex&filters={bodyArea,panel,ageGroup}** - Fetches sex options
- Options automatically update when you add/modify data in MongoDB

### Interactive Option Buttons
- Displays clickable buttons for database-fetched choices
- Clean UI for easier selection
- Automatically moves to next step after selection

### MongoDB Integration
- Queries database based on all selected criteria
- Supports text search on scenario, description, and symptoms fields
- Returns up to 10 matching results
- Handles errors gracefully
- **No hardcoded values** - everything comes from your database

### Restart Functionality
- Users can type "restart" at any time to begin a new search
- Resets all selections and conversation state
- Creates a clean slate for a new query

## 🎨 Customization

### How Dynamic Options Work

The system automatically fetches options from your MongoDB database:

1. **Body Area (Step 1)**: Fetches all distinct `bodyArea` values
2. **Panel (Step 2)**: Fetches distinct `panel` values where `bodyArea` matches user's selection
3. **Age Group (Step 3)**: Fetches distinct `ageGroup` values filtered by body area and panel
4. **Sex (Step 4)**: Fetches distinct `sex` values filtered by all previous selections

**You don't need to modify any code** - just add data to your MongoDB collection with the appropriate fields, and the options will automatically appear in the chatbot!

### Example: Adding New Options

To add a new body area called "Thorax":

```json
// Just add documents to MongoDB with bodyArea: "Thorax"
{
  "bodyArea": "Thorax",
  "panel": "Respiratory",
  "ageGroup": "Adult (18-65)",
  "sex": "All",
  "scenario": "pneumonia",
  "description": "...",
  "symptoms": "...",
  "recommendations": "..."
}
```

The chatbot will automatically show "Thorax" as an option in Step 1!

### Modifying Query Logic

The database query is built in `app/api/chat/route.js`. Customize the query structure to match your database schema:

```javascript
const query = {};

if (bodyArea && bodyArea !== 'All') {
  query.bodyArea = bodyArea;
}

// Add custom query logic here
```

### Adjusting Response Format

Modify the response formatting in `handleSendMessage` function:

```javascript
data.results.forEach((result, index) => {
  responseContent += `**${index + 1}. ${result.scenario}**\n`;
  // Customize response format here
});
```

## 🐛 Troubleshooting

### Connection Issues
- Verify your MongoDB connection string in `.env.local`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database and collection names are correct

### No Results Found
- Verify your data structure matches the expected schema
- Check query criteria in the API route
- Use MongoDB Compass to test queries directly

### Flow Not Starting
- Clear browser cache and reload
- Check browser console for errors
- Verify all state variables are initialized correctly

## 📝 Notes

- The chatbot automatically starts the conversation flow when a new chat is created
- Welcome animation is hidden after the first message
- All chat sessions are stored in local state (not persisted)
- Database queries are performed on step 5 (scenario input)
- Type "restart" at any time to reset the conversation

## 🔒 Security

- Never commit `.env.local` to version control
- Use environment variables for sensitive data
- Implement proper authentication before production deployment
- Add rate limiting to the API endpoint
- Validate and sanitize user inputs
