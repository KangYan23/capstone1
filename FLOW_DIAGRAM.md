# Chatbot Conversation Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS CHAT PAGE                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 0: Welcome Message (with animation)                   │
│  "Hello, How Are You Today?"                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Body Area Selection                                │
│  Bot: "Please select the Body Area."                        │
│  Options: [Cardia]                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ User clicks "Cardia"
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Panel Selection                                    │
│  Bot: "Now, please select the Panel."                       │
│  Options: [Cardia] [Neurological]                           │
└────────────────────┬────────────────────────────────────────┘
                     │ User clicks panel
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Age Group Selection                                │
│  Bot: "Next, please choose the Age group."                  │
│  Options: [All (0-150)]                                     │
└────────────────────┬────────────────────────────────────────┘
                     │ User clicks age group
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Sex Selection                                      │
│  Bot: "Please select the Sex."                              │
│  Options: [All] [Female] [Male]                             │
└────────────────────┬────────────────────────────────────────┘
                     │ User clicks sex
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Scenario Input                                     │
│  Bot: "Please type the Scenario you are looking for"        │
│  User types: "chest pain"                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ User sends message
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  MongoDB Query Execution                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/chat                                        │  │
│  │ {                                                     │  │
│  │   bodyArea: "Cardia",                                │  │
│  │   panel: "Cardia",                                   │  │
│  │   ageGroup: "All (0-150)",                           │  │
│  │   sex: "All",                                        │  │
│  │   scenario: "chest pain"                             │  │
│  │ }                                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MongoDB Collection: scenarios                         │  │
│  │ Query: {                                              │  │
│  │   bodyArea: "Cardia",                                │  │
│  │   panel: "Cardia",                                   │  │
│  │   $or: [                                             │  │
│  │     { scenario: /chest pain/i },                     │  │
│  │     { description: /chest pain/i },                  │  │
│  │     { symptoms: /chest pain/i }                      │  │
│  │   ]                                                   │  │
│  │ }                                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Display Results                                    │
│  Bot shows:                                                 │
│  - Number of matching cases                                 │
│  - Case details (title, description, symptoms)              │
│  - Recommendations                                          │
│  - Option to restart or continue conversation               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │  User types "restart" │──────┐
         └───────────┬───────────┘      │
                     │                  │
         ┌───────────▼───────────┐      │
         │  Free Conversation     │      │
         │  (Step 6 continues)    │      │
         └────────────────────────┘      │
                                         │
         ┌───────────────────────────────┘
         │ Reset flow, go back to Step 1
         └────────────────────────────────►


## State Management

┌─────────────────────────────────────────────────────────────┐
│  React State Variables                                      │
├─────────────────────────────────────────────────────────────┤
│  • conversationStep (0-6)                                   │
│    - 0: Initial/Welcome                                     │
│    - 1: Body Area                                           │
│    - 2: Panel                                               │
│    - 3: Age Group                                           │
│    - 4: Sex                                                 │
│    - 5: Scenario Input                                      │
│    - 6: Free Conversation                                   │
│                                                             │
│  • userSelections {                                         │
│      bodyArea: string | null,                               │
│      panel: string | null,                                  │
│      ageGroup: string | null,                               │
│      sex: string | null,                                    │
│      scenario: string | null                                │
│    }                                                        │
│                                                             │
│  • messages: Array<Message>                                 │
│  • isLoading: boolean                                       │
└─────────────────────────────────────────────────────────────┘


## API Flow

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Chat Page      │────────►│  API Route      │────────►│  MongoDB        │
│  (Frontend)     │  POST   │  /api/chat      │  Query  │  Database       │
│                 │         │                 │         │                 │
│  - User input   │         │  - Build query  │         │  - scenarios    │
│  - Selections   │         │  - Execute      │         │    collection   │
│                 │◄────────│  - Format       │◄────────│                 │
│  - Display      │  JSON   │  - Return       │  Results│  - Documents    │
│    results      │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘


## Message Structure

┌─────────────────────────────────────────────────────────────┐
│  Message Object                                             │
├─────────────────────────────────────────────────────────────┤
│  {                                                          │
│    id: string,              // Unique timestamp-based ID    │
│    content: string,         // Message text                 │
│    role: 'user' | 'assistant',  // Sender role             │
│    timestamp: Date,         // When message was sent        │
│    options?: string[]       // Optional button choices      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘


## User Interaction Flow

User Action                 System Response
───────────────────────────────────────────────────────────────
1. Opens chat         →     Show welcome animation
                            Start conversation flow (Step 1)
                            
2. Clicks option      →     Add message to chat
                            Store selection
                            Show next step with options
                            
3. Types scenario     →     Add message to chat
                            Query MongoDB
                            Display loading animation
                            
4. Receives results   →     Format and display results
                            Offer restart or continue
                            
5. Types "restart"    →     Reset state
                            Return to Step 1
                            
6. New chat           →     Clear messages
                            Reset selections
                            Start flow automatically
```

## Key Functions

### `startConversationFlow()`
- Initializes the conversation
- Shows first prompt (Body Area selection)
- Sets conversationStep to 1

### `handleOptionSelect(option, step)`
- Processes button clicks
- Saves selection to userSelections
- Progresses to next step
- Displays appropriate prompt

### `handleSendMessage()`
- Handles text input (Step 5)
- Queries MongoDB API
- Displays results
- Handles "restart" command

### `createNewChat()`
- Creates new chat session
- Resets all state variables
- Automatically starts conversation flow
