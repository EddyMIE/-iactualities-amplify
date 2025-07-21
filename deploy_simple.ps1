# Script de déploiement simplifié
Write-Host "Deploiement automatique Lambda + API Gateway" -ForegroundColor Green

# Variables
$FUNCTION_NAME = "iactualities-backend"
$REGION = "eu-west-3"
$RUNTIME = "python3.11"
$HANDLER = "lambda_function.lambda_handler"
$ROLE_NAME = "iactualities-lambda-role"
$API_NAME = "iactualities-api"

# Fonctions de messages
function Write-Success { param($Message) Write-Host "SUCCESS: $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "ERROR: $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "INFO: $Message" -ForegroundColor Blue }

# Vérification AWS CLI
Write-Info "Verification AWS CLI..."
try {
    $AWS_VERSION = aws --version
    Write-Success "AWS CLI detecte: $AWS_VERSION"
} catch {
    Write-Error "AWS CLI non trouve. Installez-le d'abord."
    exit 1
}

# Vérification de la configuration AWS
Write-Info "Verification de la configuration AWS..."
try {
    $AWS_IDENTITY = aws sts get-caller-identity --query "Account" --output text
    Write-Success "Compte AWS configure: $AWS_IDENTITY"
} catch {
    Write-Error "AWS CLI non configure. Executez 'aws configure' d'abord."
    exit 1
}

# ÉTAPE 1: Créer le rôle IAM
Write-Info "ETAPE 1: Creation du role IAM pour Lambda..."

$TRUST_POLICY = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
"@

$TRUST_POLICY | Out-File -FilePath "trust-policy.json" -Encoding UTF8

try {
    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AWSBedrockFullAccess
    Write-Success "Role IAM cree avec succes"
} catch {
    Write-Error "Erreur lors de la creation du role IAM"
}

# ÉTAPE 2: Créer le package de déploiement
Write-Info "ETAPE 2: Creation du package de deploiement..."

if (Test-Path "lambda-package") { Remove-Item "lambda-package" -Recurse -Force }
New-Item -ItemType Directory -Name "lambda-package"

Copy-Item "lambda_function.py" "lambda-package/"
Copy-Item "lambda_requirements.txt" "lambda-package/requirements.txt"

Set-Location "lambda-package"
pip install -r requirements.txt -t . --quiet
Remove-Item requirements.txt
Set-Location ..

Compress-Archive -Path "lambda-package\*" -DestinationPath "lambda-deployment.zip" -Force
Write-Success "Package de deploiement cree"

# ÉTAPE 3: Attendre que le rôle soit disponible
Write-Info "ETAPE 3: Attente de la propagation du role IAM..."
Start-Sleep -Seconds 15

# ÉTAPE 4: Créer la fonction Lambda
Write-Info "ETAPE 4: Creation de la fonction Lambda..."

try {
    aws lambda create-function `
        --function-name $FUNCTION_NAME `
        --runtime $RUNTIME `
        --role "arn:aws:iam::$AWS_IDENTITY`:role/$ROLE_NAME" `
        --handler $HANDLER `
        --zip-file fileb://lambda-deployment.zip `
        --timeout 30 `
        --memory-size 512 `
        --region $REGION
    
    Write-Success "Fonction Lambda creee avec succes"
} catch {
    Write-Error "Erreur lors de la creation de la fonction Lambda"
}

# ÉTAPE 5: Configurer les variables d'environnement
Write-Info "ETAPE 5: Configuration des variables d'environnement..."

$ENV_VARS = "AZURE_OPENAI_API_KEY=votre_cle_azure_openai,AZURE_OPENAI_ENDPOINT=votre_endpoint_azure_openai,AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o,ANTHROPIC_API_KEY=votre_cle_anthropic,CUSTOM_AWS_ACCESS_KEY_ID=votre_cle_aws_access,CUSTOM_AWS_SECRET_ACCESS_KEY=votre_cle_aws_secret"

try {
    aws lambda update-function-configuration `
        --function-name $FUNCTION_NAME `
        --environment Variables=$ENV_VARS `
        --region $REGION
    
    Write-Success "Variables d'environnement configurees"
} catch {
    Write-Error "Erreur lors de la configuration des variables d'environnement"
}

# ÉTAPE 6: Créer l'API Gateway
Write-Info "ETAPE 6: Creation de l'API Gateway..."

try {
    $API_ID = aws apigateway create-rest-api `
        --name $API_NAME `
        --description "API backend pour l'application de comparaison d'IA" `
        --region $REGION `
        --query "id" `
        --output text
    
    Write-Success "API Gateway creee avec l'ID: $API_ID"
} catch {
    Write-Error "Erreur lors de la creation de l'API Gateway"
}

