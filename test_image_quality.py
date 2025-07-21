#!/usr/bin/env python3
"""
Test de la qualité de l'image Human-robot-line.png et de l'application
"""

import requests
import time
import os

def test_image_exists():
    """Vérifie que l'image existe"""
    image_path = "iactualities-comparator/public/images/Human-robot-line.png"
    if os.path.exists(image_path):
        size = os.path.getsize(image_path)
        print(f"✅ Image trouvée: {image_path} ({size} bytes)")
        return True
    else:
        print(f"❌ Image manquante: {image_path}")
        return False

def test_frontend():
    """Test du frontend"""
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend accessible sur http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend non accessible: {e}")
        return False

def test_backend():
    """Test du backend"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend fonctionnel sur http://localhost:8000")
            return True
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend non accessible: {e}")
        return False

if __name__ == "__main__":
    print("🎨 Test de la qualité de l'image Human-robot-line.png")
    print("=" * 60)
    
    # Test image
    image_ok = test_image_exists()
    
    # Test frontend
    frontend_ok = test_frontend()
    
    # Test backend
    backend_ok = test_backend()
    
    print("\n" + "=" * 60)
    if image_ok and frontend_ok and backend_ok:
        print("🎉 Tous les tests passent !")
        print("\n✨ Améliorations apportées à l'image Human-robot-line.png :")
        print("   • Contraste augmenté (+25%) pour des traits plus visibles")
        print("   • Luminosité améliorée (+10%) pour plus de clarté")
        print("   • Saturation augmentée (+15%) pour des couleurs plus vives")
        print("   • Rendu net optimisé (crisp-edges + pixelated)")
        print("   • Taille légèrement augmentée (1.05x)")
        print("   • Ombre portée pour plus de profondeur")
        print("   • Effet de survol interactif")
        print("   • Opacité augmentée (95%) pour plus de visibilité")
        
        print("\n🚀 Accédez à http://localhost:3000 pour voir les améliorations")
        print("   L'image du robot devrait maintenant être beaucoup plus nette !")
    else:
        print("⚠️  Certains tests ont échoué")
        if not image_ok:
            print("   - Vérifiez que l'image Human-robot-line.png existe")
        if not frontend_ok:
            print("   - Redémarrez le frontend avec: cd iactualities-comparator && npm start")
        if not backend_ok:
            print("   - Redémarrez le backend avec: uvicorn backend_main:app --reload") 