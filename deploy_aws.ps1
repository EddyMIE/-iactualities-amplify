# 🚀 Script de Déploiement AWS - IA'ctualités (PowerShell)
# Garde votre interface React/TSX intacte

param(
    [string]$AzureOpenAIKey = "",
    [string]$AzureOpenAIEndpoint = ""
)

Write-Host "🚀 Démarrage du déploiement AWS IA'ctualités..." -ForegroundColor Green
Write-Host "📋 Interface React/TSX sera gardée intacte" -ForegroundColor Cyan

# Variables
$PROJECT_NAME = "iactualites"
$REGION = "eu-west-3"

# Récupération de l'Account ID
try {
    $ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text 2>$null)
    if (-not $ACCOUNT_ID) {
        Write-Host "❌ Erreur: AWS CLI non configuré ou accès invalide" -ForegroundColor Red
        Write-Host "💡 Exécutez: aws configure" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erreur: Impossible de récupérer l'Account ID" -ForegroundColor Red
    exit 1
}

Write-Host "📍 Région: $REGION" -ForegroundColor Blue
Write-Host "🏢 Account ID: $ACCOUNT_ID" -ForegroundColor Blue

# Étape 1: Préparation du Backend Lambda
Write-Host "🔧 Étape 1: Préparation du Backend Lambda..." -ForegroundColor Yellow

# Création du répertoire Lambda
if (Test-Path "lambda-package") {
    Remove-Item -Recurse -Force "lambda-package"
}
New-Item -ItemType Directory -Name "lambda-package" | Out-Null
Set-Location "lambda-package"

# Copie du code Lambda
Copy-Item "../lambda_function.py" .

# Installation des dépendances
Write-Host "📦 Installation des dépendances Python..." -ForegroundColor Blue
pip install fastapi mangum boto3 openai pydantic -t . 2>$null

# Création du ZIP
Write-Host "📦 Création du package Lambda..." -ForegroundColor Blue
Compress-Archive -Path * -DestinationPath "lambda-deployment.zip" -Force

Set-Location ".."

# Étape 2: Création des Rôles IAM
Write-Host "🔐 Étape 2: Création des rôles IAM..." -ForegroundColor Yellow

# Création du rôle Lambda
try {
    aws iam create-role `
        --role-name "${PROJECT_NAME}LambdaRole" `
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' 2>$null
    Write-Host "✅ Rôle Lambda créé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Rôle déjà existant" -ForegroundColor Yellow
}

# Attente pour la propagation IAM
Start-Sleep -Seconds 10

# Attachement des politiques
Write-Host "🔗 Attachement des politiques IAM..." -ForegroundColor Blue
aws iam attach-role-policy `
    --role-name "${PROJECT_NAME}LambdaRole" `
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

aws iam attach-role-policy `
    --role-name "${PROJECT_NAME}LambdaRole" `
    --policy-arn "arn:aws:iam::aws:policy/AWSBedrockFullAccess"

# Étape 3: Création de la fonction Lambda
Write-Host "⚡ Étape 3: Création de la fonction Lambda..." -ForegroundColor Yellow

try {
    aws lambda create-function `
        --function-name "${PROJECT_NAME}-api" `
        --runtime python3.11 `
        --role "arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}LambdaRole" `
        --handler lambda_function.handler `
        --zip-file "fileb://lambda-package/lambda-deployment.zip" `
        --timeout 30 `
        --memory-size 512 `
        --environment Variables="{
            `"AZURE_OPENAI_KEY`":`"${AzureOpenAIKey}`",
            `"AZURE_OPENAI_ENDPOINT`":`"${AzureOpenAIEndpoint}`"
        }"
    Write-Host "✅ Fonction Lambda créée" -ForegroundColor Green
} catch {
    Write-Host "🔄 Mise à jour de la fonction Lambda existante..." -ForegroundColor Yellow
    aws lambda update-function-code `
        --function-name "${PROJECT_NAME}-api" `
        --zip-file "fileb://lambda-package/lambda-deployment.zip"
    
    aws lambda update-function-configuration `
        --function-name "${PROJECT_NAME}-api" `
        --timeout 30 `
        --memory-size 512 `
        --environment Variables="{
            `"AZURE_OPENAI_KEY`":`"${AzureOpenAIKey}`",
            `"AZURE_OPENAI_ENDPOINT`":`"${AzureOpenAIEndpoint}`"
        }"
}

# Étape 4: Configuration API Gateway
Write-Host "🌐 Étape 4: Configuration API Gateway..." -ForegroundColor Yellow

# Création de l'API Gateway
try {
    $API_ID = (aws apigateway create-rest-api `
        --name "${PROJECT_NAME} API" `
        --description "API pour IA'ctualités" `
        --query 'id' --output text 2>$null)
} catch {
    $API_ID = (aws apigateway get-rest-apis `
        --query "items[?name=='${PROJECT_NAME} API'].id" --output text)
}

Write-Host "🔗 API Gateway ID: $API_ID" -ForegroundColor Blue

# Récupération de l'ID de la ressource racine
$ROOT_ID = (aws apigateway get-resources `
    --rest-api-id $API_ID `
    --query 'items[?path==`/`].id' --output text)

