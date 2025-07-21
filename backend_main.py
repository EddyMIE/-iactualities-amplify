#!/usr/bin/env python3
"""
Backend IA'ctualités avec vraies API (AWS Bedrock + Azure OpenAI)
Version adaptée pour l'interface React moderne
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
from pydantic import BaseModel
import json
import time
from openai import AzureOpenAI

load_dotenv()

app = FastAPI(title="IA'ctualités Real Backend", version="1.0.0")

# Configuration CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration des modèles AWS Bedrock
BEDROCK_MODELS = {
    "Mixtral 8x7B Instruct": "mistral.mixtral-8x7b-instruct-v0:1",
    "Claude 3 Sonnet": "eu.anthropic.claude-3-sonnet-20240229-v1:0", 
    "Claude 3 Haiku": "eu.anthropic.claude-3-haiku-20240307-v1:0",
    "Claude 3.7 Sonnet": "eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "Pixtral Large": "eu.mistral.pixtral-large-2502-v1:0"
}

# Configuration des modèles avec capacités internet
INTERNET_ENABLED_MODELS = {
    "Claude 3.7 Sonnet": True,
    "Claude 3 Sonnet": False,
    "Claude 3 Haiku": False,
    "Mixtral 8x7B Instruct": False,
    "Pixtral Large": False
}

# Configuration Azure OpenAI avec vos déploiements
AZURE_MODELS = {
    "GPT-4o (Azure)": {
        "deployment": "Eddy-deploy-20-02-2025-gpt-4o",
        "api_version": "2025-01-01-preview",
        "api_key_var": "GPT4O_API_KEY",
        "endpoint_var": "GPT4O_ENDPOINT"
    },
    "GPT-4o Mini (Azure)": {
        "deployment": "Eddy-02-2025-gpt-4o-mini", 
        "api_version": "2024-12-01-preview",
        "api_key_var": "GPT4O_MINI_API_KEY",
        "endpoint_var": "GPT4O_MINI_ENDPOINT"
    }
}

# Coûts par modèle (USD par 1000 tokens)
MODEL_COSTS = {
    "Mixtral 8x7B Instruct": {"input": 0.0007, "output": 0.0007},
    "Claude 3 Sonnet": {"input": 0.003, "output": 0.015},
    "Claude 3 Haiku": {"input": 0.00025, "output": 0.00125},
    "Claude 3.7 Sonnet": {"input": 0.003, "output": 0.015},
    "Pixtral Large": {"input": 0.002, "output": 0.006},
    "GPT-4o (Azure)": {"input": 0.005, "output": 0.015},
    "GPT-4o Mini (Azure)": {"input": 0.00015, "output": 0.0006}
}

class QueryRequest(BaseModel):
    model: str
    prompt: str

class QueryResponse(BaseModel):
    response: str
    tokens: int
    cost: float

def get_bedrock_client():
    """Initialise le client AWS Bedrock"""
    return boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("CUSTOM_AWS_REGION", "eu-west-3"),
        aws_access_key_id=os.getenv("CUSTOM_AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("CUSTOM_AWS_SECRET_ACCESS_KEY")
    )

def get_azure_client(model_name: str):
    """Initialise le client Azure OpenAI pour un modèle spécifique"""
    model_config = AZURE_MODELS[model_name]
    return AzureOpenAI(
        api_key=os.getenv(model_config["api_key_var"]),
        api_version=model_config["api_version"],
        azure_endpoint=os.getenv(model_config["endpoint_var"])
    )

def estimate_tokens(text: str) -> int:
    """Estimation approximative du nombre de tokens"""
    return max(1, len(text.split()) * 1.3)

def calculate_cost(model_name: str, input_text: str, output_text: str) -> float:
    """Calcule le coût basé sur les tokens d'entrée et sortie"""
    if model_name not in MODEL_COSTS:
        return 0.0
    
    input_tokens = estimate_tokens(input_text)
    output_tokens = estimate_tokens(output_text)
    
    costs = MODEL_COSTS[model_name]
    total_cost = (input_tokens * costs["input"] / 1000) + (output_tokens * costs["output"] / 1000)
    
    return round(total_cost, 6)

