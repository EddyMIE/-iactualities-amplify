import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import boto3
from pydantic import BaseModel
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_PROFILES = {
    "Mixtral 8x7B Instruct": "mistral.mixtral-8x7b-instruct-v0:1",
    "Claude 3 Sonnet": "eu.anthropic.claude-3-sonnet-20240229-v1:0",
    "Claude 3 Haiku": "eu.anthropic.claude-3-haiku-20240307-v1:0",
    "Claude 3.7 Sonnet": "eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "Pixtral Large": "eu.mistral.pixtral-large-2502-v1:0"
}

class QueryRequest(BaseModel):
    model: str
    prompt: str

@app.post("/query")
def query_bedrock(req: QueryRequest):
    aws_region = os.getenv("AWS_REGION")
    bedrock = boto3.client(
        "bedrock-runtime",
        region_name=aws_region,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    model_id = MODELS_PROFILES[req.model]
    
    # Instructions simples
    prompt_with_instruction = f"Réponds de manière claire et complète en maximum 300 mots. Question: {req.prompt}"
    
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
    
    try:
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