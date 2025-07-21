# 🚀 Guide de Déploiement Streamlit - IA'ctualités

## 📋 Vue d'ensemble

Streamlit Cloud est la solution la plus simple pour déployer rapidement votre application IA'ctualités. Idéal pour les prototypes et les applications avec un trafic modéré.

## 🏗️ Architecture Streamlit

```
┌─────────────────────────────────────────────────────────────┐
│                    Streamlit Cloud                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Frontend      │  │   Backend       │  │   Database   │ │
│  │   (Streamlit)   │◄─┤   (Python)      │◄─┤   (SQLite)   │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   External      │
                       │   AI Services   │
                       │   (Bedrock,     │
                       │    Azure)       │
                       └─────────────────┘
```

## 🔧 Conversion vers Streamlit

### 1. Création de l'Application Streamlit

```python
# streamlit_app.py
import streamlit as st
import requests
import json
from typing import List, Dict

# Configuration de la page
st.set_page_config(
    page_title="IA'ctualités - Comparateur de Modèles LLM",
    page_icon="🤖",
    layout="wide"
)

# Variables d'environnement
BEDROCK_ENDPOINT = st.secrets.get("BEDROCK_ENDPOINT", "http://localhost:8000")
AZURE_OPENAI_KEY = st.secrets.get("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = st.secrets.get("AZURE_OPENAI_ENDPOINT")

# Modèles disponibles
AVAILABLE_MODELS = [
    {"name": "Claude 3 Sonnet", "provider": "bedrock", "cost_per_1k": 0.003},
    {"name": "Claude 3 Haiku", "provider": "bedrock", "cost_per_1k": 0.00025},
    {"name": "Claude 3.7 Sonnet", "provider": "bedrock", "cost_per_1k": 0.003},
    {"name": "GPT-4o (Azure)", "provider": "azure", "cost_per_1k": 0.005},
    {"name": "GPT-4o Mini (Azure)", "provider": "azure", "cost_per_1k": 0.00015},
    {"name": "Mixtral 8x7B Instruct", "provider": "bedrock", "cost_per_1k": 0.00024},
    {"name": "Mistra 8x7B Instruct", "provider": "bedrock", "cost_per_1k": 0.00014},
    {"name": "Pixtral Large", "provider": "bedrock", "cost_per_1k": 0.00024}
]

def query_model(model_name: str, prompt: str) -> Dict:
    """Interroge un modèle LLM"""
    try:
        # Logique d'interrogation des modèles
        if "Azure" in model_name:
            # Appel Azure OpenAI
            pass
        else:
            # Appel Bedrock
            pass
        
        return {
            "response": "Réponse du modèle",
            "cost": 0.001,
            "tokens": 150
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    st.title("🤖 IA'ctualités - Comparateur de Modèles LLM")
    st.markdown("Comparez les réponses de différents modèles d'intelligence artificielle")
    
    # Sidebar pour la sélection des modèles
    with st.sidebar:
        st.header("🎯 Sélection des Modèles")
        st.info("Sélectionnez jusqu'à 3 modèles maximum")
        
        selected_models = []
        for model in AVAILABLE_MODELS:
            if st.checkbox(f"{model['name']} ({model['provider']})", key=model['name']):
                if len(selected_models) < 3:
                    selected_models.append(model['name'])
                else:
                    st.warning("⚠️ Limite de 3 modèles atteinte")
                    break
        
        st.metric("Modèles sélectionnés", f"{len(selected_models)}/3")
    
    # Zone de saisie de question
    question = st.text_area(
        "💭 Posez votre question :",
        placeholder="Ex: Expliquez la théorie de la relativité en termes simples...",
        height=100
    )
    
    # Bouton de comparaison
    if st.button("🚀 Comparer les Modèles", type="primary", disabled=len(selected_models) == 0):
        if not question.strip():
            st.error("Veuillez saisir une question")
            return
        
        # Affichage des résultats
        with st.spinner("🔄 Analyse en cours..."):
            results = []
            for model_name in selected_models:
                with st.expander(f"📊 Résultats - {model_name}", expanded=True):
                    result = query_model(model_name, question)
                    
                    if "error" in result:
                        st.error(f"❌ Erreur: {result['error']}")
                    else:
                        st.markdown("### Réponse :")
                        st.markdown(result["response"])
                        
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Coût", f"${result['cost']:.4f}")
                        with col2:
                            st.metric("Tokens", result['tokens'])
                        with col3:
                            st.metric("Modèle", model_name)
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666;'>
        <p>🤖 IA'ctualités - Comparateur de Modèles LLM</p>
        <p>Propulsé par AWS Bedrock et Azure OpenAI</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
```

