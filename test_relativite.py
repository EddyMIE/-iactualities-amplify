#!/usr/bin/env python3
"""
Test spécifique pour l'amélioration du prompt sur la théorie de la relativité
"""

import requests
import json

def test_relativite():
    """Test de l'amélioration du prompt sur la théorie de la relativité"""
    
    base_url = "http://localhost:8000"
    
    # Test avec le prompt de l'utilisateur
    test_prompt = "Explique la théorie de la relativité en termes simples."
    
    print("🧪 Test spécifique : Théorie de la relativité")
    print("=" * 60)
    print(f"📤 Prompt original: {test_prompt}")
    print()
    
    try:
        response = requests.post(
            f"{base_url}/improve-prompt",
            json={"prompt": test_prompt},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            improved_prompt = result['improved_prompt']
            
            print("📥 Prompt amélioré:")
            print("-" * 40)
            print(improved_prompt)
            print("-" * 40)
            
            # Vérifications
            print("\n✅ Vérifications:")
            print(f"🔍 Longueur originale: {len(test_prompt)} caractères")
            print(f"🔍 Longueur améliorée: {len(improved_prompt)} caractères")
            print(f"📈 Amélioration: +{len(improved_prompt) - len(test_prompt)} caractères")
            
            # Vérifier qu'il ne commence pas par "Voici"
            if not improved_prompt.lower().startswith("voici"):
                print("✅ Ne commence pas par 'Voici' ✓")
            else:
                print("❌ Commence encore par 'Voici' ✗")
            
            # Vérifier qu'il contient [CONTEXTE]
            if "[CONTEXTE]" in improved_prompt:
                print("✅ Contient [CONTEXTE] ✓")
            else:
                print("❌ Ne contient pas [CONTEXTE] ✗")
                
            # Vérifier qu'il contient [TÂCHE]
            if "[TÂCHE]" in improved_prompt:
                print("✅ Contient [TÂCHE] ✓")
            else:
                print("❌ Ne contient pas [TÂCHE] ✗")
                
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Test terminé")

if __name__ == "__main__":
    test_relativite() 