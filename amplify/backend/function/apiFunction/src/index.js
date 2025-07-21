const { spawn } = require('child_process');
const path = require('path');

exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Configuration CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    try {
        // Route vers le backend Python
        if (event.path === '/health') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ status: 'healthy', service: 'IA\'ctualités API' })
            };
        }
        
        if (event.path === '/query') {
            // Simuler une réponse pour test
            const body = JSON.parse(event.body || '{}');
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    response: `Test response for ${body.model}: ${body.prompt}`,
                    cost: 0.001,
                    tokens: 100
                })
            };
        }
        
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Route not found' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
}; 