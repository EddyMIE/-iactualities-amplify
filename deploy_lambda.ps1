# Script de déploiement automatique pour Lambda et API Gateway
# Assurez-vous d'avoir AWS CLI configuré

Write-Host "🚀 Déploiement automatique Lambda + API Gateway" -ForegroundColor Green

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
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Blue }

# 1. Créer le rôle IAM pour Lambda
Write-Info "Création du rôle IAM pour Lambda..."

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
    # Créer le rôle
    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json
    
    # Attacher les politiques nécessaires
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AWSBedrockFullAccess
    
    Write-Success "Rôle IAM créé avec succès"
} catch {
    Write-Error "Erreur lors de la création du rôle IAM: $_"
    exit 1
}

# 2. Créer le package de déploiement
Write-Info "Création du package de déploiement..."

# Créer le dossier temporaire
if (Test-Path "lambda-package") { Remove-Item "lambda-package" -Recurse -Force }
New-Item -ItemType Directory -Name "lambda-package"

# Copier les fichiers
Copy-Item "lambda_function.py" "lambda-package/"
Copy-Item "lambda_requirements.txt" "lambda-package/requirements.txt"

# Installer les dépendances
Set-Location "lambda-package"
pip install -r requirements.txt -t .
Remove-Item requirements.txt
Set-Location ..

# Créer le ZIP
Compress-Archive -Path "lambda-package\*" -DestinationPath "lambda-deployment.zip" -Force

Write-Success "Package de déploiement créé"

# 3. Attendre que le rôle soit disponible
Write-Info "Attente de la propagation du rôle IAM..."
Start-Sleep -Seconds 10

# 4. Créer la fonction Lambda
Write-Info "Création de la fonction Lambda..."

try {
    aws lambda create-function `
        --function-name $FUNCTION_NAME `
        --runtime $RUNTIME `
        --role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME" `
        --handler $HANDLER `
        --zip-file fileb://lambda-deployment.zip `
        --timeout 30 `
        --memory-size 512 `
        --region $REGION
    
    Write-Success "Fonction Lambda créée avec succès"
} catch {
    Write-Error "Erreur lors de la création de la fonction Lambda: $_"
    exit 1
}

# 5. Configurer les variables d'environnement
Write-Info "Configuration des variables d'environnement..."

# Récupérer les variables depuis AWS Amplify Secrets Manager
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
} catch {
    Write-Error "Erreur lors de la configuration des variables d'environnement: $_"
}

# 6. Ajouter la permission pour API Gateway
Write-Info "Configuration des permissions API Gateway..."

try {
    aws lambda add-permission `
        --function-name $FUNCTION_NAME `
        --statement-id apigateway-invoke `
        --action lambda:InvokeFunction `
        --principal apigateway.amazonaws.com `
        --region $REGION
    
    Write-Success "Permissions API Gateway configurées"
} catch {
    Write-Error "Erreur lors de la configuration des permissions: $_"
}

# 7. Nettoyage
Write-Info "Nettoyage des fichiers temporaires..."
Remove-Item "lambda-package" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "lambda-deployment.zip" -ErrorAction SilentlyContinue
Remove-Item "trust-policy.json" -ErrorAction SilentlyContinue

# 8. Instructions finales
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes dans API Gateway :" -ForegroundColor Yellow
Write-Host "1. Allez dans API Gateway"
Write-Host "2. Sélectionnez votre API '$API_NAME'"
Write-Host "3. Dans la ressource '/query', cliquez sur 'Créer une méthode'"
Write-Host "4. Choisissez 'POST'"
Write-Host "5. Sélectionnez 'Fonction Lambda'"
Write-Host "6. Tapez '$FUNCTION_NAME' dans le champ Lambda"
Write-Host "7. Cliquez sur 'Créer une méthode'"
Write-Host ""
Write-Host "🔧 N'oubliez pas de configurer vos vraies clés API dans les variables d'environnement !" -ForegroundColor Red
Write-Host ""
Write-Host "📝 ARN de la fonction Lambda :" -ForegroundColor Cyan
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text 