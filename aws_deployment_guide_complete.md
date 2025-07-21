# 🚀 Guide Complet Déploiement AWS - Garder Interface React/TSX

## 🎯 **Objectif : Déployer sans changer votre interface React**

Votre application actuelle :
- ✅ **Frontend** : React + TypeScript (TSX) - **GARDÉ INTACT**
- ✅ **Backend** : Python FastAPI - **DÉPLOYÉ SUR AWS**
- ✅ **Interface** : Exactement la même qu'en local

## 📋 **Architecture AWS Recommandée**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Amplify   │    │   API Gateway   │    │   AWS Lambda    │
│   (React/TSX)   │◄──►│   (REST API)    │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Interface     │    │ • CORS          │    │ • FastAPI       │
│ • Hosting       │    │ • Auth          │    │ • Bedrock       │
│ • CDN           │    │ • Rate Limiting │    │ • Azure OpenAI  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Étape 1 : Préparation du Projet**

### **1.1 Vérification de la Structure**

✅ **Structure confirmée :**
```
Article - Copie/
├── iactualities-comparator/     # Frontend React/TSX
│   ├── src/                     # Composants React
│   ├── public/                  # Assets statiques
│   ├── package.json            # Dépendances React
│   └── tsconfig.json           # Configuration TypeScript
├── backend_main.py             # Backend FastAPI
├── requirements.txt            # Dépendances Python
└── config_api.txt              # Configuration API
```

### **1.2 Configuration AWS CLI**

```bash
# Installation AWS CLI (si pas déjà fait)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configuration avec vos accès entreprise
aws configure
# AWS Access Key ID: [VOTRE_ACCESS_KEY]
# AWS Secret Access Key: [VOTRE_SECRET_KEY]
# Default region name: eu-west-3 (ou votre région)
# Default output format: json
```

### **1.3 Installation Amplify CLI**

```bash
# Installation Amplify CLI
npm install -g @aws-amplify/cli

# Configuration Amplify
amplify configure
# Suivez les instructions pour configurer avec vos accès AWS
```

## 🚀 **Étape 2 : Déploiement Backend (Lambda + API Gateway)**

### **2.1 Préparation du Backend Lambda**

Créons un package Lambda optimisé :

```python
# lambda_function.py - Version optimisée pour AWS Lambda
import json
import os
import boto3
import openai
from mangum import Mangum
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation FastAPI
app = FastAPI(title="IA'ctualités API", version="1.0.0")

# CORS pour Amplify
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez votre domaine Amplify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration AWS Bedrock
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name=os.environ.get('AWS_REGION', 'eu-west-3')
)

# Configuration Azure OpenAI
openai.api_type = "azure"
openai.api_key = os.environ.get('AZURE_OPENAI_KEY')
openai.api_base = os.environ.get('AZURE_OPENAI_ENDPOINT')
openai.api_version = "2024-02-15-preview"

class QueryRequest(BaseModel):
    model: str
    prompt: str

class QueryResponse(BaseModel):
    response: str
    cost: float
    tokens: int
    model: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "IA'ctualités API"}

@app.post("/query", response_model=QueryResponse)
async def query_model(request: QueryRequest):
    try:
        logger.info(f"Querying model: {request.model}")
        
        if "Azure" in request.model:
            # Azure OpenAI
            response = openai.ChatCompletion.create(
                engine=request.model.replace(" (Azure)", ""),
                messages=[{"role": "user", "content": request.prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            
            return QueryResponse(
                response=response.choices[0].message.content,
                cost=0.001,  # Estimation
                tokens=response.usage.total_tokens,
                model=request.model
            )
        else:
            # AWS Bedrock
            model_id = get_bedrock_model_id(request.model)
            
            response = bedrock.invoke_model(
                modelId=model_id,
                body=json.dumps({
                    "prompt": request.prompt,
                    "max_tokens": 1000,
                    "temperature": 0.7
                })
            )
            
            response_body = json.loads(response['body'].read())
            
            return QueryResponse(
                response=response_body['completion'],
                cost=0.001,  # Estimation
                tokens=len(request.prompt.split()),
                model=request.model
            )
            
    except Exception as e:
        logger.error(f"Error querying model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_bedrock_model_id(model_name: str) -> str:
    """Convertit le nom du modèle en ID Bedrock"""
    model_mapping = {
        "Claude 3 Sonnet": "anthropic.claude-3-sonnet-20240229-v1:0",
        "Claude 3 Haiku": "anthropic.claude-3-haiku-20240307-v1:0",
        "Claude 3.7 Sonnet": "anthropic.claude-3-5-sonnet-20241022-v1:0",
        "Mixtral 8x7B Instruct": "mistral.mixtral-8x7b-instruct-v0:1",
        "Mistra 8x7B Instruct": "mistral.mistral-7b-instruct-v0:2",
        "Pixtral Large": "mistral.mixtral-8x7b-instruct-v0:1"
    }
    return model_mapping.get(model_name, "anthropic.claude-3-sonnet-20240229-v1:0")

# Handler Lambda
handler = Mangum(app)
```

