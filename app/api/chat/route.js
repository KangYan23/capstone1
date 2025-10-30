import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb.js';

// GET endpoint to fetch available options from database
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'bodyArea', 'panel', 'ageGroup', 'sex'
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    console.log('🔍 API GET Request:', { type, filters });

    const client = await clientPromise;
    const db = client.db(); // Uses default database from connection string
    const collection = db.collection('imaging_recommendation'); // Your actual collection name
    
    // Log database and collection info
    console.log('📊 Database:', db.databaseName);
    console.log('📦 Collection:', collection.collectionName);
    
    // Check if collection exists and has documents
    const docCount = await collection.countDocuments();
    console.log('📄 Document count:', docCount);
    
    if (docCount === 0) {
      console.warn('⚠️ Collection is empty! No documents found.');
      return NextResponse.json({
        success: true,
        options: [],
        warning: 'Collection is empty. Please add documents to your database.'
      });
    }

    let result = [];

    // Map the incoming "type" and filter keys to the actual DB field names
    switch(type) {
      case 'bodyArea':
        // Get distinct body areas (DB field: body_area)
        result = await collection.distinct('body_area');
        break;

      case 'panel':
        // Get distinct panels filtered by body_area if provided
        // incoming filter uses bodyArea (frontend), map to body_area
        const panelQuery = filters.bodyArea ? { body_area: filters.bodyArea } : {};
        result = await collection.distinct('panel', panelQuery);
        break;

      case 'ageGroup':
        // Get distinct age values (DB field: age) filtered by previous selections
        const ageQuery = {};
        if (filters.bodyArea) ageQuery.body_area = filters.bodyArea;
        if (filters.panel) ageQuery.panel = filters.panel;
        result = await collection.distinct('age', ageQuery);
        break;

      case 'sex':
        // Get distinct sex options filtered by previous selections
        const sexQuery = {};
        if (filters.bodyArea) sexQuery.body_area = filters.bodyArea;
        if (filters.panel) sexQuery.panel = filters.panel;
        if (filters.ageGroup) sexQuery.age = filters.ageGroup;
        result = await collection.distinct('sex', sexQuery);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    console.log(`✅ Fetched ${result.length} ${type} options:`, result);

    return NextResponse.json({
      success: true,
      options: result.filter(Boolean) // Remove null/undefined values
    });

  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint to search scenarios
export async function POST(request) {
  try {
    const { scenario, bodyArea, panel, ageGroup, sex, scenarioId } = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('imaging_recommendation');

    // If scenarioId is provided, return detailed procedures for that scenario
    if (scenarioId) {
      const scenarioDoc = await collection.findOne({ scenario_id: scenarioId });
      
      if (!scenarioDoc) {
        return NextResponse.json({
          success: false,
          error: 'Scenario not found'
        }, { status: 404 });
      }

      // Filter procedures to only include 'Usually appropriate' or 'May be appropriate'
      
      // 1. Log the total number of unfiltered procedures
      console.log('🔍 All procedures (unfiltered):', scenarioDoc.procedures?.length);
      
      // 2. Temporarily use a relaxed filter for debugging purposes
      const filteredProcedures = scenarioDoc.procedures?.filter(proc => {
        const category = proc.appropriateness_category;
        
        // 3. Log the raw category string for every procedure for inspection!
        console.log(`📝 Checking raw category string: '${category}' (type: ${typeof category})`);
        
        // Check if the string exists
        if (!category) {
          console.log('⚠️ Category is null/undefined');
          return false;
        }
        
        // Normalize: trim whitespace and convert to lowercase for comparison
        const normalizedCategory = category.trim().toLowerCase();
        console.log(`✨ Normalized category: '${normalizedCategory}'`);
        
        // Use includes() to check if it matches either approved category (more forgiving)
        const isUsuallyAppropriate = normalizedCategory.includes('usually appropriate');
        const isMayBeAppropriate = normalizedCategory.includes('may be appropriate');
        
        console.log(`   ✓ Usually appropriate? ${isUsuallyAppropriate}`);
        console.log(`   ✓ May be appropriate? ${isMayBeAppropriate}`);
        
        return isUsuallyAppropriate || isMayBeAppropriate;
      }) || [];
      
      // 4. Log the final filtered count
      console.log('✅ Filtered procedures (with relaxed filter):', filteredProcedures.length);
      console.log('📋 Filtered procedure names:', filteredProcedures.map(p => p.procedure_name));

      return NextResponse.json({
        success: true,
        scenario: {
          scenario_id: scenarioDoc.scenario_id,
          scenario_description: scenarioDoc.scenario_description,
          panel: scenarioDoc.panel,
          body_area: scenarioDoc.body_area,
          age: scenarioDoc.age,
          sex: scenarioDoc.sex
        },
        procedures: filteredProcedures,
        count: filteredProcedures.length
      });
    }

    // Otherwise, search for matching scenarios (Step 1: return scenario list)
    const query = {};

    // Map frontend keys to DB field names
    if (bodyArea && bodyArea !== 'All') {
      query.body_area = bodyArea;
    }

    if (panel && panel !== 'All') {
      query.panel = panel;
    }

    if (sex && sex !== 'All') {
      query.sex = { $in: [sex, 'All'] };
    }

    // Age filtering uses DB field 'age'
    if (ageGroup && ageGroup !== 'All (0-150)') {
      query.age = ageGroup;
    }

    // Search for scenario: our DB stores the human-readable text in 'scenario_description'
    if (scenario) {
      const regex = { $regex: scenario, $options: 'i' };
      query.$or = [
        { scenario_description: regex },
        { 'procedures.procedure_name': regex }
      ];
    }

    // Query the database - return only scenario_id and scenario_description for selection
    const results = await collection
      .find(query, { 
        projection: { 
          scenario_id: 1, 
          scenario_description: 1,
          _id: 0 
        } 
      })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      message: results.length > 0 ? 'Please select a scenario number to view appropriate procedures.' : 'No matching scenarios found.'
    });

  } catch (error) {
    console.error('POST API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
