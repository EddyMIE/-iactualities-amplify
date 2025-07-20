const { spawn } = require('child_process');
const path = require('path');

exports.handler = async (event, context) => {
    // Configuration pour servir FastAPI via Lambda
    const pythonPath = path.join(__dirname, 'python');
    const appPath = path.join(__dirname, 'backend_main.py');
    
    // Variables d'environnement pour Azure OpenAI
    const env = {
        ...process.env,
        PYTHONPATH: pythonPath,
        AWS_REGION: process.env.AWS_REGION || 'eu-west-3'
    };
    
    // Démarrer le serveur FastAPI
    const pythonProcess = spawn('python', [appPath], {
        env: env,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return new Promise((resolve, reject) => {
        let output = '';
        let error = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve({
                    statusCode: 200,
                    body: output,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                    }
                });
            } else {
                reject({
                    statusCode: 500,
                    body: JSON.stringify({ error: error }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        });
    });
}; 