### **2.2 Création du Package Lambda**

```bash
# Création du répertoire Lambda
mkdir lambda-package
cd lambda-package

# Copie du code
cp ../lambda_function.py .

# Installation des dépendances
pip install -r ../requirements.txt -t .

# Création du ZIP
zip -r lambda-deployment.zip .
```

### **2.3 Déploiement via AWS CLI**

```bash
# Création du rôle IAM pour Lambda
aws iam create-role \
    --role-name IActualitesLambdaRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Attachement des politiques nécessaires
aws iam attach-role-policy \
    --role-name IActualitesLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name IActualitesLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AWSBedrockFullAccess

# Création de la fonction Lambda
aws lambda create-function \
    --function-name iactualites-api \
    --runtime python3.11 \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/IActualitesLambdaRole \
    --handler lambda_function.handler \
    --zip-file fileb://lambda-deployment.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
        "AZURE_OPENAI_KEY":"VOTRE_CLE_AZURE",
        "AZURE_OPENAI_ENDPOINT":"VOTRE_ENDPOINT_AZURE"
    }'
```

### **2.4 Configuration API Gateway**

```bash
# Création de l'API Gateway
aws apigateway create-rest-api \
    --name "IActualites API" \
    --description "API pour IA'ctualités"

# Récupération de l'ID de l'API
API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`IActualites API`].id' --output text)

# Récupération de l'ID de la ressource racine
ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/`].id' --output text)

# Création des ressources
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part "query"

aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part "health"

# Récupération des IDs des ressources
QUERY_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/query`].id' --output text)
HEALTH_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/health`].id' --output text)

# Création des méthodes
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --authorization-type NONE

aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $HEALTH_ID \
    --http-method GET \
    --authorization-type NONE

# Intégration avec Lambda
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:eu-west-3:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-3:YOUR_ACCOUNT_ID:function:iactualites-api/invocations

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $HEALTH_ID \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:lambda:eu-west-3:YOUR_ACCOUNT_ID:function:iactualites-api/invocations

# Déploiement de l'API
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod

# URL finale de l'API
echo "API URL: https://$API_ID.execute-api.eu-west-3.amazonaws.com/prod"
```

## 🎨 **Étape 3 : Déploiement Frontend (Amplify)**

### **3.1 Configuration Amplify**

```bash
# Navigation vers le frontend
cd iactualities-comparator

# Initialisation Amplify
amplify init
# ? Enter a name for the project: iactualities-comparator
# ? Enter a name for the environment: prod
# ? Choose your default editor: (your editor)
# ? Choose the type of app that you're building: web
# ? What JavaScript framework are you using: react
# ? Source Directory Path: src
# ? Distribution Directory Path: build
# ? Build Command: npm run build
# ? Start Command: npm start
# ? Do you want to use an AWS profile? Yes
# ? Please choose the profile you want to use: default
```

### **3.2 Configuration des Variables d'Environnement**

```bash
# Ajout des variables d'environnement
amplify add env
# ? Do you want to use an environment variables file? Yes
# ? Enter the name of the environment variables file: .env.production

# Configuration des variables
echo "REACT_APP_API_URL=https://$API_ID.execute-api.eu-west-3.amazonaws.com/prod" > .env.production
```

### **3.3 Mise à jour de la Configuration API Frontend**

Modifiez votre fichier de configuration API pour pointer vers AWS :

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};
```

### **3.4 Déploiement Amplify**

```bash
# Build de l'application
npm run build

# Déploiement
amplify publish

# Ou via la console AWS Amplify
# 1. Allez sur console.aws.amazon.com/amplify
# 2. Cliquez sur "New app" > "Host web app"
# 3. Connectez votre repository GitHub
# 4. Configurez les paramètres de build
```

### **3.5 Configuration du Build Amplify**

