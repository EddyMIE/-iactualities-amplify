# Script de déploiement complet automatique
# Déploie Lambda + API Gateway + Configuration complète

Write-Host "🚀 DÉPLOIEMENT COMPLET AUTOMATIQUE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Variables
$FUNCTION_NAME = "iactualities-backend"
$REGION = "eu-west-3"
$RUNTIME = "python3.11"
$HANDLER = "lambda_function.lambda_handler"
$ROLE_NAME = "iactualities-lambda-role"
$API_NAME = "iactualities-api"

# Couleurs pour les messages
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "Info: $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }

# Vérification AWS CLI
Write-Info "Vérification d'AWS CLI..."
try {
    $AWS_VERSION = aws --version
    Write-Success "AWS CLI détecté: $AWS_VERSION"
} catch {
    Write-Error "AWS CLI non trouvé. Installez-le d'abord."
    exit 1
}

# Vérification de la configuration AWS
Write-Info "Vérification de la configuration AWS..."
try {
    $AWS_IDENTITY = aws sts get-caller-identity --query "Account" --output text
    Write-Success "Compte AWS configuré: $AWS_IDENTITY"
} catch {
    Write-Error "AWS CLI non configuré. Exécutez 'aws configure' d'abord."
    exit 1
}

# ÉTAPE 1: Créer le rôle IAM
Write-Info "ÉTAPE 1: Création du rôle IAM pour Lambda..."

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
    # Vérifier si le rôle existe déjà
    aws iam get-role --role-name $ROLE_NAME 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Rôle IAM '$ROLE_NAME' existe déjà"
    } else {
        # Créer le rôle
        aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json
        
        # Attacher les politiques nécessaires
        aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AWSBedrockFullAccess
        
        Write-Success "Rôle IAM créé avec succès"
    }
} catch {
    Write-Error "Erreur lors de la création du rôle IAM: $_"
    exit 1
}

# ÉTAPE 2: Créer le package de déploiement
Write-Info "ÉTAPE 2: Création du package de déploiement..."

# Créer le dossier temporaire
if (Test-Path "lambda-package") { Remove-Item "lambda-package" -Recurse -Force }
New-Item -ItemType Directory -Name "lambda-package"

# Copier les fichiers
Copy-Item "lambda_function.py" "lambda-package/"
Copy-Item "lambda_requirements.txt" "lambda-package/requirements.txt"

# Installer les dépendances
Write-Info "Installation des dépendances Python..."
Set-Location "lambda-package"
pip install -r requirements.txt -t . --quiet
Remove-Item requirements.txt
Set-Location ..

# Créer le ZIP
Compress-Archive -Path "lambda-package\*" -DestinationPath "lambda-deployment.zip" -Force

Write-Success "Package de déploiement créé"

# ÉTAPE 3: Attendre que le rôle soit disponible
Write-Info "ÉTAPE 3: Attente de la propagation du rôle IAM..."
Start-Sleep -Seconds 15

# ÉTAPE 4: Créer la fonction Lambda
Write-Info "ÉTAPE 4: Création de la fonction Lambda..."

try {
    # Vérifier si la fonction existe déjà
    aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Fonction Lambda '$FUNCTION_NAME' existe déjà, mise à jour..."
        aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://lambda-deployment.zip --region $REGION
    } else {
        # Créer la fonction
        aws lambda create-function `
            --function-name $FUNCTION_NAME `
            --runtime $RUNTIME `
            --role "arn:aws:iam::$AWS_IDENTITY`:role/$ROLE_NAME" `
            --handler $HANDLER `
            --zip-file fileb://lambda-deployment.zip `
            --timeout 30 `
            --memory-size 512 `
            --region $REGION
    }
    
    Write-Success "Fonction Lambda créée/mise à jour avec succès"
} catch {
    Write-Error "Erreur lors de la création de la fonction Lambda: $_"
    exit 1
}

# ÉTAPE 5: Configurer les variables d'environnement
Write-Info "ÉTAPE 5: Configuration des variables d'environnement..."

$SECRETS = @{
    "AZURE_OPENAI_API_KEY" = "votre_clé_azure_openai"
    "AZURE_OPENAI_ENDPOINT" = "votre_endpoint_azure_openai"
    "AZURE_OPENAI_DEPLOYMENT_NAME" = "gpt-4o"
    "ANTHROPIC_API_KEY" = "votre_clé_anthropic"
    "CUSTOM_AWS_ACCESS_KEY_ID" = "votre_clé_aws_access"
    "CUSTOM_AWS_SECRET_ACCESS_KEY" = "votre_clé_aws_secret"
}

$ENV_VARS = $SECRETS.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" } | Join-String -Separator ","

