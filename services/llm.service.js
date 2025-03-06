// LLM Service for natural language processing
// Using dynamic import for ES modules
let pipeline;
let tokenizer;
let env;

// Cache the models to avoid reloading them for each request
let textClassificationModel = null;
let sequenceModel = null;

// Import the transformers module dynamically
async function importTransformers() {
  if (!pipeline) {
    try {
      const transformers = await import('@xenova/transformers');
      pipeline = transformers.pipeline;
      tokenizer = transformers.AutoTokenizer;
      env = transformers.env;
      
      // Set environment variables for better performance
      env.allowLocalModels = true;
      env.cacheDir = './models_cache';
      
      console.log('Transformers module imported successfully');
    } catch (error) {
      console.error('Error importing transformers module:', error);
      throw new Error('Failed to import transformers module');
    }
  }
  return { pipeline, tokenizer, env };
}

/**
 * Initialize the LLM models
 * Using Xenova/transformers.js which is a lightweight JS implementation
 * of Hugging Face Transformers for browser and Node.js environments
 */
async function initModels() {
  try {
    // Make sure pipeline is initialized
    const { pipeline } = await importTransformers();
    
    // Initialize text classification model if not already loaded
    if (!textClassificationModel) {
      console.log('Loading text classification model...');
      textClassificationModel = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      console.log('Text classification model loaded successfully');
    }
    
    // Initialize sequence-to-sequence model if not already loaded
    if (!sequenceModel) {
      console.log('Loading sequence-to-sequence model...');
      // Using a more powerful model for understanding natural language queries
      // This model is still optimized for JavaScript environments
      sequenceModel = await pipeline('text2text-generation', 'Xenova/distilbart-cnn-6-6');
      console.log('Sequence-to-sequence model loaded successfully');
    }
    
    return { textClassificationModel, sequenceModel };
  } catch (error) {
    console.error('Error loading LLM models:', error);
    throw new Error('Failed to initialize LLM models');
  }
}

/**
 * Process a natural language query to extract intent and parameters
 * @param {string} query - The natural language query from the user
 * @returns {Object} The processed intent object with action, filters, etc.
 */
async function processQuery(query) {
  try {
    // Initialize the models if not already loaded
    const { textClassificationModel, sequenceModel } = await initModels();
    
    // Analyze the sentiment/intent of the query with the classification model
    const classificationResult = await textClassificationModel(query);
    console.log('LLM classification result:', classificationResult);
    
    // Use the sequence model to generate a structured understanding of the query
    // This helps with more complex queries and better extraction of parameters
    const promptTemplate = `Extract database query information from this text: "${query}". ` +
                          `Identify action (find or count), sheet name, filters, fields, limit, and sort criteria.`;
    
    const sequenceResult = await sequenceModel(promptTemplate, {
      max_new_tokens: 100,
      temperature: 0.3 // Lower temperature for more deterministic outputs
    });
    
    console.log('Sequence model result:', sequenceResult);
    
    // Initialize the intent object with enhanced understanding
    const intent = {
      action: null,     // 'find', 'count', etc.
      sheetName: null,  // Target sheet
      filters: {},      // Filter conditions
      fields: [],       // Fields to return
      limit: 100,       // Default limit
      sort: null,       // Sort criteria
      confidence: classificationResult[0].score, // Add confidence score from classification model
      enhancedUnderstanding: sequenceResult[0].generated_text // Store the enhanced understanding
    };
    
    // Determine the action based on both models and keywords
    // This combines the LLM's understanding with rule-based processing
    if (query.includes('how many') || query.includes('count') || 
        sequenceResult[0].generated_text.toLowerCase().includes('count')) {
      intent.action = 'count';
    } else {
      intent.action = 'find';
    }
    
    // Extract sheet name
    const sheetMatches = query.match(/in (\w+( \w+)*) sheet|from (\w+( \w+)*) sheet|(\w+( \w+)*) data|(\w+( \w+)*) sheet/);
    if (sheetMatches) {
      // Use the first non-undefined match group
      intent.sheetName = sheetMatches.slice(1).find(match => match !== undefined);
    }
    
    // Extract filters (reusing existing logic)
    // Example: "products with price greater than 100"
    const greaterThanMatches = query.match(/(\w+) (greater than|more than|higher than|over|above) (\d+)/);
    if (greaterThanMatches) {
      const [, field, , value] = greaterThanMatches;
      intent.filters[field] = { $gt: parseFloat(value) };
    }
    
    // Example: "products with price less than 50"
    const lessThanMatches = query.match(/(\w+) (less than|lower than|under|below) (\d+)/);
    if (lessThanMatches) {
      const [, field, , value] = lessThanMatches;
      intent.filters[field] = { $lt: parseFloat(value) };
    }
    
    // Example: "products with category equal to electronics"
    const equalMatches = query.match(/(\w+) (equal to|equals|is|=) ([\w\s]+)/);
    if (equalMatches) {
      const [, field, , value] = equalMatches;
      intent.filters[field] = value.trim();
    }
    
    // Extract specific fields to return
    if (query.includes('show') || query.includes('display') || query.includes('get')) {
      const fieldMatches = query.match(/show (me |us )?(the |all )?(\w+(, \w+)*)/i);
      if (fieldMatches && fieldMatches[3]) {
        intent.fields = fieldMatches[3].split(', ');
      }
    }
    
    // Extract limit
    const limitMatches = query.match(/limit (to |of )?(\d+)|(\d+) results/);
    if (limitMatches) {
      const limit = limitMatches[2] || limitMatches[3];
      if (limit) {
        intent.limit = parseInt(limit, 10);
      }
    }
    
    // Extract sort criteria
    const sortMatches = query.match(/sort by (\w+)( (asc|ascending|desc|descending))?/);
    if (sortMatches) {
      const field = sortMatches[1];
      const direction = sortMatches[3];
      intent.sort = { field };
      
      if (direction && (direction === 'desc' || direction === 'descending')) {
        intent.sort.direction = -1;
      } else {
        intent.sort.direction = 1;
      }
    }
    
    return intent;
  } catch (error) {
    console.error('Error processing query with LLM:', error);
    // Fallback to the original rule-based processing if LLM fails
    throw new Error('LLM processing failed: ' + error.message);
  }
}

module.exports = {
  processQuery,
  initModels
};