import json
import os
import boto3
from mangum import Mangum
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import openai
import anthropic
import requests

# Configuration FastAPI
app = FastAPI(title="IActualities Comparator API", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez vos domaines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class QueryRequest(BaseModel):
    question: str
    model: str

class QueryResponse(BaseModel):
    response: str
    model: str
    cost: Optional[float] = None
    tokens_used: Optional[int] = None

# Configuration des clients
def get_openai_client():
    """Configure le client OpenAI/Azure"""
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    
    if not api_key or not endpoint:
        raise HTTPException(status_code=500, detail="Configuration Azure OpenAI manquante")
    
    return openai.AzureOpenAI(
        api_key=api_key,
        api_version="2024-02-15-preview",
        azure_endpoint=endpoint
    )

def get_anthropic_client():
    """Configure le client Anthropic"""
    api_key = os.getenv('ANTHROPIC_API_KEY')
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Configuration Anthropic manquante")
    
    return anthropic.Anthropic(api_key=api_key)

def get_bedrock_client():
    """Configure le client AWS Bedrock"""
    try:
        return boto3.client(
            'bedrock-runtime',
            region_name='eu-west-3',
            aws_access_key_id=os.getenv('CUSTOM_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('CUSTOM_AWS_SECRET_ACCESS_KEY')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur configuration Bedrock: {str(e)}")

# Fonctions de requête par modèle
async def query_azure_openai(question: str) -> Dict[str, Any]:
    """Interroge Azure OpenAI (GPT-4o)"""
    try:
        client = get_openai_client()
        deployment_name = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o')
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "Vous êtes un assistant IA spécialisé dans l'analyse d'actualités. Répondez de manière claire et concise."},
                {"role": "user", "content": question}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return {
            "response": response.choices[0].message.content,
            "cost": 0.0,  # À calculer selon votre tarification
            "tokens_used": response.usage.total_tokens
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Azure OpenAI: {str(e)}")

async def query_anthropic(question: str) -> Dict[str, Any]:
    """Interroge Anthropic (Claude 3 Haiku)"""
    try:
        client = get_anthropic_client()
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": question}
            ]
        )
        
        return {
            "response": response.content[0].text,
            "cost": 0.0,  # À calculer selon votre tarification
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Anthropic: {str(e)}")

async def query_bedrock(question: str) -> Dict[str, Any]:
    """Interroge AWS Bedrock (Mixtral)"""
    try:
        client = get_bedrock_client()
        
        prompt = f"""<s>[INST] {question} [/INST]"""
        
        response = client.invoke_model(
            modelId="mistral.mixtral-8x7b-instruct-v0:1",
            body=json.dumps({
                "prompt": prompt,
                "max_tokens": 1000,
                "temperature": 0.7
            })
        )
        
        response_body = json.loads(response['body'].read())
        
        return {
            "response": response_body['completions'][0]['text'],
            "cost": 0.0,  # À calculer selon votre tarification
            "tokens_used": 0  # Bedrock ne retourne pas toujours les tokens
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Bedrock: {str(e)}")

# Routes API
@app.get("/health")
async def health_check():
    """Point de terminaison de santé"""
    return {"status": "healthy", "message": "API IActualities Comparator opérationnelle"}

@app.post("/query", response_model=QueryResponse)
async def query_ai(request: QueryRequest):
    """Interroge un modèle d'IA spécifique"""
    try:
        if request.model == "GPT-4o (Azure)":
            result = await query_azure_openai(request.question)
        elif request.model == "Claude 3 Haiku":
            result = await query_anthropic(request.question)
        elif request.model == "Mixtral 8x7B Instruct":
            result = await query_bedrock(request.question)
        else:
            raise HTTPException(status_code=400, detail=f"Modèle non supporté: {request.model}")
        
        return QueryResponse(
            response=result["response"],
            model=request.model,
            cost=result.get("cost"),
            tokens_used=result.get("tokens_used")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur inattendue pour {request.model}: {str(e)}")

@app.get("/models")
async def get_available_models():
    """Retourne la liste des modèles disponibles"""
    return {
        "models": [
            {
                "id": "GPT-4o (Azure)",
                "name": "GPT-4o (Azure)",
                "provider": "OpenAI/Azure",
                "description": "Modèle GPT-4o via Azure OpenAI"
            },
            {
                "id": "Claude 3 Haiku",
                "name": "Claude 3 Haiku",
                "provider": "Anthropic",
                "description": "Modèle Claude 3 Haiku rapide et efficace"
            },
            {
                "id": "Mixtral 8x7B Instruct",
                "name": "Mixtral 8x7B Instruct",
                "provider": "AWS Bedrock",
                "description": "Modèle Mixtral 8x7B via AWS Bedrock"
            }
        ]
    }

# Handler Lambda
def lambda_handler(event, context):
    """Handler principal pour AWS Lambda"""
    asgi_handler = Mangum(app, lifespan="off")
    return asgi_handler(event, context)

# Pour le développement local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 