try {
    aws lambda update-function-configuration `
        --function-name $FUNCTION_NAME `
        --environment Variables=$ENV_VARS `
        --region $REGION
    
    Write-Success "Variables d'environnement configurées"
    Write-Warning "⚠️ N'oubliez pas de remplacer les valeurs par défaut par vos vraies clés API !"
} catch {
    Write-Error "Erreur lors de la configuration des variables d'environnement: $_"
}

# ÉTAPE 6: Créer l'API Gateway
Write-Info "ÉTAPE 6: Création de l'API Gateway..."

try {
    # Vérifier si l'API existe déjà
    $API_ID = aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text
    if ($API_ID) {
        Write-Warning "API '$API_NAME' existe déjà avec l'ID: $API_ID"
    } else {
        # Créer l'API
        $API_ID = aws apigateway create-rest-api `
            --name $API_NAME `
            --description "API backend pour l'application de comparaison d'IA" `
            --region $REGION `
            --query "id" `
            --output text
        
        Write-Success "API Gateway créée avec l'ID: $API_ID"
    }
} catch {
    Write-Error "Erreur lors de la création de l'API Gateway: $_"
    exit 1
}

# ÉTAPE 7: Configurer les ressources et méthodes
Write-Info "ÉTAPE 7: Configuration des ressources et méthodes..."

try {
    # Récupérer l'ID de la ressource racine
    $ROOT_RESOURCE_ID = aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/'].id" --output text
    
    # Créer la ressource /query
    $QUERY_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "query" `
        --region $REGION `
        --query "id" `
        --output text
    
    # Créer la méthode POST sur /query
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
    
    # Créer la ressource /health
    $HEALTH_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "health" `
        --region $REGION `
        --query "id" `
        --output text
    
    # Créer la méthode GET sur /health
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
    
    Write-Success "Ressources et méthodes configurées"
} catch {
    Write-Error "Erreur lors de la configuration des ressources: $_"
    exit 1
}

# ÉTAPE 8: Ajouter les permissions Lambda
Write-Info "ÉTAPE 8: Configuration des permissions Lambda..."

try {
    aws lambda add-permission `
        --function-name $FUNCTION_NAME `
        --statement-id apigateway-invoke `
        --action lambda:InvokeFunction `
        --principal apigateway.amazonaws.com `
        --region $REGION
    
    Write-Success "Permissions Lambda configurées"
} catch {
    Write-Warning "Permissions déjà configurées ou erreur (peut être ignorée)"
}

# ÉTAPE 9: Déployer l'API
Write-Info "ÉTAPE 9: Déploiement de l'API..."

try {
    aws apigateway create-deployment `
        --rest-api-id $API_ID `
        --stage-name "prod" `
        --region $REGION
    
    Write-Success "API déployée sur le stage 'prod'"
} catch {
    Write-Error "Erreur lors du déploiement: $_"
    exit 1
}

# ÉTAPE 10: Nettoyage
Write-Info "ÉTAPE 10: Nettoyage des fichiers temporaires..."
Remove-Item "lambda-package" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "lambda-deployment.zip" -ErrorAction SilentlyContinue
Remove-Item "trust-policy.json" -ErrorAction SilentlyContinue

# RÉSULTATS FINAUX
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT COMPLET TERMINÉ !" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 INFORMATIONS IMPORTANTES :" -ForegroundColor Yellow
Write-Host "• API ID: $API_ID"
Write-Host "• URL de l'API: https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
Write-Host "• Endpoint /query: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/query"
Write-Host "• Endpoint /health: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health"
Write-Host "• Fonction Lambda: $FUNCTION_NAME"
Write-Host ""
Write-Host "🔧 PROCHAINES ÉTAPES :" -ForegroundColor Cyan
Write-Host "1. Configurez vos vraies clés API dans Lambda"
Write-Host "2. Testez l'API avec l'endpoint /health"
Write-Host "3. Mettez à jour l'URL de l'API dans votre frontend Amplify"
Write-Host ""
Write-Host "🧪 TESTS RAPIDES :" -ForegroundColor Magenta
Write-Host "• Test de santé: curl https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health"
Write-Host "• Test de requête: curl -X POST https://$API_ID.execute-api.$REGION.amazonaws.com/prod/query -H 'Content-Type: application/json' -d '{\"question\":\"Test\",\"model\":\"GPT-4o (Azure)\"}'"
Write-Host ""
Write-Host "⚠️ N'OUBLIEZ PAS :" -ForegroundColor Red
Write-Host "• Remplacer les clés API par défaut par vos vraies clés !"
Write-Host "• Configurer CORS si nécessaire"
Write-Host "• Surveiller les logs Lambda pour le débogage" 