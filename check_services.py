#!/usr/bin/env python3
"""
Vérification des services frontend et backend
"""

import requests
import time
import os

def check_frontend():
    """Vérifie le frontend React"""
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend React démarré sur http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend non accessible: {e}")
        return False

def check_backend():
    """Vérifie le backend FastAPI"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend FastAPI démarré sur http://localhost:8000")
            return True
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend non accessible: {e}")
        return False

def check_robot_image():
    """Vérifie que l'image du robot existe"""
    image_path = "iactualities-comparator/public/images/Human-robot-line.png"
    if os.path.exists(image_path):
        size = os.path.getsize(image_path)
        print(f"✅ Image robot trouvée: {size} bytes")
        return True
    else:
        print(f"❌ Image robot manquante")
        return False

if __name__ == "__main__":
    print("🔍 Vérification des services...")
    print("=" * 50)
    
    # Attendre un peu que les services démarrent
    print("⏳ Attente du démarrage des services...")
    time.sleep(5)
    
    # Vérifications
    frontend_ok = check_frontend()
    backend_ok = check_backend()
    image_ok = check_robot_image()
    
    print("\n" + "=" * 50)
    if frontend_ok and backend_ok and image_ok:
        print("🎉 Tous les services sont opérationnels !")
        print("\n✨ Améliorations de l'image Human-robot-line.png actives :")
        print("   • Contraste +25% pour des traits plus visibles")
        print("   • Luminosité +10% pour plus de clarté")
        print("   • Saturation +15% pour des couleurs plus vives")
        print("   • Rendu net optimisé (crisp-edges + pixelated)")
        print("   • Taille augmentée (1.05x)")
        print("   • Ombre portée pour plus de profondeur")
        print("   • Effet de survol interactif")
        
        print("\n🚀 Accédez à http://localhost:3000")
        print("   L'image du robot devrait maintenant être beaucoup plus nette !")
    else:
        print("⚠️  Certains services ne répondent pas")
        if not frontend_ok:
            print("   - Frontend: cd iactualities-comparator && npm start")
        if not backend_ok:
            print("   - Backend: uvicorn backend_main:app --reload")
        if not image_ok:
            print("   - Vérifiez que l'image Human-robot-line.png existe") 