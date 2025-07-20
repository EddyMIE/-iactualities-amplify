import streamlit as st
import requests
import json

st.set_page_config(layout="wide", page_title="IA'ctualités - Comparateur de LLM", page_icon="🤖")

MODELS = [
    "Mixtral 8x7B Instruct",
    "Claude 3 Sonnet",
    "Claude 3 Haiku",
    "Claude 3.7 Sonnet",
    "Pixtral Large"
]

st.markdown("""
    <style>
    .block-container {padding-top: 1.5rem;}
    .llm-title {font-size: 1.25rem; font-weight: bold; margin-bottom: 1.1rem; text-align: center; letter-spacing: 0.5px;}
    .llm-section {margin-bottom: 2rem;}
    .llm-markdown {font-size: 1.08em; line-height: 1.7; margin-bottom: 1.2em; padding: 0; background: none; border-radius: 0; text-align: justify;}
    @media (max-width: 1100px) {
      .llm-title {font-size: 1.1rem;}
    }
    </style>
""", unsafe_allow_html=True)

st.markdown("<h1 style='text-align:center; margin-bottom:0.5em;'>IA'ctualités - Comparateur de LLM</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align:center; font-size:1.1em;'>Posez une question, comparez les réponses de plusieurs IA !</p>", unsafe_allow_html=True)

with st.container():
    question = st.text_area("Votre question :", "Explique la théorie de la relativité en termes simples.", height=80)
    selected_models = st.multiselect(
        "Choisissez les modèles à comparer :",
        MODELS,
        default=["Mixtral 8x7B Instruct", "Claude 3 Sonnet", "Claude 3 Haiku"],
        help="Sélectionnez jusqu'à 5 modèles pour une comparaison optimale."
    )

show_raw = st.checkbox("Afficher le texte brut JSON des réponses", value=False)

if st.button("Comparer les modèles", use_container_width=True):
    st.markdown("<h2 style='text-align:center; margin-top:1em;'>Résultats des modèles</h2>", unsafe_allow_html=True)
    cols = st.columns(len(selected_models))
    for idx, model in enumerate(selected_models):
        with cols[idx]:
            st.markdown(f"<div class='llm-title'>{model}</div>", unsafe_allow_html=True)
            with st.spinner(f"Appel du modèle {model}..."):
                try:
                    r = requests.post(
                        "http://localhost:8000/query",
                        json={"model": model, "prompt": question},
                        timeout=60
                    )
                    data = r.json()
                    
                    if "error" in data:
                        texte = f"Erreur: {data['error']}"
                        raw_response = texte
                    else:
                        texte = data.get("response", "Réponse vide")
                        raw_response = texte
                        
                except Exception as e:
                    texte = f"Erreur: {e}"
                    raw_response = texte
                
                st.markdown(f"<div class='llm-markdown'>{texte}</div>", unsafe_allow_html=True)
                if show_raw:
                    st.code(raw_response, language="json") 