def query_bedrock_model(model_name: str, prompt: str) -> dict:
    """Interroge un modèle AWS Bedrock"""
    try:
        bedrock = get_bedrock_client()
        model_id = BEDROCK_MODELS[model_name]
        
        # Instructions optimisées avec formatage structuré
        prompt_with_instruction = f"""Tu es un assistant IA spécialisé en conseil et gestion de projet.

Question : {prompt}

Instructions :
- Réponds de manière professionnelle et structurée
- Utilise des titres et sous-titres pour organiser ta réponse (## Titre principal, ### Sous-titre)
- Utilise des listes à puces (- ou *) pour les étapes, avantages, inconvénients
- Utilise des listes numérotées (1. 2. 3.) pour les processus séquentiels
- Mets en gras les points importants avec **texte**
- Utilise des exemples concrets quand c'est pertinent
- Sois précis et pratique dans tes conseils
- Limite ta réponse à 500 mots maximum

Réponse :"""
        
        # Construction du body selon le modèle
        if model_id.startswith("eu.anthropic.claude-3"):
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0.3,
                "messages": [
                    {"role": "user", "content": [{"type": "text", "text": prompt_with_instruction}]}
                ]
            })
        elif model_id.startswith("mistral.") or model_id.startswith("eu.mistral."):
            body = json.dumps({
                "prompt": f"<s>[INST] {prompt_with_instruction} [/INST]",
                "max_tokens": 1000,
                "temperature": 0.3
            })
        else:
            raise HTTPException(status_code=400, detail=f"Modèle non supporté : {model_id}")
        
        # Appel à l'API
        response = bedrock.invoke_model(
            modelId=model_id,
            body=body,
            accept="application/json",
            contentType="application/json"
        )
        
        raw_response = response["body"].read().decode("utf-8")
        
        # Extraction de la réponse
        try:
            response_data = json.loads(raw_response)
            if model_id.startswith("eu.anthropic.claude-3"):
                if "content" in response_data and isinstance(response_data["content"], list):
                    text = "".join([c.get("text", "") for c in response_data["content"]])
                else:
                    text = raw_response
            elif model_id.startswith("mistral.") or model_id.startswith("eu.mistral."):
                if "outputs" in response_data:
                    text = response_data["outputs"][0]["text"]
                elif "choices" in response_data and len(response_data["choices"]) > 0:
                    text = response_data["choices"][0]["message"]["content"]
                else:
                    text = raw_response
            else:
                text = raw_response
        except json.JSONDecodeError:
            text = raw_response
        
        # Calcul des métriques
        tokens = estimate_tokens(prompt) + estimate_tokens(text)
        cost = calculate_cost(model_name, prompt, text)
        
        return {
            "response": text.strip(),
            "tokens": int(tokens),
            "cost": cost
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Bedrock pour {model_name}: {str(e)}")

def query_azure_model(model_name: str, prompt: str) -> dict:
    """Interroge un modèle Azure OpenAI"""
    try:
        client = get_azure_client(model_name)
        model_config = AZURE_MODELS[model_name]
        deployment_name = model_config["deployment"]
        
        # Message système avec formatage structuré
        system_message = """Tu es un assistant IA spécialisé en conseil et gestion de projet.

Instructions :
- Réponds de manière professionnelle et structurée
- Utilise des titres et sous-titres pour organiser ta réponse (## Titre principal, ### Sous-titre)
- Utilise des listes à puces (- ou *) pour les étapes, avantages, inconvénients
- Utilise des listes numérotées (1. 2. 3.) pour les processus séquentiels
- Mets en gras les points importants avec **texte**
- Utilise des exemples concrets quand c'est pertinent
- Sois précis et pratique dans tes conseils
- Limite ta réponse à 500 mots maximum"""
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        text = response.choices[0].message.content or ""
        
        # Calcul des métriques
        tokens = estimate_tokens(prompt) + estimate_tokens(text)
        cost = calculate_cost(model_name, prompt, text)
        
        return {
            "response": text.strip(),
            "tokens": int(tokens), 
            "cost": cost
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Azure pour {model_name}: {str(e)}")

def analyze_prompt_type(prompt: str) -> str:
    """Analyse le type de prompt pour appliquer les bonnes techniques"""
    prompt_lower = prompt.lower()
    
    # Détection du type de question
    if any(word in prompt_lower for word in ['comparer', 'différence', 'vs', 'versus', 'contre']):
        return "comparison"
    elif any(word in prompt_lower for word in ['analyser', 'analyse', 'expliquer', 'pourquoi']):
        return "analysis"
    elif any(word in prompt_lower for word in ['créer', 'générer', 'écrire', 'rédiger', 'inventer']):
        return "creation"
    elif any(word in prompt_lower for word in ['rechercher', 'trouver', 'quand', 'où', 'qui']):
        return "research"
    elif any(word in prompt_lower for word in ['calculer', 'résoudre', 'problème', 'équation']):
        return "calculation"
    else:
        return "general"

def get_prompt_template(prompt_type: str, original_prompt: str) -> str:
    """Retourne le template d'amélioration selon le type de prompt"""
    
    templates = {
        "comparison": f"""Améliore ce prompt de comparaison pour qu'il soit plus précis et structuré :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Ajouter des critères de comparaison spécifiques (performances, coût, facilité d'usage, etc.)
- Demander une analyse objective avec des exemples concrets
- Structurer la réponse avec une introduction, analyse détaillée et conclusion
- Limiter la réponse à 300 mots maximum
- Demander un tableau comparatif si pertinent

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial.""",

        "analysis": f"""Améliore ce prompt d'analyse pour qu'il soit plus méthodique et complet :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Définir clairement ce qui doit être analysé
- Demander une approche étape par étape
- Inclure des facteurs critiques à considérer
- Demander des implications et recommandations
- Structurer la réponse de manière logique
- Limiter à 300 mots maximum

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial.""",

        "creation": f"""Améliore ce prompt de création pour qu'il soit plus créatif et structuré :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Définir précisément ce qui doit être créé
- Demander une approche créative et originale
- Inclure des éléments d'inspiration et de style
- Structurer le processus de création
- Adapter le contenu au public cible
- Limiter à 300 mots maximum

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial.""",

        "research": f"""Améliore ce prompt de recherche pour qu'il soit plus méthodique et précis :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Définir clairement l'objet de la recherche
- Spécifier les types de sources à consulter
- Demander une synthèse organisée et factuelle
- Inclure des critères de fiabilité
- Structurer la présentation des résultats
- Limiter à 300 mots maximum

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial.""",

        "calculation": f"""Améliore ce prompt de calcul pour qu'il soit plus pédagogique et méthodique :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Définir clairement le problème à résoudre
- Demander une approche étape par étape
- Inclure des explications pédagogiques
- Montrer tous les calculs de manière détaillée
- Vérifier la cohérence des résultats
- Limiter à 300 mots maximum

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial.""",

        "general": f"""Améliore ce prompt général pour qu'il soit plus clair et structuré :

Prompt original : "{original_prompt}"

Techniques à appliquer :
- Clarifier l'objectif de la demande
- Structurer la réponse de manière logique
- Adapter le niveau de détail au contexte
- Utiliser un langage clair et accessible
- Organiser l'information de manière professionnelle
- Limiter à 300 mots maximum

Retourne UNIQUEMENT le prompt amélioré, sans balises ni formatage spécial."""
    }
    
    return templates.get(prompt_type, templates["general"])

def apply_manual_improvement(original_prompt: str, prompt_type: str) -> str:
    """Applique une amélioration manuelle simple si l'IA ne transforme pas assez le prompt"""
    
    # Améliorations simples et directes selon le type
    improvements = {
        "comparison": f"Fais-moi un tableau comparatif détaillé de {original_prompt}, en analysant les avantages, inconvénients, cas d'usage et recommandations pour un contexte de gestion de projet.",
        
        "analysis": f"Analyse en détail {original_prompt} en tant qu'AMOA, en expliquant les enjeux, les risques, les parties prenantes et les solutions possibles avec des exemples concrets de projets.",
        
        "creation": f"Crée {original_prompt} de manière structurée et professionnelle, en adaptant le style au contexte de gestion de projet et en incluant les bonnes pratiques métier.",
        
        "research": f"Fais-moi une synthèse des meilleures pratiques et méthodologies sur {original_prompt}, avec des sources fiables et une présentation adaptée aux professionnels de la gestion de projet.",
        
        "calculation": f"Calcule {original_prompt} en montrant tous les calculs étape par étape, les métriques de projet et en expliquant chaque méthode utilisée dans un contexte de gestion de projet.",
        
        "general": f"Explique {original_prompt} de manière professionnelle et accessible, comme si tu parlais à un chef de projet ou un AMOA qui a besoin de conseils pratiques."
    }
    
    return improvements.get(prompt_type, improvements["general"])

@app.get("/health")
async def health_check():
    """Endpoint de santé du service"""
    return {"status": "healthy", "service": "IA'ctualités Real Backend"}

@app.post("/query", response_model=QueryResponse)
async def query_model(request: QueryRequest):
    """Endpoint principal pour interroger un modèle LLM"""
    start_time = time.time()
    
    try:
        # Routage vers l'API appropriée
        if request.model in BEDROCK_MODELS:
            result = query_bedrock_model(request.model, request.prompt)
        elif request.model in AZURE_MODELS:
            result = query_azure_model(request.model, request.prompt)
        else:
            available_models = list(BEDROCK_MODELS.keys()) + list(AZURE_MODELS.keys())
            raise HTTPException(
                status_code=400, 
                detail=f"Modèle '{request.model}' non supporté. Modèles disponibles: {available_models}"
            )
        
        # Ajouter le temps de traitement
        processing_time = round(time.time() - start_time, 2)
        result["processing_time"] = processing_time
        
        return QueryResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@app.post("/improve-prompt")
async def improve_prompt(request: dict):
    """Endpoint pour améliorer un prompt avec les meilleures pratiques de prompt engineering"""
    try:
        original_prompt = request.get("prompt", "")
        
        if not original_prompt.strip():
            return {"improved_prompt": "Veuillez saisir un prompt à améliorer."}
        
        print(f"🔧 Amélioration du prompt: '{original_prompt}'")
        
        # Analyse du type de prompt et application des meilleures pratiques
        prompt_type = analyze_prompt_type(original_prompt)
        print(f"📊 Type détecté: {prompt_type}")
        
        # Instructions simples et directes pour l'amélioration
        optimization_prompt = f"""Tu es un expert en prompt engineering. Améliore ce prompt pour qu'il soit plus précis et efficace.

PROMPT ORIGINAL : "{original_prompt}"
TYPE DÉTECTÉ : {prompt_type}

INSTRUCTIONS :
- Transforme le prompt original en quelque chose de plus précis et efficace
- Ajoute des détails spécifiques selon le type de prompt
- Rends le prompt plus clair et structuré
- Demande une réponse bien formatée avec des titres, sous-titres et listes
- Ne commence pas par "Voici le prompt amélioré" ou des phrases similaires

EXEMPLES DE TRANSFORMATION :
- "Comment structurer un projet de transformation digitale" → "En tant qu'AMOA, guide-moi étape par étape pour structurer un projet de transformation digitale. Structure ta réponse avec des titres clairs (## Phase 1, ## Phase 2, etc.), des listes à puces pour les étapes, et des sections détaillées pour la méthodologie, les parties prenantes, les risques et le planning recommandé."
- "Comparer les méthodologies agiles" → "Fais-moi un tableau comparatif détaillé entre Scrum, Kanban et SAFe. Structure ta réponse avec des titres (## Comparaison, ## Recommandations), des listes pour les avantages/inconvénients, et des sections claires pour chaque méthodologie."

Retourne UNIQUEMENT le prompt amélioré, sans introduction ni explications."""

        print(f"📝 Prompt d'optimisation envoyé à l'IA")

        # Utiliser Claude 3 Sonnet pour l'amélioration
        try:
            result = query_bedrock_model("Claude 3 Sonnet", optimization_prompt)
            raw_response = result["response"].strip()
            
            # Nettoyer la réponse pour extraire le prompt amélioré
            if "Voici le prompt amélioré" in raw_response:
                # Extraire le contenu après les marqueurs
                lines = raw_response.split('\n')
                improved_lines = []
                capture = False
                
                for line in lines:
                    if any(marker in line for marker in ["[CONTEXTE]", "<CONTEXTE>", "```"]):
                        capture = True
                    if capture:
                        improved_lines.append(line)
                
                improved_prompt = '\n'.join(improved_lines).strip()
                
                # Nettoyer les marqueurs de code
                if improved_prompt.startswith('```'):
                    improved_prompt = improved_prompt[3:]
                if improved_prompt.endswith('```'):
                    improved_prompt = improved_prompt[:-3]
                improved_prompt = improved_prompt.strip()
                
            else:
                # Si pas de formatage spécial, utiliser directement
                improved_prompt = raw_response
            
            print(f"✅ Réponse Claude 3 Sonnet traitée: {improved_prompt[:100]}...")
            
        except Exception as bedrock_error:
            print(f"❌ Erreur Bedrock: {bedrock_error}")
            # Fallback vers l'amélioration manuelle
            improved_prompt = apply_manual_improvement(original_prompt, prompt_type)
        
        # Validation : s'assurer que le prompt amélioré est différent de l'original
        if improved_prompt.lower() == original_prompt.lower() or len(improved_prompt) < len(original_prompt) + 10:
            print(f"⚠️ Prompt pas assez différent, application de l'amélioration manuelle")
            improved_prompt = apply_manual_improvement(original_prompt, prompt_type)
        
        print(f"🎯 Prompt amélioré final: {improved_prompt[:100]}...")
        return {"improved_prompt": improved_prompt}
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        # Si l'amélioration échoue, retourne le prompt original
        return {"improved_prompt": request.get("prompt", "")}

@app.get("/")
async def root():
    """Page d'accueil du backend réel"""
    return {
        "message": "🤖 IA'ctualités Real Backend",
        "description": "Backend avec vraies API AWS Bedrock + Azure OpenAI",
        "version": "1.0.0",
        "models": {
            "bedrock": list(BEDROCK_MODELS.keys()),
            "azure": list(AZURE_MODELS.keys())
        },
        "endpoints": {
            "health": "/health",
            "query": "/query", 
            "improve_prompt": "/improve-prompt"
        },
        "frontend_url": "http://localhost:3000"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du backend RÉEL IA'ctualités...")
    print("🔑 Utilisation des vraies API AWS Bedrock + Azure OpenAI")
    print("📱 Frontend React : http://localhost:3000")
    print("🔌 Backend API : http://localhost:8000")
    print("📚 Documentation : http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 