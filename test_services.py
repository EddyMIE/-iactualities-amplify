#!/usr/bin/env python3
"""
Script de test pour vérifier que le frontend et le backend fonctionnent correctement
"""

import requests
import time
import sys

def test_backend():
    """Test du backend"""
    print("🔌 Test du backend...")
    
    try:
        # Test de santé
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend en ligne")
            print(f"   Service: {response.json()['service']}")
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
            
        # Test de l'endpoint principal
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint principal OK")
            print(f"   Version: {data['version']}")
            print(f"   Modèles Bedrock: {len(data['models']['bedrock'])}")
            print(f"   Modèles Azure: {len(data['models']['azure'])}")
        else:
            print(f"❌ Endpoint principal erreur: {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Backend non accessible - vérifiez qu'il est démarré")
        return False
    except Exception as e:
        print(f"❌ Erreur backend: {e}")
        return False

def test_frontend():
    """Test du frontend"""
    print("\n📱 Test du frontend...")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend en ligne")
            print(f"   Taille réponse: {len(response.content)} bytes")
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Frontend non accessible - vérifiez qu'il est démarré")
        return False
    except Exception as e:
        print(f"❌ Erreur frontend: {e}")
        return False

def test_api_query():
    """Test d'une requête API"""
    print("\n🤖 Test d'une requête API...")
    
    try:
        # Test avec un prompt simple
        test_data = {
            "model": "Claude 3 Haiku",
            "prompt": "Dis-moi bonjour en français"
        }
        
        response = requests.post(
            "http://localhost:8000/query",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Requête API réussie")
            print(f"   Tokens: {result['tokens']}")
            print(f"   Coût: ${result['cost']:.6f}")
            print(f"   Réponse: {result['response'][:100]}...")
        else:
            print(f"❌ Erreur API: {response.status_code}")
            print(f"   Détail: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Erreur test API: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Test des services IA'ctualités")
    print("=" * 50)
    
    # Attendre un peu que les services démarrent
    print("⏳ Attente du démarrage des services...")
    time.sleep(3)
    
    # Tests
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    api_ok = test_api_query() if backend_ok else False
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    print(f"Backend:  {'✅ OK' if backend_ok else '❌ ERREUR'}")
    print(f"Frontend: {'✅ OK' if frontend_ok else '❌ ERREUR'}")
    print(f"API:      {'✅ OK' if api_ok else '❌ ERREUR'}")
    
    if backend_ok and frontend_ok and api_ok:
        print("\n🎉 Tous les services fonctionnent correctement !")
        print("🌐 Frontend: http://localhost:3000")
        print("🔌 Backend: http://localhost:8000")
        print("📚 Documentation: http://localhost:8000/docs")
        return 0
    else:
        print("\n⚠️ Certains services ont des problèmes")
        if not backend_ok:
            print("   - Vérifiez que le backend est démarré: uvicorn backend_main:app --host 0.0.0.0 --port 8000 --reload")
        if not frontend_ok:
            print("   - Vérifiez que le frontend est démarré: cd iactualities-comparator && npm start")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 