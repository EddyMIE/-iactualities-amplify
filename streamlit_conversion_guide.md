# 🔄 Guide de Conversion React/TSX → Streamlit - IA'ctualités

## 🚨 Problème Identifié

Votre application actuelle utilise :
- **Frontend** : React + TypeScript (TSX)
- **Backend** : Python FastAPI

**Streamlit ne supporte que Python**, donc il faut convertir l'interface React en Streamlit.

## 🔄 Plan de Conversion

### **Étape 1 : Analyser les Composants React**

Votre application React contient :
```tsx
// Composants à convertir
- ModelSelector (sélection des modèles)
- QuestionInput (saisie de question)
- ResultsDisplay (affichage des résultats)
- CostSummary (résumé des coûts)
- RobotAssistant (assistant visuel)
```

### **Étape 2 : Conversion vers Streamlit**

```python
# streamlit_app.py - Version complète
import streamlit as st
import requests
import json
from typing import List, Dict
import time

# Configuration de la page
st.set_page_config(
    page_title="IA'ctualités - Comparateur de Modèles LLM",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS personnalisé pour reproduire le design React
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .model-card {
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
        transition: all 0.3s ease;
    }
    
    .model-card.selected {
        border-color: #1a237e;
        background-color: #f3f4f6;
    }
    
    .result-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1rem 0;
        background-color: white;
    }
    
    .cost-badge {
        background-color: #4caf50;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .robot-assistant {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
        margin: 2rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Variables d'environnement
BEDROCK_ENDPOINT = st.secrets.get("BEDROCK_ENDPOINT", "http://localhost:8000")
AZURE_OPENAI_KEY = st.secrets.get("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = st.secrets.get("AZURE_OPENAI_ENDPOINT")

# Modèles disponibles (identique à votre React)
AVAILABLE_MODELS = [
    {"name": "Claude 3 Sonnet", "provider": "bedrock", "cost_per_1k": 0.003, "description": "Modèle équilibré pour la plupart des tâches"},
    {"name": "Claude 3 Haiku", "provider": "bedrock", "cost_per_1k": 0.00025, "description": "Rapide et économique"},
    {"name": "Claude 3.7 Sonnet", "provider": "bedrock", "cost_per_1k": 0.003, "description": "Version améliorée de Claude 3 Sonnet"},
    {"name": "GPT-4o (Azure)", "provider": "azure", "cost_per_1k": 0.005, "description": "Modèle OpenAI via Azure"},
    {"name": "GPT-4o Mini (Azure)", "provider": "azure", "cost_per_1k": 0.00015, "description": "Version compacte et rapide"},
    {"name": "Mixtral 8x7B Instruct", "provider": "bedrock", "cost_per_1k": 0.00024, "description": "Modèle open source performant"},
    {"name": "Mistra 8x7B Instruct", "provider": "bedrock", "cost_per_1k": 0.00014, "description": "Modèle Mistral AI"},
    {"name": "Pixtral Large", "provider": "bedrock", "cost_per_1k": 0.00024, "description": "Modèle Pixtral optimisé"}
]

def query_model(model_name: str, prompt: str) -> Dict:
    """Interroge un modèle LLM (identique à votre backend)"""
    try:
        # Utilise votre backend existant
        response = requests.post(f"{BEDROCK_ENDPOINT}/query", 
                               json={"model": model_name, "prompt": prompt},
                               timeout=60)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Erreur {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": f"Erreur de connexion: {str(e)}"}

def format_response(text: str) -> str:
    """Formate la réponse comme dans votre React (simplifié)"""
    # Conversion basique markdown → HTML
    formatted = text.replace("**", "<strong>").replace("**", "</strong>")
    formatted = formatted.replace("*", "<em>").replace("*", "</em>")
    formatted = formatted.replace("\n\n", "<br><br>")
    return formatted

def main():
    # Header principal (équivalent à votre React)
    st.markdown("""
    <div class="main-header">
        <h1>🤖 IA'ctualités</h1>
        <p>Comparateur de Modèles LLM - Analysez et comparez les réponses d'intelligence artificielle</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Robot Assistant (équivalent à votre composant React)
    st.markdown("""
    <div class="robot-assistant">
        <h2>🤖 Assistant IA'ctualités</h2>
        <p>Je suis là pour vous aider à comparer les modèles d'IA !</p>
        <p>💡 <strong>Conseil</strong> : Sélectionnez 2-3 modèles pour une comparaison optimale</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Layout en colonnes (équivalent à votre React)
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("### 🎯 Sélection des Modèles")
        st.info("Sélectionnez jusqu'à **3 modèles maximum** pour éviter les erreurs de serveur")
        
        # Sélection des modèles (équivalent à ModelSelector)
        selected_models = []
        for i, model in enumerate(AVAILABLE_MODELS):
            # Créer une clé unique pour chaque checkbox
            key = f"model_{i}_{model['name'].replace(' ', '_')}"
            
            if st.checkbox(f"**{model['name']}** ({model['provider']})", key=key):
                if len(selected_models) < 3:
                    selected_models.append(model['name'])
                    st.success(f"✅ {model['name']} ajouté")
                else:
                    st.warning("⚠️ Limite de 3 modèles atteinte")
                    # Décocher automatiquement
                    st.session_state[key] = False
                    break
        
        # Compteur de modèles sélectionnés
        st.metric("Modèles sélectionnés", f"{len(selected_models)}/3")
        
        # Message d'encouragement (équivalent à votre React)
        if len(selected_models) == 0:
            st.info("💡 Sélectionnez au moins un modèle pour commencer")
        elif len(selected_models) == 1:
            st.success("🎯 Comparaison ciblée ! Vous pouvez ajouter 2 modèles supplémentaires")
        elif len(selected_models) == 2:
            st.success("🚀 Excellente sélection ! Vous pouvez encore ajouter 1 modèle")
        else:
            st.success("🎉 Parfait ! 3 modèles offrent un bon équilibre")
    
    with col2:
        st.markdown("### 💭 Posez votre Question")
        
        # Zone de saisie (équivalent à QuestionInput)
        question = st.text_area(
            "Votre question :",
            placeholder="Ex: Expliquez la théorie de la relativité en termes simples...",
            height=120,
            help="Saisissez votre question ici. Elle sera envoyée à tous les modèles sélectionnés."
        )
        
        # Bouton de comparaison (équivalent à votre React)
        if st.button("🚀 Comparer les Modèles", type="primary", disabled=len(selected_models) == 0):
            if not question.strip():
                st.error("❌ Veuillez saisir une question")
                return
            
            # Affichage des résultats (équivalent à ResultsDisplay)
            with st.spinner("🔄 Analyse en cours..."):
                results = []
                total_cost = 0
                
                # Traitement séquentiel pour éviter la surcharge
                for i, model_name in enumerate(selected_models):
                    st.markdown(f"### 📊 {model_name}")
                    
                    with st.expander(f"Résultats détaillés - {model_name}", expanded=True):
                        # Appel au modèle
                        result = query_model(model_name, question)
                        
                        if "error" in result:
                            st.error(f"❌ Erreur: {result['error']}")
                        else:
                            # Affichage de la réponse formatée
                            st.markdown("#### Réponse :")
                            formatted_response = format_response(result.get("response", ""))
                            st.markdown(formatted_response, unsafe_allow_html=True)
                            
                            # Métriques (équivalent à CostSummary)
                            col1, col2, col3 = st.columns(3)
                            with col1:
                                cost = result.get("cost", 0)
                                st.metric("💰 Coût", f"${cost:.4f}")
                                total_cost += cost
                            with col2:
                                st.metric("📝 Tokens", result.get("tokens", 0))
                            with col3:
                                st.metric("⚡ Modèle", model_name)
                            
                            # Barre de progression
                            st.progress((i + 1) / len(selected_models))
                    
                    # Délai entre les requêtes pour éviter la surcharge
                    if i < len(selected_models) - 1:
                        time.sleep(0.5)
                
                # Résumé final (équivalent à CostSummary)
                st.markdown("---")
                st.markdown("### 📈 Résumé de la Comparaison")
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("🎯 Modèles testés", len(selected_models))
                with col2:
                    st.metric("💰 Coût total", f"${total_cost:.4f}")
                with col3:
                    st.metric("⚡ Temps moyen", "~2-5s par modèle")
                
                # Recommandations
                st.markdown("### 💡 Recommandations")
                if total_cost < 0.01:
                    st.success("✅ Coût très économique !")
                elif total_cost < 0.05:
                    st.info("💰 Coût modéré")
                else:
                    st.warning("⚠️ Coût élevé, considérez moins de modèles")
    
    # Footer (équivalent à votre React)
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; padding: 2rem;'>
        <p><strong>🤖 IA'ctualités - Comparateur de Modèles LLM</strong></p>
        <p>Propulsé par AWS Bedrock et Azure OpenAI</p>
        <p>💡 Optimisé pour éviter les erreurs de serveur</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
```

