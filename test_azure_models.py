#!/usr/bin/env python3
"""
Script de test pour les modèles Azure
"""

import requests
import json

def test_azure_models():
    """Test des modèles Azure"""
    
    base_url = "http://localhost:8000"
    
    # Test avec les modèles Azure
    test_cases = [
        {
            "model": "GPT-4o (Azure)",
            "prompt": "Explique-moi brièvement l'intelligence artificielle"
        },
        {
            "model": "GPT-4o Mini (Azure)", 
            "prompt": "Qu'est-ce que le machine learning ?"
        }
    ]
    
    print("🧪 Test des modèles Azure")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['model']}")
        print(f"Prompt: {test_case['prompt']}")
        
        try:
            response = requests.post(
                f"{base_url}/query",
                json=test_case,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Succès!")
                print(f"📥 Réponse: {result['response'][:100]}...")
                print(f"💰 Coût: ${result['cost']:.6f}")
                print(f"🔗 Internet: {result.get('has_internet', False)}")
            else:
                print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Tests terminés")

if __name__ == "__main__":
    test_azure_models() 