Dans la console Amplify, configurez le build :

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## 🔐 **Étape 4 : Sécurité et Configuration**

### **4.1 Configuration CORS**

Dans votre API Gateway, ajoutez les headers CORS :

```bash
# Configuration CORS pour Amplify
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": true,
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true
    }'

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": "'\''*'\''",
        "method.response.header.Access-Control-Allow-Headers": "'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''",
        "method.response.header.Access-Control-Allow-Methods": "'\''POST,OPTIONS'\''"
    }'
```

### **4.2 Configuration WAF (Optionnel)**

```bash
# Création d'un WAF pour protéger l'API
aws wafv2 create-web-acl \
    --name IActualitesWAF \
    --scope REGIONAL \
    --default-action Allow={} \
    --description "WAF pour IA'ctualités" \
    --region eu-west-3
```

### **4.3 Monitoring CloudWatch**

```bash
# Création d'alarmes CloudWatch
aws cloudwatch put-metric-alarm \
    --alarm-name "IActualites-API-Errors" \
    --alarm-description "Alarme pour les erreurs API" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --threshold 5 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --dimensions Name=FunctionName,Value=iactualites-api
```

## 🚀 **Étape 5 : Test et Validation**

### **5.1 Test de l'API**

```bash
# Test de l'endpoint health
curl -X GET https://$API_ID.execute-api.eu-west-3.amazonaws.com/prod/health

# Test de l'endpoint query
curl -X POST https://$API_ID.execute-api.eu-west-3.amazonaws.com/prod/query \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Claude 3 Sonnet",
    "prompt": "Bonjour, comment allez-vous ?"
  }'
```

### **5.2 Test du Frontend**

1. Ouvrez votre application Amplify
2. Testez la sélection de modèles
3. Testez l'envoi de questions
4. Vérifiez les réponses

## 📊 **Étape 6 : Monitoring et Maintenance**

### **6.1 Dashboard CloudWatch**

```bash
# Création d'un dashboard
aws cloudwatch put-dashboard \
    --dashboard-name "IActualites-Dashboard" \
    --dashboard-body '{
        "widgets": [
            {
                "type": "metric",
                "properties": {
                    "metrics": [
                        ["AWS/Lambda", "Invocations", "FunctionName", "iactualites-api"],
                        [".", "Errors", ".", "."],
                        [".", "Duration", ".", "."]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "eu-west-3",
                    "title": "Lambda Metrics"
                }
            }
        ]
    }'
```

### **6.2 Logs et Debugging**

```bash
# Visualisation des logs Lambda
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/iactualites-api"

# Récupération des logs récents
aws logs filter-log-events \
    --log-group-name "/aws/lambda/iactualites-api" \
    --start-time $(date -d '1 hour ago' +%s)000
```

## 💰 **Étape 7 : Optimisation des Coûts**

### **7.1 Estimation des Coûts**

**Lambda :**
- 1000 invocations/mois : ~$0.20
- 1GB mémoire : ~$0.10

**API Gateway :**
- 1M requêtes/mois : ~$3.50

**Amplify :**
- Build minutes : ~$0.01/minute
- Transfert de données : ~$0.15/GB

**Total estimé : ~$4-10/mois**

### **7.2 Optimisations**

```bash
# Configuration de la provisioned concurrency pour réduire la latence
aws lambda put-provisioned-concurrency-config \
    --function-name iactualites-api \
    --qualifier prod \
    --provisioned-concurrent-executions 1

# Configuration du cache API Gateway
aws apigateway create-stage \
    --rest-api-id $API_ID \
    --stage-name prod \
    --cache-cluster-enabled \
    --cache-cluster-size 0.5
```

## 🎯 **Résumé du Déploiement**

### ✅ **Ce qui est déployé :**
- **Frontend** : React/TSX sur AWS Amplify (interface identique)
- **Backend** : FastAPI sur AWS Lambda
- **API** : API Gateway avec CORS configuré
- **Monitoring** : CloudWatch et logs
- **Sécurité** : IAM, WAF optionnel

### 🔗 **URLs finales :**
- **Frontend** : `https://main.XXXXXXXXX.amplifyapp.com`
- **API** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod`
- **Documentation** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod/docs`

### 🚀 **Prochaines étapes :**
1. Testez l'application déployée
2. Configurez un domaine personnalisé (optionnel)
3. Mettez en place CI/CD avec GitHub Actions
4. Configurez des alertes de monitoring

**Votre interface React reste exactement la même !** 🎉