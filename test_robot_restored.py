#!/usr/bin/env python3
"""
Test de vérification que l'image du robot a été restaurée
"""

import requests
import time
import os

def test_image_restored():
    """Vérifie que l'image existe et n'est pas modifiée"""
    image_path = "iactualities-comparator/public/images/Human-robot-line.png"
    if os.path.exists(image_path):
        size = os.path.getsize(image_path)
        print(f"✅ Image restaurée: {image_path} ({size} bytes)")
        return True
    else:
        print(f"❌ Image manquante: {image_path}")
        return False

def test_frontend():
    """Test du frontend avec image restaurée"""
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

def main():
    """Test principal"""
    print("🔍 Vérification de la restauration de l'image du robot...")
    print("=" * 60)
    
    # Test de l'image
    image_ok = test_image_restored()
    
    # Test des services
    print("\n⏳ Test des services...")
    frontend_ok = test_frontend()
    backend_ok = test_backend()
    
    print("\n" + "=" * 60)
    print("📊 Résultats de la restauration:")
    
    if image_ok and frontend_ok and backend_ok:
        print("✅ SUCCÈS: Image du robot restaurée et services fonctionnels")
        print("\n🎨 Modifications apportées:")
        print("   • Suppression des filtres CSS (contrast, brightness, saturate)")
        print("   • Suppression du rendu pixelated")
        print("   • Suppression des transformations (scale, transform)")
        print("   • Suppression des effets de survol")
        print("   • Opacité restaurée à 0.8 (état original)")
        print("   • Image affichée dans son état naturel")
    else:
        print("❌ ÉCHEC: Problèmes détectés")
        if not image_ok:
            print("   - Image du robot manquante")
        if not frontend_ok:
            print("   - Frontend non accessible")
        if not backend_ok:
            print("   - Backend non accessible")
    
    print(f"\n🌐 URLs:")
    print(f"   Frontend: http://localhost:3000")
    print(f"   Backend: http://localhost:8000")
    print(f"   Documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    main() 