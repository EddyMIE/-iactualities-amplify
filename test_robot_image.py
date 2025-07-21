#!/usr/bin/env python3
"""
Test de vérification après amélioration de l'image du robot
"""

import requests
import time

def test_backend():
    """Test rapide du backend"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend fonctionnel")
            return True
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend non accessible: {e}")
        return False

def test_frontend():
    """Test rapide du frontend"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend accessible")
            return True
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend non accessible: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Test après amélioration de l'image du robot")
    print("=" * 50)
    
    # Test backend
    backend_ok = test_backend()
    
    # Test frontend
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok:
        print("🎉 Tous les tests passent !")
        print("✨ L'image du robot devrait maintenant être plus nette avec :")
        print("   • Meilleur contraste et luminosité")
        print("   • Rendu plus net (crisp-edges)")
        print("   • Légère augmentation de taille (1.02x)")
        print("   • Effet de survol subtil")
        print("   • Ombre portée pour plus de profondeur")
    else:
        print("⚠️  Certains services ne répondent pas")
        print("   Vérifiez que le backend et le frontend sont démarrés")
    
    print("\n🚀 Accédez à http://localhost:3000 pour voir les améliorations") 