# Création des ressources
Write-Host "📁 Création des ressources API..." -ForegroundColor Blue
try {
    aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_ID `
        --path-part "query" 2>$null
} catch {
    Write-Host "⚠️ Ressource /query déjà existante" -ForegroundColor Yellow
}

try {
    aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_ID `
        --path-part "health" 2>$null
} catch {
    Write-Host "⚠️ Ressource /health déjà existante" -ForegroundColor Yellow
}

# Récupération des IDs des ressources
$QUERY_ID = (aws apigateway get-resources `
    --rest-api-id $API_ID `
    --query 'items[?path==`/query`].id' --output text)

$HEALTH_ID = (aws apigateway get-resources `
    --rest-api-id $API_ID `
    --query 'items[?path==`/health`].id' --output text)

# Création des méthodes
Write-Host "🔗 Configuration des méthodes HTTP..." -ForegroundColor Blue

try {
    aws apigateway put-method `
        --rest-api-id $API_ID `
        --resource-id $QUERY_ID `
        --http-method POST `
        --authorization-type NONE 2>$null
} catch {
    Write-Host "⚠️ Méthode POST /query déjà configurée" -ForegroundColor Yellow
}

try {
    aws apigateway put-method `
        --rest-api-id $API_ID `
        --resource-id $HEALTH_ID `
        --http-method GET `
        --authorization-type NONE 2>$null
} catch {
    Write-Host "⚠️ Méthode GET /health déjà configurée" -ForegroundColor Yellow
}

# Intégration avec Lambda
Write-Host "🔗 Intégration Lambda..." -ForegroundColor Blue

# Permission pour API Gateway d'invoquer Lambda
try {
    aws lambda add-permission `
        --function-name "${PROJECT_NAME}-api" `
        --statement-id apigateway-prod `
        --action lambda:InvokeFunction `
        --principal apigateway.amazonaws.com `
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/*" 2>$null
} catch {
    Write-Host "⚠️ Permission déjà existante" -ForegroundColor Yellow
}

# Intégration /query
try {
    aws apigateway put-integration `
        --rest-api-id $API_ID `
        --resource-id $QUERY_ID `
        --http-method POST `
        --type AWS_PROXY `
        --integration-http-method POST `
        --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${PROJECT_NAME}-api/invocations" 2>$null
} catch {
    Write-Host "⚠️ Intégration /query déjà configurée" -ForegroundColor Yellow
}

# Intégration /health
try {
    aws apigateway put-integration `
        --rest-api-id $API_ID `
        --resource-id $HEALTH_ID `
        --http-method GET `
        --type AWS_PROXY `
        --integration-http-method POST `
        --uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${PROJECT_NAME}-api/invocations" 2>$null
} catch {
    Write-Host "⚠️ Intégration /health déjà configurée" -ForegroundColor Yellow
}

# Déploiement de l'API
Write-Host "🚀 Déploiement de l'API..." -ForegroundColor Blue
try {
    aws apigateway create-deployment `
        --rest-api-id $API_ID `
        --stage-name prod 2>$null
} catch {
    Write-Host "⚠️ Déploiement déjà existant" -ForegroundColor Yellow
}

# URL finale de l'API
$API_URL = "https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
Write-Host "✅ API déployée: $API_URL" -ForegroundColor Green

# Étape 5: Configuration Frontend Amplify
Write-Host "🎨 Étape 5: Configuration Frontend Amplify..." -ForegroundColor Yellow

# Navigation vers le frontend
Set-Location "iactualities-comparator"

# Vérification de l'installation Amplify CLI
try {
    amplify --version | Out-Null
    Write-Host "✅ Amplify CLI installé" -ForegroundColor Green
} catch {
    Write-Host "📦 Installation d'Amplify CLI..." -ForegroundColor Blue
    npm install -g @aws-amplify/cli
}

# Initialisation Amplify (si pas déjà fait)
if (-not (Test-Path "amplify")) {
    Write-Host "🔧 Initialisation Amplify..." -ForegroundColor Blue
    amplify init `
        --name "${PROJECT_NAME}-frontend" `
        --env prod `
        --type web `
        --framework react `
        --src src `
        --dist build `
        --build "npm run build" `
        --start "npm start" `
        --yes
}

# Configuration des variables d'environnement
Write-Host "🔧 Configuration des variables d'environnement..." -ForegroundColor Blue
"REACT_APP_API_URL=$API_URL" | Out-File -FilePath ".env.production" -Encoding UTF8

# Build et déploiement
Write-Host "🏗️ Build de l'application..." -ForegroundColor Blue
npm run build

Write-Host "🚀 Déploiement sur Amplify..." -ForegroundColor Blue
amplify publish --yes

# Nettoyage
Set-Location ".."
Remove-Item -Recurse -Force "lambda-package" -ErrorAction SilentlyContinue

Write-Host "🎉 Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé du déploiement :" -ForegroundColor Cyan
Write-Host "🔗 API Backend: $API_URL" -ForegroundColor White
Write-Host "🔗 API Health: $API_URL/health" -ForegroundColor White
Write-Host "🔗 API Docs: $API_URL/docs" -ForegroundColor White
Write-Host "🎨 Frontend: Vérifiez la console Amplify pour l'URL" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test de l'API :" -ForegroundColor Cyan
Write-Host "curl -X GET $API_URL/health" -ForegroundColor White
Write-Host ""
Write-Host "✅ Votre interface React/TSX reste exactement la même !" -ForegroundColor Green 