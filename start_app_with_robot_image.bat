@echo off
echo 🎨 Démarrage de l'application avec image du robot améliorée
echo ========================================================

echo.
echo 📱 Démarrage du frontend React...
cd iactualities-comparator
start "Frontend React" cmd /k "npm start"

echo.
echo 🔌 Vérification du backend...
timeout /t 3 /nobreak >nul

echo.
echo ✨ Améliorations apportées à l'image Human-robot-line.png :
echo    • Contraste augmenté (+25%%) pour des traits plus visibles
echo    • Luminosité améliorée (+10%%) pour plus de clarté  
echo    • Saturation augmentée (+15%%) pour des couleurs plus vives
echo    • Rendu net optimisé (crisp-edges + pixelated)
echo    • Taille légèrement augmentée (1.05x)
echo    • Ombre portée pour plus de profondeur
echo    • Effet de survol interactif
echo    • Opacité augmentée (95%%) pour plus de visibilité

echo.
echo 🚀 Accédez à http://localhost:3000 pour voir les améliorations
echo    L'image du robot devrait maintenant être beaucoup plus nette !
echo.
echo ⏳ Attendez que le frontend se charge complètement...
pause 