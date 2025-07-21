# 🚀 Guide de Déploiement AWS - IA'ctualités

## 📋 Prérequis
- Compte AWS avec accès aux services
- AWS CLI configuré
- Docker installé (optionnel)

## 🏗️ Architecture AWS

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   Amplify       │◄──►│   + Cognito     │◄──►│   Functions     │
│   (React)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DynamoDB      │    │   CloudWatch    │
                       │   (Cache)       │    │   (Logs)        │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Étapes de Déploiement

### 1. Préparation du Frontend

```bash
# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Initialiser le projet
cd iactualities-comparator
amplify init

# Ajouter l'authentification
amplify add auth

# Ajouter l'API
amplify add api

# Déployer
amplify push
```

### 2. Configuration du Backend Lambda

```python
# lambda_function.py
import json
import boto3
from bedrock_runtime import BedrockRuntime

def lambda_handler(event, context):
    # Votre logique backend existante
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps({
            'response': 'Réponse du modèle',
            'cost': 0.001,
            'tokens': 150
        })
    }
```

### 3. Configuration des Variables d'Environnement

```yaml
# amplify/backend/function/llmFunction/function-parameters.json
{
  "environmentVariables": {
    "BEDROCK_REGION": "us-east-1",
    "AZURE_OPENAI_KEY": "${env.AZURE_OPENAI_KEY}",
    "AZURE_OPENAI_ENDPOINT": "${env.AZURE_OPENAI_ENDPOINT}"
  }
}
```

### 4. Sécurité et IAM

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## 💰 Estimation des Coûts (Mensuel)

- **Amplify** : $1-5/mois (selon le trafic)
- **Lambda** : $0.20 par million de requêtes
- **API Gateway** : $3.50 par million d'appels
- **CloudWatch** : $0.50 par GB de logs
- **Total estimé** : $5-15/mois pour 1000 utilisateurs

## 🔒 Sécurité

- **Cognito** pour l'authentification
- **API Gateway** avec rate limiting
- **WAF** pour la protection DDoS
- **VPC** pour l'isolation réseau

## 📊 Monitoring

- **CloudWatch Dashboards** pour les métriques
- **X-Ray** pour le tracing
- **SNS** pour les alertes
- **CloudTrail** pour l'audit

## 🚀 Déploiement Automatisé

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Amplify
        run: |
          amplify push --yes
```

## 🔧 Scripts de Déploiement

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement IA'ctualités sur AWS..."

# Build du frontend
cd iactualities-comparator
npm run build

# Déploiement Amplify
amplify push --yes

# Mise à jour des variables d'environnement
aws lambda update-function-configuration \
  --function-name llmFunction \
  --environment Variables="{BEDROCK_REGION=us-east-1}"

echo "✅ Déploiement terminé !"
echo "🌐 URL: https://main.xxxxx.amplifyapp.com"
```

## 🎯 Avantages de cette Solution

1. **Scalabilité** : Gestion automatique de la charge
2. **Coût** : Pay-per-use, très économique
3. **Sécurité** : Intégration native AWS
4. **Performance** : CDN global
5. **Maintenance** : Gérée par AWS
6. **Monitoring** : Outils intégrés

## ⚠️ Points d'Attention

- **Vendor Lock-in** : Dépendance à AWS
- **Complexité** : Courbe d'apprentissage
- **Cold Start** : Latence Lambda
- **Limites** : Timeout 15min Lambda 