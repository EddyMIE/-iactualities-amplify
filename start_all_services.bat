@echo off
echo 🚀 Démarrage de tous les services IA'ctualités
echo ==============================================

echo.
echo 📱 Démarrage du frontend React...
cd iactualities-comparator
start "Frontend React" cmd /k "npm start"

echo.
echo 🔌 Démarrage du backend FastAPI...
cd ..
start "Backend FastAPI" cmd /k "uvicorn backend_main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ⏳ Attente du démarrage des services...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Services démarrés !
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:8000
echo 📚 Documentation: http://localhost:8000/docs
echo.
echo 🎨 Image du robot améliorée avec:
echo    • Contraste +25%% pour des traits plus visibles
echo    • Luminosité +10%% pour plus de clarté
echo    • Saturation +15%% pour des couleurs plus vives
echo    • Rendu net optimisé
echo    • Effet de survol interactif
echo.
echo 🌐 Ouvrez http://localhost:3000 dans votre navigateur
pause 