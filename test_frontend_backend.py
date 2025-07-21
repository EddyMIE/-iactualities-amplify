#!/usr/bin/env python3
"""
Test de vérification du backend après suppression des références internet
"""

import requests
import json
import time

def test_backend_health():
    """Test de santé du backend"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Backend en ligne")
            return True
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Impossible de contacter le backend: {e}")
        return False

def test_azure_models():
    """Test des modèles Azure sans internet"""
    models_to_test = ["GPT-4o (Azure)", "GPT-4o Mini (Azure)"]
    
    for model in models_to_test:
        print(f"\n🧪 Test du modèle: {model}")
        try:
            response = requests.post(
                "http://localhost:8000/query",
                json={
                    "model": model,
                    "prompt": "Dis-moi bonjour en français"
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Succès!")
                print(f"📝 Réponse: {data['response'][:100]}...")
                print(f"💰 Coût: ${data['cost']}")
                print(f"🔢 Tokens: {data['tokens']}")
                
                # Vérifier qu'il n'y a pas de propriété hasInternet
                if 'hasInternet' in data:
                    print(f"⚠️  ATTENTION: Propriété hasInternet encore présente!")
                else:
                    print(f"✅ Pas de propriété hasInternet ✓")
                    
            else:
                print(f"❌ Erreur {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Erreur: {e}")

def test_prompt_improvement():
    """Test de l'amélioration de prompts"""
    print(f"\n🧪 Test d'amélioration de prompt")
    try:
        response = requests.post(
            "http://localhost:8000/improve-prompt",
            json={
                "prompt": "Explique la théorie de la relativité en termes simples."
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Amélioration réussie!")
            print(f"📝 Prompt amélioré: {data['improved_prompt'][:100]}...")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🧪 Test de vérification du backend")
    print("=" * 50)
    
    # Test de santé
    if not test_backend_health():
        print("\n❌ Backend non disponible. Arrêt des tests.")
        exit(1)
    
    # Test des modèles Azure
    test_azure_models()
    
    # Test d'amélioration de prompts
    test_prompt_improvement()
    
    print("\n" + "=" * 50)
    print("�� Tests terminés") 