#!/usr/bin/env python3
"""
Script de test pour l'amélioration de prompts
"""

import requests
import json

def test_improve_prompt():
    """Test de l'endpoint d'amélioration de prompts"""
    
    # URL du backend
    base_url = "http://localhost:8000"
    
    # Tests avec différents types de prompts
    test_prompts = [
        "Comparer React et Vue",
        "Analyser l'impact du changement climatique",
        "Créer un plan de marketing digital",
        "Rechercher les dernières innovations en IA",
        "Calculer le ROI d'un investissement",
        "Expliquer la blockchain"
    ]
    
    print("🧪 Test de l'amélioration de prompts")
    print("=" * 50)
    
    for i, original_prompt in enumerate(test_prompts, 1):
        print(f"\n📝 Test {i}: '{original_prompt}'")
        
        try:
            # Appel à l'endpoint d'amélioration
            response = requests.post(
                f"{base_url}/improve-prompt",
                json={"prompt": original_prompt},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                improved_prompt = result.get("improved_prompt", "")
                
                print(f"✅ Succès!")
                print(f"📤 Original: {original_prompt}")
                print(f"📥 Amélioré: {improved_prompt}")
                
                # Vérification que le prompt a été amélioré
                if improved_prompt != original_prompt and len(improved_prompt) > len(original_prompt):
                    print(f"🎯 Amélioration confirmée (+{len(improved_prompt) - len(original_prompt)} caractères)")
                else:
                    print(f"⚠️ Pas d'amélioration détectée")
                    
            else:
                print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Tests terminés")

if __name__ == "__main__":
    test_improve_prompt() 