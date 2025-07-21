# 🚀 Déploiement AWS - Guide de Démarrage Rapide

## 🎯 **Objectif : Déployer sans changer votre interface React/TSX**

**Votre interface React reste exactement la même !** ✅

## 📋 **Prérequis**

1. **Accès AWS** (déjà disponible dans votre entreprise)
2. **AWS CLI** installé et configuré
3. **Node.js** et **npm** installés
4. **Python 3.11** installé

## 🔧 **Étape 1 : Configuration AWS CLI**

```bash
# Configuration avec vos accès entreprise
aws configure
# AWS Access Key ID: [VOTRE_ACCESS_KEY]
# AWS Secret Access Key: [VOTRE_SECRET_KEY]
# Default region name: eu-west-3
# Default output format: json
```

## 🚀 **Étape 2 : Déploiement Automatique**

### **Option A : Script Automatique (Recommandé)**

```bash
# Rendre le script exécutable
chmod +x deploy_aws.sh

# Configuration des variables d'environnement Azure
export AZURE_OPENAI_KEY="votre_clé_azure"
export AZURE_OPENAI_ENDPOINT="votre_endpoint_azure"

# Lancement du déploiement
./deploy_aws.sh
```

### **Option B : Déploiement Manuel**

```bash
# 1. Installation Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configuration Amplify
amplify configure

# 3. Initialisation dans le frontend
cd iactualities-comparator
amplify init

# 4. Déploiement du backend (voir guide complet)
# ... (suivez le guide aws_deployment_guide_complete.md)
```

## 🎨 **Étape 3 : Configuration Frontend**

### **Mise à jour de l'URL API**

Modifiez votre fichier de configuration API pour pointer vers AWS :

```typescript
// iactualities-comparator/src/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};
```

### **Variables d'Environnement**

```bash
# Dans iactualities-comparator/.env.production
REACT_APP_API_URL=https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod
```

## 🧪 **Étape 4 : Test du Déploiement**

### **Test de l'API**

```bash
# Test de santé
curl -X GET https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod/health

# Test de requête
curl -X POST https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod/query \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Claude 3 Sonnet",
    "prompt": "Bonjour, comment allez-vous ?"
  }'
```

### **Test du Frontend**

1. Ouvrez votre application Amplify
2. Testez la sélection de modèles
3. Testez l'envoi de questions
4. Vérifiez les réponses

## 📊 **URLs Finales**

Après le déploiement, vous aurez :

- **Frontend** : `https://main.XXXXXXXXX.amplifyapp.com`
- **API** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod`
- **Documentation** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod/docs`

## 🔐 **Sécurité**

### **Variables d'Environnement Sensibles**

```bash
# Dans la console AWS Lambda, configurez :
AZURE_OPENAI_KEY=votre_clé_azure_réelle
AZURE_OPENAI_ENDPOINT=votre_endpoint_azure_réel
```

### **CORS Configuration**

Le script configure automatiquement CORS pour permettre l'accès depuis Amplify.

## 💰 **Coûts Estimés**

- **Lambda** : ~$0.20/mois (1000 invocations)
- **API Gateway** : ~$3.50/mois (1M requêtes)
- **Amplify** : ~$1-5/mois (build + transfert)
- **Total** : ~$5-10/mois

## 🚨 **Dépannage**

### **Erreur Lambda**

```bash
# Vérification des logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/iactualites-api"

# Logs récents
aws logs filter-log-events \
    --log-group-name "/aws/lambda/iactualites-api" \
    --start-time $(date -d '1 hour ago' +%s)000
```

### **Erreur Amplify**

```bash
# Vérification du build
cd iactualities-comparator
npm run build

# Vérification des variables d'environnement
cat .env.production
```

### **Erreur API Gateway**

```bash
# Test de l'API
curl -v -X GET https://YOUR_API_ID.execute-api.eu-west-3.amazonaws.com/prod/health
```

## 🎯 **Résultat Final**

✅ **Votre interface React/TSX reste exactement la même**
✅ **Backend déployé sur AWS Lambda**
✅ **API Gateway configuré avec CORS**
✅ **Frontend hébergé sur AWS Amplify**
✅ **Monitoring CloudWatch configuré**

## 📞 **Support**

En cas de problème :

1. Vérifiez les logs CloudWatch
2. Testez chaque composant individuellement
3. Consultez le guide complet : `aws_deployment_guide_complete.md`

**Votre application est maintenant en production sur AWS !** 🚀 