### **Étape 3 : Configuration des Dépendances**

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

### **Étape 4 : Variables d'Environnement Streamlit**

```bash
# Dans Streamlit Cloud, configurez :
BEDROCK_ENDPOINT=https://your-backend.railway.app
AZURE_OPENAI_KEY=votre_clé_azure
AZURE_OPENAI_ENDPOINT=votre_endpoint_azure
```

## 🎯 **Avantages de cette Conversion**

### ✅ **Avantages :**
- **Déploiement ultra-rapide** (5 minutes)
- **Gratuit** pour commencer
- **Pas de configuration complexe**
- **Intégration Python native**
- **Même fonctionnalités** que votre React

### ⚠️ **Limitations :**
- **Interface moins moderne** que React
- **Moins de personnalisation** CSS
- **Pas d'animations complexes**
- **Performance limitée** pour les gros volumes

## 🔄 **Alternative : Garder React + Backend Python**

Si vous voulez garder votre interface React, utilisez plutôt :

### **Option 2 : Vercel + Railway (Recommandée)**
- **Frontend** : Vercel (React/TSX)
- **Backend** : Railway (Python FastAPI)
- **Avantages** : Garde votre code React, déploiement moderne

### **Option 3 : AWS Amplify + Lambda**
- **Frontend** : Amplify (React/TSX)
- **Backend** : Lambda (Python)
- **Avantages** : Scalabilité maximale, intégration AWS

## 🎯 **Ma Recommandation**

**Pour votre cas spécifique :**

1. **Si vous voulez déployer rapidement** → **Streamlit** (conversion nécessaire)
2. **Si vous voulez garder React** → **Vercel + Railway** (pas de conversion)
3. **Si vous voulez la scalabilité** → **AWS Amplify + Lambda** (pas de conversion)

**La conversion Streamlit prendra environ 2-3 heures** pour reproduire toutes vos fonctionnalités React. 