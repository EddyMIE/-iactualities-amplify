#!/bin/bash

# 🚀 Script de Déploiement AWS - IA'ctualités
# Garde votre interface React/TSX intacte

set -e  # Arrêt en cas d'erreur

echo "🚀 Démarrage du déploiement AWS IA'ctualités..."
echo "📋 Interface React/TSX sera gardée intacte"

# Variables
PROJECT_NAME="iactualites"
REGION="eu-west-3"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "📍 Région: $REGION"
echo "🏢 Account ID: $ACCOUNT_ID"

# Étape 1: Préparation du Backend Lambda
echo "🔧 Étape 1: Préparation du Backend Lambda..."

# Création du répertoire Lambda
mkdir -p lambda-package
cd lambda-package

# Copie du code Lambda
cp ../lambda_function.py .

# Installation des dépendances
echo "📦 Installation des dépendances Python..."
pip install fastapi mangum boto3 openai pydantic -t .

# Création du ZIP
echo "📦 Création du package Lambda..."
zip -r lambda-deployment.zip .

cd ..

# Étape 2: Création des Rôles IAM
echo "🔐 Étape 2: Création des rôles IAM..."

# Création du rôle Lambda
aws iam create-role \
    --role-name ${PROJECT_NAME}LambdaRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }' || echo "⚠️ Rôle déjà existant"

# Attente pour la propagation IAM
sleep 10

# Attachement des politiques
echo "🔗 Attachement des politiques IAM..."
aws iam attach-role-policy \
    --role-name ${PROJECT_NAME}LambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name ${PROJECT_NAME}LambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AWSBedrockFullAccess

# Étape 3: Création de la fonction Lambda
echo "⚡ Étape 3: Création de la fonction Lambda..."

aws lambda create-function \
    --function-name ${PROJECT_NAME}-api \
    --runtime python3.11 \
    --role arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}LambdaRole \
    --handler lambda_function.handler \
    --zip-file fileb://lambda-package/lambda-deployment.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
        "AZURE_OPENAI_KEY":"'${AZURE_OPENAI_KEY:-placeholder}'",
        "AZURE_OPENAI_ENDPOINT":"'${AZURE_OPENAI_ENDPOINT:-placeholder}'"
    }' || echo "⚠️ Fonction déjà existante, mise à jour..."

# Mise à jour si la fonction existe déjà
if [ $? -ne 0 ]; then
    echo "🔄 Mise à jour de la fonction Lambda existante..."
    aws lambda update-function-code \
        --function-name ${PROJECT_NAME}-api \
        --zip-file fileb://lambda-package/lambda-deployment.zip
    
    aws lambda update-function-configuration \
        --function-name ${PROJECT_NAME}-api \
        --timeout 30 \
        --memory-size 512 \
        --environment Variables='{
            "AZURE_OPENAI_KEY":"'${AZURE_OPENAI_KEY:-placeholder}'",
            "AZURE_OPENAI_ENDPOINT":"'${AZURE_OPENAI_ENDPOINT:-placeholder}'"
        }'
fi

# Étape 4: Configuration API Gateway
echo "🌐 Étape 4: Configuration API Gateway..."

# Création de l'API Gateway
API_ID=$(aws apigateway create-rest-api \
    --name "${PROJECT_NAME} API" \
    --description "API pour IA'ctualités" \
    --query 'id' --output text 2>/dev/null || \
    aws apigateway get-rest-apis \
    --query 'items[?name==`'${PROJECT_NAME}' API`].id' --output text)

echo "🔗 API Gateway ID: $API_ID"

# Récupération de l'ID de la ressource racine
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --query 'items[?path==`/`].id' --output text)

# Création des ressources
echo "📁 Création des ressources API..."
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part "query" 2>/dev/null || echo "⚠️ Ressource /query déjà existante"

aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part "health" 2>/dev/null || echo "⚠️ Ressource /health déjà existante"

# Récupération des IDs des ressources
QUERY_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --query 'items[?path==`/query`].id' --output text)

HEALTH_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --query 'items[?path==`/health`].id' --output text)

# Création des méthodes
echo "🔗 Configuration des méthodes HTTP..."

# Méthode POST pour /query
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --authorization-type NONE 2>/dev/null || echo "⚠️ Méthode POST /query déjà configurée"

# Méthode GET pour /health
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $HEALTH_ID \
    --http-method GET \
    --authorization-type NONE 2>/dev/null || echo "⚠️ Méthode GET /health déjà configurée"

# Intégration avec Lambda
echo "🔗 Intégration Lambda..."

# Permission pour API Gateway d'invoquer Lambda
aws lambda add-permission \
    --function-name ${PROJECT_NAME}-api \
    --statement-id apigateway-prod \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/*" 2>/dev/null || echo "⚠️ Permission déjà existante"

# Intégration /query
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $QUERY_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${PROJECT_NAME}-api/invocations" 2>/dev/null || echo "⚠️ Intégration /query déjà configurée"

# Intégration /health
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $HEALTH_ID \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${PROJECT_NAME}-api/invocations" 2>/dev/null || echo "⚠️ Intégration /health déjà configurée"

# Déploiement de l'API
echo "🚀 Déploiement de l'API..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod 2>/dev/null || echo "⚠️ Déploiement déjà existant"

# URL finale de l'API
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
echo "✅ API déployée: $API_URL"

# Étape 5: Configuration Frontend Amplify
echo "🎨 Étape 5: Configuration Frontend Amplify..."

# Navigation vers le frontend
cd iactualities-comparator

# Vérification de l'installation Amplify CLI
if ! command -v amplify &> /dev/null; then
    echo "📦 Installation d'Amplify CLI..."
    npm install -g @aws-amplify/cli
fi

# Initialisation Amplify (si pas déjà fait)
if [ ! -d "amplify" ]; then
    echo "🔧 Initialisation Amplify..."
    amplify init \
        --name ${PROJECT_NAME}-frontend \
        --env prod \
        --type web \
        --framework react \
        --src src \
        --dist build \
        --build "npm run build" \
        --start "npm start" \
        --yes
fi

# Configuration des variables d'environnement
echo "🔧 Configuration des variables d'environnement..."
cat > .env.production << EOF
REACT_APP_API_URL=${API_URL}
EOF

# Build et déploiement
echo "🏗️ Build de l'application..."
npm run build

echo "🚀 Déploiement sur Amplify..."
amplify publish --yes

# Nettoyage
cd ..
rm -rf lambda-package

echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Résumé du déploiement :"
echo "🔗 API Backend: $API_URL"
echo "🔗 API Health: $API_URL/health"
echo "🔗 API Docs: $API_URL/docs"
echo "🎨 Frontend: Vérifiez la console Amplify pour l'URL"
echo ""
echo "🧪 Test de l'API :"
echo "curl -X GET $API_URL/health"
echo ""
echo "✅ Votre interface React/TSX reste exactement la même !" 