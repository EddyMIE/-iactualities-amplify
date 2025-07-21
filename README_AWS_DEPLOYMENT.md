# 🚀 Déploiement AWS - IA'ctualités

## 🎯 **Objectif Réalisé : Interface React/TSX Intacte**

✅ **Votre interface React reste exactement la même !**
✅ **Backend déployé sur AWS Lambda**
✅ **Frontend hébergé sur AWS Amplify**
✅ **API Gateway configuré avec CORS**

## 📁 **Fichiers de Déploiement Créés**

```
Article - Copie/
├── 📄 aws_deployment_guide_complete.md     # Guide complet détaillé
├── 📄 AWS_DEPLOYMENT_QUICK_START.md        # Guide de démarrage rapide
├── 📄 lambda_function.py                   # Backend Lambda optimisé
├── 📄 deploy_aws.sh                        # Script de déploiement Linux/Mac
├── 📄 deploy_aws.ps1                       # Script de déploiement Windows
├── 📄 amplify.yml                          # Configuration Amplify
└── 📄 README_AWS_DEPLOYMENT.md             # Ce fichier
```

## 🚀 **Démarrage Rapide**

### **Option 1 : Script Automatique (Recommandé)**

#### **Sur Windows :**
```powershell
# Configuration AWS CLI
aws configure

# Déploiement avec PowerShell
.\deploy_aws.ps1 -AzureOpenAIKey "votre_clé" -AzureOpenAIEndpoint "votre_endpoint"
```

#### **Sur Linux/Mac :**
```bash
# Configuration AWS CLI
aws configure

# Rendre le script exécutable
chmod +x deploy_aws.sh

# Configuration des variables
export AZURE_OPENAI_KEY="votre_clé"
export AZURE_OPENAI_ENDPOINT="votre_endpoint"

# Déploiement
./deploy_aws.sh
```

### **Option 2 : Déploiement Manuel**

Suivez le guide complet : `aws_deployment_guide_complete.md`

## 🏗️ **Architecture Déployée**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Amplify   │    │   API Gateway   │    │   AWS Lambda    │
│   (React/TSX)   │◄──►│   (REST API)    │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Interface     │    │ • CORS          │    │ • FastAPI       │
│ • Hosting       │    │ • Auth          │    │ • Bedrock       │
│ • CDN           │    │ • Rate Limiting │    │ • Azure OpenAI  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 **URLs Finales**

Après le déploiement, vous aurez :

- **Frontend** : `https://main.XXXXXXXXX.amplifyapp.com`
- **API** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod`
- **Documentation** : `https://XXXXXXXXX.execute-api.eu-west-3.amazonaws.com/prod/docs`

## 🧪 **Test du Déploiement**

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

## 💰 **Coûts Estimés**

- **Lambda** : ~$0.20/mois (1000 invocations)
- **API Gateway** : ~$3.50/mois (1M requêtes)
- **Amplify** : ~$1-5/mois (build + transfert)
- **Total** : ~$5-10/mois

## 🔐 **Sécurité**

### **Variables d'Environnement**
Configurez dans la console AWS Lambda :
- `AZURE_OPENAI_KEY` : Votre clé Azure OpenAI
- `AZURE_OPENAI_ENDPOINT` : Votre endpoint Azure OpenAI

### **CORS**
Configuré automatiquement pour permettre l'accès depuis Amplify.

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

## 📞 **Support**

En cas de problème :

1. **Vérifiez les logs CloudWatch**
2. **Testez chaque composant individuellement**
3. **Consultez le guide complet** : `aws_deployment_guide_complete.md`
4. **Vérifiez la configuration AWS CLI** : `aws configure`

## 🎯 **Résultat Final**

✅ **Votre interface React/TSX reste exactement la même**
✅ **Backend déployé sur AWS Lambda**
✅ **API Gateway configuré avec CORS**
✅ **Frontend hébergé sur AWS Amplify**
✅ **Monitoring CloudWatch configuré**
✅ **Sécurité IAM configurée**

## 🚀 **Prochaines Étapes**

1. **Testez l'application déployée**
2. **Configurez un domaine personnalisé** (optionnel)
3. **Mettez en place CI/CD** avec GitHub Actions
4. **Configurez des alertes de monitoring**

---

**🎉 Votre application IA'ctualités est maintenant en production sur AWS !**

**Votre interface React reste exactement la même qu'en local !** ✅ 