### 2. Configuration des Dépendances

```txt
# requirements.txt
streamlit>=1.28.0
requests>=2.31.0
boto3>=1.34.0
openai>=1.3.0
python-dotenv>=1.0.0
pandas>=2.0.0
plotly>=5.17.0
```

### 3. Configuration Streamlit

```toml
# .streamlit/config.toml
[theme]
primaryColor = "#1a237e"
backgroundColor = "#ffffff"
secondaryBackgroundColor = "#f0f2f6"
textColor = "#262730"
font = "sans serif"

[server]
maxUploadSize = 200
enableXsrfProtection = false
enableCORS = false

[browser]
gatherUsageStats = false
```

## 🚀 Déploiement sur Streamlit Cloud

### 1. Préparation du Repository

```bash
# Structure du projet
iactualities-streamlit/
├── streamlit_app.py
├── requirements.txt
├── .streamlit/
│   └── config.toml
├── README.md
└── .gitignore
```

### 2. Configuration des Secrets

Dans Streamlit Cloud, ajoutez ces variables d'environnement :

```json
{
  "BEDROCK_ACCESS_KEY": "votre_clé_aws",
  "BEDROCK_SECRET_KEY": "votre_secret_aws",
  "BEDROCK_REGION": "us-east-1",
  "AZURE_OPENAI_KEY": "votre_clé_azure",
  "AZURE_OPENAI_ENDPOINT": "votre_endpoint_azure"
}
```

### 3. Déploiement

1. **Connectez votre repository GitHub** à Streamlit Cloud
2. **Sélectionnez le fichier** `streamlit_app.py`
3. **Configurez les variables d'environnement**
4. **Déployez** en un clic !

## 💰 Coûts Streamlit Cloud

- **Gratuit** : 3 applications, 1GB RAM, 1 CPU
- **Pro** : $10/mois - Applications illimitées, 8GB RAM, 4 CPU
- **Enterprise** : Sur devis

## 🔒 Sécurité

- **HTTPS** automatique
- **Isolation** des applications
- **Variables d'environnement** sécurisées
- **Authentification** optionnelle

## 📊 Monitoring

- **Logs** en temps réel
- **Métriques** de performance
- **Alertes** automatiques
- **Analytics** d'utilisation

## 🎯 Avantages de cette Solution

1. **Simplicité** : Déploiement en 5 minutes
2. **Gratuit** : Pour commencer
3. **Rapidité** : Pas de configuration complexe
4. **Intégration** : Python natif
5. **Communauté** : Support actif
6. **Scalabilité** : Gérée par Streamlit

## ⚠️ Points d'Attention

- **Limitations** : 1GB RAM en gratuit
- **Performance** : Moins optimisé que les solutions natives
- **Personnalisation** : Interface limitée
- **Vendor Lock-in** : Dépendance à Streamlit

## 🔧 Script de Déploiement Automatique

```yaml
# .github/workflows/deploy-streamlit.yml
name: Deploy to Streamlit Cloud
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Streamlit Cloud
        run: |
          echo "🚀 Déploiement automatique vers Streamlit Cloud"
          echo "✅ Le déploiement se fait automatiquement via l'intégration GitHub"
```

## 📈 Optimisations Recommandées

1. **Cache** : Utilisez `@st.cache_data` pour les requêtes coûteuses
2. **Session State** : Gérer l'état entre les interactions
3. **Lazy Loading** : Charger les données à la demande
4. **Error Handling** : Gestion robuste des erreurs
5. **Rate Limiting** : Limiter les appels API 