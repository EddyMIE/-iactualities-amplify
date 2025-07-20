# 🚀 Guide de Déploiement AWS Amplify - IA'ctualités

## 📋 **Prérequis**

1. **Compte AWS** avec accès à Amplify
2. **Repository GitHub** avec votre code
3. **Informations Azure OpenAI** (clé + endpoint)

## 🎯 **Étapes de Déploiement**

### **Étape 1 : Préparer le Repository GitHub**

1. **Poussez votre code** sur GitHub :
   ```bash
   git add .
   git commit -m "Préparation pour AWS Amplify"
   git push origin main
   ```

### **Étape 2 : Connecter à AWS Amplify**

1. **Allez sur** : https://console.aws.amazon.com/amplify/
2. **Cliquez sur** "Nouvelle application" → "Héberger une application web"
3. **Choisissez** "GitHub" comme fournisseur
4. **Autorisez** AWS Amplify à accéder à votre GitHub
5. **Sélectionnez** votre repository

### **Étape 3 : Configuration Automatique**

Amplify va **détecter automatiquement** :
- ✅ **Frontend React** (dossier `iactualities-comparator`)
- ✅ **Backend Python** (fichier `backend_main.py`)
- ✅ **Configuration** (fichier `amplify.yml`)

### **Étape 4 : Variables d'Environnement**

Dans la section "Variables d'environnement", ajoutez :

```
GPT4O_API_KEY=votre_clé_azure_openai
GPT4O_ENDPOINT=votre_endpoint_azure_openai
GPT4O_MINI_API_KEY=votre_clé_azure_openai_mini
GPT4O_MINI_ENDPOINT=votre_endpoint_azure_openai_mini
AWS_ACCESS_KEY_ID=votre_clé_aws
AWS_SECRET_ACCESS_KEY=votre_clé_secrète_aws
AWS_REGION=eu-west-3
```

### **Étape 5 : Déployer**

1. **Cliquez sur** "Déployer"
2. **Attendez** 5-10 minutes
3. **Votre app est en ligne !** 🌐

## 🎉 **Résultat**

- **URL Frontend** : `https://main.xxxxx.amplifyapp.com`
- **URL API** : `https://xxxxx.execute-api.eu-west-3.amazonaws.com/prod`
- **HTTPS automatique** ✅
- **CDN global** ✅
- **Déploiement automatique** ✅

## 🔧 **Configuration Avancée**

### **Domaine Personnalisé**
1. Allez dans "Domain Management"
2. Ajoutez votre domaine
3. Configurez DNS

### **Branches de Développement**
- `main` → Production
- `develop` → Staging
- Déploiement automatique sur push

## 📱 **Test de l'Application**

1. **Ouvrez l'URL** de votre application
2. **Testez l'interface** React
3. **Vérifiez l'API** : `/health`
4. **Testez les modèles** IA

## 🛠️ **Dépannage**

### **Erreur de Build**
- Vérifiez les variables d'environnement
- Consultez les logs de build

### **Erreur API**
- Vérifiez les clés Azure OpenAI
- Testez l'endpoint `/health`

### **Problème CORS**
- Vérifiez la configuration CORS dans `backend_main.py`

## 💰 **Coûts Estimés**

- **Amplify** : Gratuit (1,000 minutes/mois)
- **Lambda** : ~$1-5/mois
- **API Gateway** : ~$1-3/mois
- **Total** : ~$2-8/mois

## 🎯 **Avantages Amplify**

✅ **Interface graphique** simple  
✅ **Déploiement automatique**  
✅ **HTTPS gratuit**  
✅ **CDN global**  
✅ **Monitoring intégré**  
✅ **Rollback facile**  
✅ **Variables d'environnement**  
✅ **Domaine personnalisé**  

---

**🚀 Votre application est maintenant prête pour la production !** 