# ÉTAPE 7: Configurer les ressources et méthodes
Write-Info "ETAPE 7: Configuration des ressources et methodes..."

try {
    $ROOT_RESOURCE_ID = aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/'].id" --output text
    
    $QUERY_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "query" `
        --region $REGION `
        --query "id" `
        --output text
    
    $LAMBDA_URI = "arn:aws:apigateway:$REGION`:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION`:$AWS_IDENTITY`:function:$FUNCTION_NAME/invocations"
    
    aws apigateway put-method `
        --rest-api-id $API_ID `
        --resource-id $QUERY_RESOURCE_ID `
        --http-method POST `
        --authorization-type NONE `
        --region $REGION
    
    aws apigateway put-integration `
        --rest-api-id $API_ID `
        --resource-id $QUERY_RESOURCE_ID `
        --http-method POST `
        --type AWS_PROXY `
        --integration-http-method POST `
        --uri $LAMBDA_URI `
        --region $REGION
    
    $HEALTH_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "health" `
        --region $REGION `
        --query "id" `
        --output text
    
    aws apigateway put-method `
        --rest-api-id $API_ID `
        --resource-id $HEALTH_RESOURCE_ID `
        --http-method GET `
        --authorization-type NONE `
        --region $REGION
    
    aws apigateway put-integration `
        --rest-api-id $API_ID `
        --resource-id $HEALTH_RESOURCE_ID `
        --http-method GET `
        --type AWS_PROXY `
        --integration-http-method POST `
        --uri $LAMBDA_URI `
        --region $REGION
    
    Write-Success "Ressources et methodes configurees"
} catch {
    Write-Error "Erreur lors de la configuration des ressources"
}

# ÉTAPE 8: Ajouter les permissions Lambda
Write-Info "ETAPE 8: Configuration des permissions Lambda..."

try {
    aws lambda add-permission `
        --function-name $FUNCTION_NAME `
        --statement-id apigateway-invoke `
        --action lambda:InvokeFunction `
        --principal apigateway.amazonaws.com `
        --region $REGION
    
    Write-Success "Permissions Lambda configurees"
} catch {
    Write-Info "Permissions deja configurees ou erreur (peut etre ignoree)"
}

# ÉTAPE 9: Déployer l'API
Write-Info "ETAPE 9: Deploiement de l'API..."

try {
    aws apigateway create-deployment `
        --rest-api-id $API_ID `
        --stage-name "prod" `
        --region $REGION
    
    Write-Success "API deployee sur le stage 'prod'"
} catch {
    Write-Error "Erreur lors du deploiement"
}

# ÉTAPE 10: Nettoyage
Write-Info "ETAPE 10: Nettoyage des fichiers temporaires..."
Remove-Item "lambda-package" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "lambda-deployment.zip" -ErrorAction SilentlyContinue
Remove-Item "trust-policy.json" -ErrorAction SilentlyContinue

# RÉSULTATS FINAUX
Write-Host ""
Write-Host "DEPLOIEMENT COMPLET TERMINE !" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "INFORMATIONS IMPORTANTES :" -ForegroundColor Yellow
Write-Host "• API ID: $API_ID"
Write-Host "• URL de l'API: https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
Write-Host "• Endpoint /query: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/query"
Write-Host "• Endpoint /health: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health"
Write-Host "• Fonction Lambda: $FUNCTION_NAME"
Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host "1. Configurez vos vraies clés API dans Lambda"
Write-Host "2. Testez l'API avec l'endpoint /health"
Write-Host "3. Mettez à jour l'URL de l'API dans votre frontend Amplify"
Write-Host ""
Write-Host "TESTS RAPIDES :" -ForegroundColor Magenta
Write-Host "• Test de santé: curl https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health"
Write-Host "• Test de requête: curl -X POST https://$API_ID.execute-api.$REGION.amazonaws.com/prod/query -H Content-Type: application/json -d '{\"question\":\"Test\",\"model\":\"GPT-4o (Azure)\"}'"
Write-Host ""
Write-Host "N'OUBLIEZ PAS :" -ForegroundColor Red
Write-Host "• Remplacer les clés API par défaut par vos vraies clés !"
Write-Host "• Configurer CORS si nécessaire"
Write-Host "• Surveiller les logs Lambda pour le débogage" 