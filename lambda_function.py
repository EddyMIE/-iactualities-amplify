import json
import os
import boto3
import time
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = event.get('path', '')
    
    if path == '/health' and event.get('httpMethod') == 'GET':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'healthy',
                'message': 'API IActualities Comparator opérationnelle'
            })
        }
    
    elif path == '/query' and event.get('httpMethod') == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            question = body.get('question')
            model = body.get('model')
            
            if not question or not model:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Question et modèle requis'})
                }
            
            result = query_universal_with_retry(question, model)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'response': result['response'],
                    'model': model
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Erreur: {str(e)}'})
            }
    
    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'Route non trouvée'})
    }

def query_universal_with_retry(question, model_name, max_retries=3):
    """Requête avec retry automatique en cas de throttling"""
    for attempt in range(max_retries):
        try:
            return query_bedrock_universal(question, model_name)
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            if error_code == 'ThrottlingException' and attempt < max_retries - 1:
                # Attendre avant de réessayer (backoff exponentiel)
                wait_time = (2 ** attempt) + 1  # 2s, 5s, 9s
                time.sleep(wait_time)
                continue
            else:
                # Erreur finale ou autre type d'erreur
                return {"response": f"Erreur Bedrock: {str(e)}"}
        except Exception as e:
            return {"response": f"Erreur inattendue: {str(e)}"}
    
    return {"response": "Limite de débit AWS atteinte. Veuillez réessayer dans quelques minutes."}

def query_bedrock_universal(question, model_name):
    client = boto3.client('bedrock-runtime', region_name='eu-west-3')
    
    # Configuration par modèle avec les BONS identifiants
    if model_name == "Mixtral 8x7B Instruct":
        model_id = "mistral.mixtral-8x7b-instruct-v0:1"  # PAS cross-region
        body = {
            "prompt": f"<s>[INST] {question} [/INST]",
            "max_tokens": 1000,
            "temperature": 0.7
        }
    
    elif model_name == "Pixtral Large":
        model_id = "eu.mistral.pixtral-large-2502-v1:0"  # Cross-region
        body = {
            "prompt": f"<s>[INST] {question} [/INST]",
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
    elif "claude" in model_name.lower():
        if "haiku" in model_name.lower():
            model_id = "anthropic.claude-3-haiku-20240307-v1:0"  # Standard
        elif "3.7" in model_name:
            model_id = "eu.anthropic.claude-3-7-sonnet-20250219-v1:0"  # Claude 3.7 cross-region
        elif "sonnet" in model_name.lower():
            model_id = "anthropic.claude-3-sonnet-20240229-v1:0"  # Claude 3 Sonnet standard
        else:
            model_id = "anthropic.claude-3-haiku-20240307-v1:0"  # Par défaut
            
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.7,
            "messages": [{"role": "user", "content": question}]
        }
        
    else:
        return {"response": f"Modèle {model_name} non supporté pour le moment"}
    
    try:
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )
        response_body = json.loads(response['body'].read())
        
        # Extraction correcte selon le modèle
        if "claude" in model_name.lower():
            content_list = response_body.get("content", [])
            text = content_list[0]["text"] if content_list and "text" in content_list[0] else "Pas de réponse"
        else:
            # Pour Mixtral et Pixtral
            if "choices" in response_body:
                # Format Pixtral
                text = response_body.get("choices", [{}])[0].get("message", {}).get("content", "Pas de réponse")
            elif "outputs" in response_body:
                # Format Mixtral
                text = response_body.get("outputs", [{}])[0].get("text", "Pas de réponse")
            else:
                text = "Format de réponse inconnu"
            
        return {"response": text}
        
    except Exception as e:
        raise e  # Remonter l'exception pour gestion dans query_universal_with_retry 