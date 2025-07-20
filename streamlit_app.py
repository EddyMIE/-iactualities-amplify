import streamlit as st
import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(layout="wide", page_title="IA'ctualités - Comparateur de LLM", page_icon="🤖")

MODELS_PROFILES = {
    "Mixtral 8x7B Instruct": "mistral.mixtral-8x7b-instruct-v0:1",
    "Claude 3 Sonnet": "eu.anthropic.claude-3-sonnet-20240229-v1:0",
    "Claude 3 Haiku": "eu.anthropic.claude-3-haiku-20240307-v1:0",
    "Claude 3.7 Sonnet": "eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "Pixtral Large": "eu.mistral.pixtral-large-2502-v1:0"
}

MODELS = list(MODELS_PROFILES.keys())

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

def query_bedrock(model, prompt):
    try:
        aws_region = os.getenv("AWS_REGION")
        bedrock = boto3.client(
            "bedrock-runtime",
            region_name=aws_region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        model_id = MODELS_PROFILES[model]
        
        # Instructions simples
        prompt_with_instruction = f"Réponds de manière claire et complète en maximum 300 mots. Question: {prompt}"
        
        # Construction du body selon le modèle
        if model_id.startswith("eu.anthropic.claude-3"):
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0.3,
                "messages": [
                    {"role": "user", "content": [{"type": "text", "text": prompt_with_instruction}]}
                ]
            })
        elif model_id.startswith("mistral.") or model_id.startswith("eu.mistral."):
            body = json.dumps({
                "prompt": f"<s>[INST] {prompt_with_instruction} [/INST]",
                "max_tokens": 1000,
                "temperature": 0.3
            })
        else:
            return {"error": f"Modèle non supporté : {model_id}"}
        
        response = bedrock.invoke_model(
            modelId=model_id,
            body=body,
            accept="application/json",
            contentType="application/json"
        )
        raw_response = response["body"].read().decode("utf-8")
        
        # Extraction simple de la réponse
        try:
            response_data = json.loads(raw_response)
            if model_id.startswith("eu.anthropic.claude-3"):
                if "content" in response_data and isinstance(response_data["content"], list):
                    text = "".join([c.get("text", "") for c in response_data["content"]])
                else:
                    text = raw_response
            elif model_id.startswith("mistral.") or model_id.startswith("eu.mistral."):
                if "outputs" in response_data:
                    text = response_data["outputs"][0]["text"]
                elif "choices" in response_data and len(response_data["choices"]) > 0:
                    text = response_data["choices"][0]["message"]["content"]
                else:
                    text = raw_response
            else:
                text = raw_response
        except:
            text = raw_response
        
        return {"response": text}
    except Exception as e:
        return {"error": str(e)}

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
                data = query_bedrock(model, question)
                
                if "error" in data:
                    texte = f"Erreur: {data['error']}"
                    raw_response = texte
                else:
                    texte = data.get("response", "Réponse vide")
                    raw_response = texte
                    
                st.markdown(f"<div class='llm-markdown'>{texte}</div>", unsafe_allow_html=True)
                if show_raw:
                    st.code(raw_response, language="json") 