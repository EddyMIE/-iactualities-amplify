@echo off
title IA'ctualites - Comparateur de LLM
echo.
echo ========================================================
echo 🤖 IA'ctualites - Comparateur de LLM React
echo ========================================================
echo.

echo 🔍 Vérification de la configuration...
if not exist .env (
    echo ❌ ERREUR: Fichier .env manquant !
    echo.
    echo 📋 Créez un fichier .env avec vos clés API :
    echo    AWS_ACCESS_KEY_ID=votre_cle
    echo    AWS_SECRET_ACCESS_KEY=votre_secret
    echo    AZURE_OPENAI_KEY=votre_cle_azure
    echo    AZURE_OPENAI_ENDPOINT=votre_endpoint
    echo.
    echo 📖 Consultez config_api.txt pour plus de détails
    pause
    exit /b 1
)

echo ✅ Fichier .env trouvé
echo.

echo 🛑 Arrêt des services existants...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /pid %%a /f >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Démarrage du backend IA'ctualités...
start "Backend IA'ctualités" /min uvicorn backend_main:app --host 0.0.0.0 --port 8000 --reload

echo ⏳ Attendre que le backend soit prêt...
timeout /t 6 /nobreak >nul

echo 🎨 Démarrage de l'application React...
cd iactualities-comparator
start "React IA'ctualités" /min npm start

echo.
echo ========================================================
echo ✅ APPLICATION DÉMARRÉE
echo ========================================================
echo 📱 Frontend React : http://localhost:3000
echo 🔌 Backend API    : http://localhost:8000
echo 📚 Documentation  : http://localhost:8000/docs
echo.
echo 🤖 Modèles AWS Bedrock + Azure OpenAI actifs
echo 💰 Coûts réels calculés automatiquement
echo.
echo ⏳ Ouverture automatique dans 8 secondes...
echo ========================================================

timeout /t 8 /nobreak >nul
start http://localhost:3000

echo.
echo 🎉 Application IA'ctualités démarrée avec succès !
echo 📋 Appuyez sur une touche pour quitter ce script...
pause >nul 