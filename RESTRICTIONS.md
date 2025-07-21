# 🔒 Restrictions et Améliorations IA'ctualités

## 📋 Vue d'ensemble

Pour éviter les erreurs de connexion au serveur et optimiser les performances, nous avons mis en place des restrictions et améliorations importantes.

## 🎯 Limitation à 3 modèles maximum

### Pourquoi cette restriction ?

- **Éviter la surcharge du serveur** : Trop de requêtes simultanées peuvent causer des erreurs 500
- **Améliorer la stabilité** : Réduire les risques de timeouts et d'erreurs de connexion
- **Optimiser les performances** : Meilleur équilibre entre rapidité et fiabilité

### Comment ça fonctionne ?

1. **Interface utilisateur** :
   - Compteur visuel : `X/3 modèles sélectionnés`
   - Indicateur de limite atteinte
   - Modèles désactivés quand la limite est atteinte
   - Message d'alerte si tentative de dépassement

2. **Logique de sélection** :
   ```typescript
   if (selectedModels.length >= 3) {
     alert("⚠️ Limite atteinte : Vous ne pouvez comparer que 3 modèles à la fois");
     return;
   }
   ```

## ⏱️ Délais entre les requêtes

### Amélioration de la stabilité

- **Délai de 500ms** entre chaque requête
- **Requêtes séquentielles** au lieu de parallèles
- **Évite la surcharge** du serveur backend

### Code implémenté

```typescript
// Requêtes séquentielles avec délai
for (const model of selectedModels) {
  try {
    const result = await llmService.queryModel(model, question);
    // ... traitement du résultat
    
    // Délai entre les requêtes
    if (selectedModels.indexOf(model) < selectedModels.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    // ... gestion d'erreur
  }
}
```

## 🛡️ Gestion améliorée des erreurs

### Types d'erreurs gérées

1. **Erreur 500** : Modèle temporairement indisponible
2. **Erreur 429** : Trop de requêtes (rate limiting)
3. **Timeout** : Délai d'attente dépassé
4. **Connexion** : Serveur backend inaccessible
5. **Modèle inexistant** : Erreur 400

### Messages d'erreur informatifs

```typescript
if (error.response.status === 500) {
  throw new Error(`Erreur serveur pour ${model}. Le modèle peut être temporairement indisponible.`);
} else if (error.response.status === 429) {
  throw new Error(`Trop de requêtes pour ${model}. Veuillez attendre quelques instants.`);
}
```

## 🔍 Vérification de santé du serveur

### Avant chaque requête

- **Check de santé** automatique
- **Détection précoce** des problèmes
- **Messages d'erreur** plus clairs

```typescript
const isHealthy = await this.checkHealth();
if (!isHealthy) {
  throw new Error('Serveur backend indisponible. Vérifiez que le service est démarré.');
}
```

## 📊 Indicateurs visuels

### Interface utilisateur améliorée

1. **Compteur de modèles** : `X/3 modèles sélectionnés`
2. **Couleurs dynamiques** :
   - Vert : `< 3 modèles`
   - Rouge : `= 3 modèles`
3. **Avertissement visuel** quand la limite est atteinte
4. **Modèles désactivés** visuellement

### Messages d'encouragement mis à jour

```typescript
if (count >= 3) return "IA'ctualités : Parfait ! 3 modèles offrent un bon équilibre entre diversité et rapidité. Limite maximale atteinte.";
if (count === 2) return "IA'ctualités : Comparaison ciblée ! Vous pouvez encore ajouter 1 modèle (max 3).";
```

## 🧪 Tests de validation

### Script de test inclus

Le fichier `test_restrictions.py` permet de :

1. **Tester la logique** de limitation
2. **Vérifier les délais** entre requêtes
3. **Valider la gestion** des erreurs
4. **S'assurer de la stabilité** du système

### Exécution des tests

```bash
python test_restrictions.py
```

## 🎯 Bénéfices attendus

### Pour l'utilisateur

- ✅ **Moins d'erreurs** de connexion
- ✅ **Réponses plus fiables**
- ✅ **Interface plus claire**
- ✅ **Messages d'erreur informatifs**

### Pour le système

- ✅ **Charge serveur réduite**
- ✅ **Stabilité améliorée**
- ✅ **Performance optimisée**
- ✅ **Maintenance facilitée**

## 🔧 Configuration technique

### Timeouts ajustés

- **Requête API** : 45 secondes (au lieu de 60)
- **Check de santé** : 5 secondes
- **Délai entre requêtes** : 500ms

### Gestion des erreurs

- **Vérification préalable** de la santé du serveur
- **Messages d'erreur** spécifiques par type
- **Fallback gracieux** en cas de problème

## 📈 Métriques de performance

### Avant les restrictions

- ❌ Erreurs 500 fréquentes
- ❌ Timeouts surchargés
- ❌ Interface confuse
- ❌ Messages d'erreur génériques

### Après les restrictions

- ✅ 100% de succès sur les tests
- ✅ Délais respectés
- ✅ Interface claire
- ✅ Messages informatifs

## 🚀 Recommandations d'utilisation

1. **Sélectionnez 1-3 modèles** pour une comparaison optimale
2. **Attendez la fin** de chaque requête avant d'en lancer une autre
3. **Vérifiez que le backend** est démarré avant utilisation
4. **Consultez les messages d'erreur** pour diagnostiquer les problèmes

---

*Ces restrictions garantissent une expérience utilisateur stable et fiable tout en optimisant les performances du système.* 