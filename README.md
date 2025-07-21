# 🤖 IA'ctualités - Comparateur de LLM React

**Application React moderne et professionnelle** pour comparer les réponses de différents modèles de langage (LLM) avec **AWS Bedrock** et **Azure OpenAI**.

## 🚀 Démarrage rapide

### **⚡ Démarrage automatique (Recommandé)**
```bash
.\start.bat
```

### **🛠️ Démarrage manuel**
```bash
# Backend avec vraies API
uvicorn backend_main:app --host 0.0.0.0 --port 8000 --reload

# Frontend React (nouveau terminal)
cd iactualities-comparator
npm start
```

## 📱 URLs de l'application

- **🎨 Frontend React** : http://localhost:3000
- **🔌 Backend API** : http://localhost:8000  
- **📚 Documentation** : http://localhost:8000/docs

## ✨ Fonctionnalités principales

- 🎨 **Interface moderne** avec identité IA'ctualités
- 🤖 **Assistant robot interactif** avec conseils adaptatifs
- 📊 **Comparaison temps réel** de 7 modèles LLM
- 💰 **Calcul automatique** des coûts et tokens
- 📱 **Design responsive** pour tous appareils
- 🌟 **Animations fluides** avec Framer Motion

## 🛠️ Architecture

```
iactualities-comparator/    # Application React moderne
├── src/components/         # Composants React
├── src/services/          # Services API
└── src/styles/            # Thème et styles

backend_main.py            # Backend principal avec vraies API
backend.py                 # Votre backend original
start.bat                  # Script de démarrage
config_api.txt            # Guide configuration
```

## 🚀 Modèles supportés

### **AWS Bedrock**
- Mixtral 8x7B Instruct
- Claude 3 Sonnet / Haiku / 3.7
- Pixtral Large  

### **Azure OpenAI**
- GPT-4o (Azure)
- GPT-4o Mini (Azure)

## 📋 Prérequis

- **Python 3.8+** avec FastAPI et Uvicorn
- **Node.js** pour React
- **NPM** pour les dépendances
- **AWS Account** avec accès Bedrock
- **Azure OpenAI** service configuré

## 🔧 Configuration des API

### 📁 Fichier `.env` (obligatoire)
```env
# AWS Bedrock
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=votre_aws_access_key
AWS_SECRET_ACCESS_KEY=votre_aws_secret_key

# Azure OpenAI - GPT-4o
GPT4O_API_KEY=votre_cle_gpt4o
GPT4O_ENDPOINT=https://votre-ressource.openai.azure.com/

# Azure OpenAI - GPT-4o Mini  
GPT4O_MINI_API_KEY=votre_cle_gpt4o_mini
GPT4O_MINI_ENDPOINT=https://votre-ressource.openai.azure.com/
```

### 📦 Dépendances
```bash
pip install fastapi uvicorn openai boto3 python-dotenv
```

*📖 Consultez `config_api.txt` pour plus de détails*

## 🎯 Migration Streamlit → React

Cette application **remplace complètement Streamlit** avec :
- ✅ Contrôle total de l'interface
- ✅ Performances optimales
- ✅ Design professionnel
- ✅ UX moderne et intuitive

## 💰 Gestion des coûts

- **Calcul automatique** des coûts par requête
- **Affichage en temps réel** des tokens utilisés
- **Comparaison des coûts** entre modèles
- **Résumé financier** après chaque comparaison

## 🔧 Support et dépannage

**Erreur de connexion API** :
- Vérifiez votre fichier `.env` 
- Contrôlez vos clés AWS et Azure
- Testez l'endpoint `/health`

**Problèmes d'affichage** :
- Videz le cache du navigateur
- Redémarrez les services avec `.\start.bat`

---

**Développé avec ❤️ pour IA'ctualités** 🤖 