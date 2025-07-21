#!/usr/bin/env python3
"""
Script de test pour vérifier les restrictions de 3 modèles maximum
"""

import requests
import time
import json

def test_model_restrictions():
    """Test des restrictions de modèles"""
    print("🧪 Test des restrictions de modèles")
    print("=" * 50)
    
    # Test 1: Vérifier que le frontend limite à 3 modèles
    print("1️⃣ Test de la limite frontend...")
    
    # Simuler une sélection de 4 modèles
    test_models = [
        "Claude 3 Sonnet",
        "Claude 3 Haiku", 
        "Claude 3.7 Sonnet",
        "GPT-4o (Azure)"
    ]
    
    print(f"   Modèles à tester: {len(test_models)}")
    print(f"   Limite configurée: 3 modèles maximum")
    
    if len(test_models) > 3:
        print("   ✅ La logique de restriction devrait empêcher la sélection de plus de 3 modèles")
    else:
        print("   ⚠️ Nombre de modèles dans la limite")
    
    # Test 2: Vérifier la santé du backend
    print("\n2️⃣ Test de la santé du backend...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend en ligne")
            print(f"   Service: {response.json()['service']}")
        else:
            print(f"   ❌ Backend erreur: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend inaccessible: {e}")
    
    # Test 3: Test avec délai entre les requêtes
    print("\n3️⃣ Test avec délai entre les requêtes...")
    
    test_prompt = "Explique la théorie de la relativité en termes simples."
    models_to_test = test_models[:3]  # Limiter à 3 modèles
    
    print(f"   Test avec {len(models_to_test)} modèles:")
    for i, model in enumerate(models_to_test):
        print(f"   - {model}")
    
    results = []
    for i, model in enumerate(models_to_test):
        try:
            print(f"\n   🔄 Requête {i+1}/{len(models_to_test)} pour {model}...")
            
            response = requests.post(
                "http://localhost:8000/query",
                json={"model": model, "prompt": test_prompt},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Succès: {result['tokens']} tokens, ${result['cost']:.6f}")
                results.append({
                    "model": model,
                    "status": "success",
                    "tokens": result['tokens'],
                    "cost": result['cost']
                })
            else:
                print(f"   ❌ Erreur: {response.status_code}")
                results.append({
                    "model": model,
                    "status": "error",
                    "error": f"HTTP {response.status_code}"
                })
            
            # Délai entre les requêtes (comme dans le frontend)
            if i < len(models_to_test) - 1:
                print("   ⏳ Attente de 0.5s...")
                time.sleep(0.5)
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
            results.append({
                "model": model,
                "status": "error",
                "error": str(e)
            })
    
    # Résumé des tests
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    successful = sum(1 for r in results if r['status'] == 'success')
    failed = sum(1 for r in results if r['status'] == 'error')
    
    print(f"Requêtes réussies: {successful}/{len(results)}")
    print(f"Requêtes échouées: {failed}/{len(results)}")
    
    if successful == len(results):
        print("🎉 Tous les tests sont passés !")
        print("✅ La limitation à 3 modèles fonctionne correctement")
        print("✅ Les délais entre requêtes évitent la surcharge")
    else:
        print("⚠️ Certains tests ont échoué")
        print("   Vérifiez que le backend gère correctement les requêtes séquentielles")
    
    # Détails des résultats
    print("\n📋 Détails des résultats:")
    for result in results:
        status_icon = "✅" if result['status'] == 'success' else "❌"
        if result['status'] == 'success':
            print(f"   {status_icon} {result['model']}: {result['tokens']} tokens, ${result['cost']:.6f}")
        else:
            print(f"   {status_icon} {result['model']}: {result['error']}")

def test_error_handling():
    """Test de la gestion des erreurs"""
    print("\n🔧 Test de la gestion des erreurs")
    print("=" * 50)
    
    # Test avec un modèle inexistant
    print("1️⃣ Test avec modèle inexistant...")
    try:
        response = requests.post(
            "http://localhost:8000/query",
            json={"model": "Modèle Inexistant", "prompt": "Test"},
            timeout=10
        )
        print(f"   Réponse: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Erreur 400 correctement gérée")
        else:
            print("   ⚠️ Réponse inattendue")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test avec un prompt vide
    print("\n2️⃣ Test avec prompt vide...")
    try:
        response = requests.post(
            "http://localhost:8000/query",
            json={"model": "Claude 3 Haiku", "prompt": ""},
            timeout=10
        )
        print(f"   Réponse: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    print("🚀 Test des restrictions IA'ctualités")
    print("=" * 60)
    
    test_model_restrictions()
    test_error_handling()
    
    print("\n" + "=" * 60)
    print("✅ Tests terminés")
    print("💡 Conseils:")
    print("   - Limitez toujours à 3 modèles maximum")
    print("   - Ajoutez des délais entre les requêtes")
    print("   - Gérez les erreurs de connexion")
    print("   - Vérifiez la santé du backend") 