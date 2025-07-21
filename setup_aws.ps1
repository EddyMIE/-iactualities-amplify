# 🚀 Script de Configuration AWS - IA'ctualités
# Configuration des variables d'environnement et lancement du déploiement

Write-Host "Configuration AWS pour IA'ctualites..." -ForegroundColor Green
Write-Host ""

# Demande des variables d'environnement
Write-Host "Configuration des variables d'environnement Azure OpenAI..." -ForegroundColor Yellow
Write-Host ""

$AzureOpenAIKey = Read-Host "Entrez votre clé Azure OpenAI"
$AzureOpenAIEndpoint = Read-Host "Entrez votre endpoint Azure OpenAI (ex: https://your-resource.openai.azure.com/)"

# Validation des entrées
if (-not $AzureOpenAIKey -or -not $AzureOpenAIEndpoint) {
    Write-Host "❌ Erreur: Les variables Azure OpenAI sont requises" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Variables configurees avec succes !" -ForegroundColor Green
Write-Host ""

# Lancement du déploiement
Write-Host "Lancement du deploiement AWS..." -ForegroundColor Cyan
Write-Host ""

# Exécution du script de déploiement
& .\deploy_aws.ps1 -AzureOpenAIKey $AzureOpenAIKey -AzureOpenAIEndpoint $AzureOpenAIEndpoint

Write-Host ""
Write-Host "Deploiement termine !" -ForegroundColor Green
Write-Host "Consultez le fichier README_AWS_DEPLOYMENT.md pour les URLs finales" -ForegroundColor Cyan 