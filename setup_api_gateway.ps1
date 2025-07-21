# Script de configuration automatique API Gateway
# Assurez-vous d'avoir AWS CLI configuré et la fonction Lambda créée

Write-Host "🔧 Configuration automatique API Gateway" -ForegroundColor Green

# Variables
$API_NAME = "iactualities-api"
$FUNCTION_NAME = "iactualities-backend"
$REGION = "eu-west-3"

# Couleurs pour les messages
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Blue }

# 1. Récupérer l'ID de l'API
Write-Info "Récupération de l'ID de l'API..."

try {
    $API_ID = aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text
    if (-not $API_ID) {
        Write-Error "API '$API_NAME' non trouvée. Créez-la d'abord dans la console AWS."
        exit 1
    }
    Write-Success "API trouvée avec l'ID: $API_ID"
} catch {
    Write-Error "Erreur lors de la récupération de l'API: $_"
    exit 1
}

# 2. Récupérer l'ID de la ressource racine
Write-Info "Récupération de l'ID de la ressource racine..."

try {
    $ROOT_RESOURCE_ID = aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/'].id" --output text
    Write-Success "Ressource racine trouvée avec l'ID: $ROOT_RESOURCE_ID"
} catch {
    Write-Error "Erreur lors de la récupération de la ressource racine: $_"
    exit 1
}

# 3. Créer la ressource /query
Write-Info "Création de la ressource /query..."

$QUERY_RESOURCE_CONFIG = @{
    parentId = $ROOT_RESOURCE_ID
    pathPart = "query"
}

$QUERY_RESOURCE_CONFIG | ConvertTo-Json | Out-File -FilePath "query-resource.json" -Encoding UTF8

try {
    $QUERY_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "query" `
        --region $REGION `
        --query "id" `
        --output text
    
    Write-Success "Ressource /query créée avec l'ID: $QUERY_RESOURCE_ID"
} catch {
    Write-Error "Erreur lors de la création de la ressource /query: $_"
    exit 1
}

# 4. Créer la méthode POST sur /query
Write-Info "Création de la méthode POST sur /query..."

$LAMBDA_URI = "arn:aws:apigateway:$REGION`:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION`:`(aws sts get-caller-identity --query Account --output text)`:function:$FUNCTION_NAME/invocations"

$INTEGRATION_REQUEST = @{
    type = "AWS_PROXY"
    integrationHttpMethod = "POST"
    uri = $LAMBDA_URI
}

$INTEGRATION_REQUEST | ConvertTo-Json | Out-File -FilePath "integration-request.json" -Encoding UTF8

try {
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
    
    Write-Success "Méthode POST créée sur /query"
} catch {
    Write-Error "Erreur lors de la création de la méthode POST: $_"
    exit 1
}

# 5. Créer la ressource /health
Write-Info "Création de la ressource /health..."

try {
    $HEALTH_RESOURCE_ID = aws apigateway create-resource `
        --rest-api-id $API_ID `
        --parent-id $ROOT_RESOURCE_ID `
        --path-part "health" `
        --region $REGION `
        --query "id" `
        --output text
    
    Write-Success "Ressource /health créée avec l'ID: $HEALTH_RESOURCE_ID"
} catch {
    Write-Error "Erreur lors de la création de la ressource /health: $_"
    exit 1
}

# 6. Créer la méthode GET sur /health
Write-Info "Création de la méthode GET sur /health..."

try {
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
    
    Write-Success "Méthode GET créée sur /health"
} catch {
    Write-Error "Erreur lors de la création de la méthode GET: $_"
    exit 1
}

# 7. Créer un stage de déploiement
Write-Info "Création du stage de déploiement..."

try {
    aws apigateway create-deployment `
        --rest-api-id $API_ID `
        --stage-name "prod" `
        --region $REGION
    
    Write-Success "Stage 'prod' créé"
} catch {
    Write-Error "Erreur lors de la création du stage: $_"
    exit 1
}

# 8. Nettoyage
Write-Info "Nettoyage des fichiers temporaires..."
Remove-Item "query-resource.json" -ErrorAction SilentlyContinue
Remove-Item "integration-request.json" -ErrorAction SilentlyContinue

# 9. Instructions finales
Write-Host ""
Write-Host "🎉 CONFIGURATION API GATEWAY TERMINÉE !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Informations importantes :" -ForegroundColor Yellow
Write-Host "• API ID: $API_ID"
Write-Host "• URL de l'API: https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
Write-Host "• Endpoint /query: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/query"
Write-Host "• Endpoint /health: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health"
Write-Host ""
Write-Host "🔧 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Testez l'API avec l'endpoint /health"
Write-Host "2. Configurez les variables d'environnement dans Lambda"
Write-Host "3. Mettez à jour l'URL de l'API dans votre frontend"
Write-Host ""
Write-Host "🧪 Test de l'API :" -ForegroundColor Magenta
Write-Host "curl https://$API_ID.execute-api.$REGION.amazonaws.com/prod/health" 