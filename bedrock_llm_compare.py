import streamlit as st
import boto3
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Profils de modèles et ARNs
MODELS_PROFILES = {
    "Mixtral 8x7B Instruct": "mistral.mixtral-8x7b-instruct-v0:1",
    "Claude 3 Sonnet": "eu.anthropic.claude-3-sonnet-20240229-v1:0",
    "Claude 3 Haiku": "eu.anthropic.claude-3-haiku-20240307-v1:0",
    "Claude 3.7 Sonnet": "eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "Pixtral Large": "eu.mistral.pixtral-large-2502-v1:0"
}

MODELS_ARNS = {
    "Claude 3 Sonnet": "arn:aws:bedrock:eu-west-3:099941715390:inference-profile/eu.anthropic.claude-3-sonnet-20240229-v1:0",
    "Claude 3 Haiku": "arn:aws:bedrock:eu-west-3:099941715390:inference-profile/eu.anthropic.claude-3-haiku-20240307-v1:0",
    "Claude 3.7 Sonnet": "arn:aws:bedrock:eu-west-3:099941715390:inference-profile/eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "Pixtral Large": "arn:aws:bedrock:eu-west-3:099941715390:inference-profile/eu.mistral.pixtral-large-2502-v1:0"
}

# Vérification de la région AWS
aws_region = os.getenv("AWS_REGION")
if not aws_region:
    st.error("Erreur : la variable d'environnement AWS_REGION n'est pas définie. Veuillez l'ajouter dans votre fichier .env.")
    st.stop()

# Initialisation du client Bedrock Runtime
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=aws_region,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def query_bedrock(model_id, prompt):
    try:
        response = bedrock.invoke_model(
            modelId=model_id,
            body=prompt.encode("utf-8"),
            accept="application/json",
            contentType="application/json"
        )
        return response["body"].read().decode("utf-8")
    except Exception as e:
        return f"Erreur: {e}"

st.title("Comparateur de LLM via AWS Bedrock")
st.write("Posez une question, comparez les réponses de plusieurs IA et attribuez une note !")

question = st.text_area("Votre question :", "Explique la théorie de la relativité en termes simples.")

selected_models = st.multiselect(
    "Choisissez les modèles à comparer :",
    list(MODELS_PROFILES.keys()),
    default=["Mixtral 8x7B Instruct", "Claude 3 Sonnet", "Claude 3 Haiku"]
)

if st.button("Comparer les modèles"):
    st.subheader("Réponses des modèles :")
    notes = {}
    for model in selected_models:
        with st.spinner(f"Appel du modèle {model}..."):
            model_id = MODELS_PROFILES[model]
            # Formatage du prompt selon le modèle (ici simple)
            prompt = question
            reponse = query_bedrock(model_id, prompt)
            st.markdown(f"**{model}** :")
            st.code(reponse, language="markdown")
            note = st.slider(f"Notez la réponse de {model}", 0, 10, 5, key=model)
            notes[model] = note
    st.write("## Résumé des notes :")
    st.write(notes) 