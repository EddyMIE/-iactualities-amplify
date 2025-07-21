import json
import os
import boto3
import openai
import anthropic

def lambda_handler(event, context):
    """Handler principal pour AWS Lambda"""
    
    # Configuration CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
    
    # Gérer les requêtes OPTIONS (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Récupérer le chemin de la requête
    path = event.get('path', '')
    
    # Endpoint de santé
    if path == '/health' and event.get('httpMethod') == 'GET':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'healthy',
                'message': 'API IActualities Comparator opérationnelle'
            })
        }
    
    # Endpoint de requête IA
    elif path == '/query' and event.get('httpMethod') == 'POST':
        try:
            # Parser le body de la requête
            body = json.loads(event.get('body', '{}'))
            question = body.get('question')
            model = body.get('model')
            
            if not question or not model:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Question et modèle requis'
                    })
                }
            
            # Traiter la requête selon le modèle
            if model == "GPT-4o (Azure)":
                result = query_azure_openai(question)
            elif model == "GPT-4o Mini (Azure)":
                result = query_azure_openai_mini(question)
            elif model == "Claude 3 Haiku":
                result = query_anthropic(question)
            elif model == "Mixtral 8x7B Instruct":
                result = query_bedrock(question)
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'error': f'Modèle non supporté: {model}'
                    })
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'response': result['response'],
                    'model': model,
                    'cost': result.get('cost'),
                    'tokens_used': result.get('tokens_used')
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'error': f'Erreur inattendue: {str(e)}'
                })
            }
    
    # Endpoint des modèles disponibles
    elif path == '/models' and event.get('httpMethod') == 'GET':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'models': [
                    {
                        'id': 'GPT-4o (Azure)',
                        'name': 'GPT-4o (Azure)',
                        'provider': 'OpenAI/Azure',
                        'description': 'Modèle GPT-4o via Azure OpenAI'
                    },
                    {
                        'id': 'GPT-4o Mini (Azure)',
                        'name': 'GPT-4o Mini (Azure)',
                        'provider': 'OpenAI/Azure',
                        'description': 'Modèle GPT-4o Mini via Azure OpenAI'
                    },
                    {
                        'id': 'Claude 3 Haiku',
                        'name': 'Claude 3 Haiku',
                        'provider': 'Anthropic',
                        'description': 'Modèle Claude 3 Haiku rapide et efficace'
                    },
                    {
                        'id': 'Mixtral 8x7B Instruct',
                        'name': 'Mixtral 8x7B Instruct',
                        'provider': 'AWS Bedrock',
                        'description': 'Modèle Mixtral 8x7B via AWS Bedrock'
                    }
                ]
            })
        }
    
    # Route non trouvée
    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'error': 'Route non trouvée'
            })
        }

def query_azure_openai(question):
    """Interroge Azure OpenAI (GPT-4o)"""
    try:
        api_key = os.getenv('GPT4O_API_KEY')
        endpoint = os.getenv('GPT4O_ENDPOINT')
        api_version = os.getenv('GPT4O_API_VERSION', '2025-01-01-preview')
        deployment_name = os.getenv('GPT4O_DEPLOYMENT_NAME')
        
        if not api_key or not endpoint or not deployment_name:
            raise Exception("Configuration Azure OpenAI manquante")
        
        client = openai.AzureOpenAI(
            api_key=api_key,
            api_version=api_version,
            azure_endpoint=endpoint
        )
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "Vous êtes un assistant IA spécialisé dans l'analyse d'actualités. Répondez de manière claire et concise."},
                {"role": "user", "content": question}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return {
            "response": response.choices[0].message.content,
            "cost": 0.0,
            "tokens_used": response.usage.total_tokens
        }
    except Exception as e:
        raise Exception(f"Erreur Azure OpenAI: {str(e)}")

def query_azure_openai_mini(question):
    """Interroge Azure OpenAI (GPT-4o Mini)"""
    try:
        api_key = os.getenv('GPT4O_MINI_API_KEY')
        endpoint = os.getenv('GPT4O_MINI_ENDPOINT')
        api_version = os.getenv('GPT4O_MINI_API_VERSION', '2024-12-01-preview')
        deployment_name = os.getenv('GPT4O_MINI_DEPLOYMENT_NAME')
        
        if not api_key or not endpoint or not deployment_name:
            raise Exception("Configuration Azure OpenAI Mini manquante")
        
        client = openai.AzureOpenAI(
            api_key=api_key,
            api_version=api_version,
            azure_endpoint=endpoint
        )
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "Vous êtes un assistant IA spécialisé dans l'analyse d'actualités. Répondez de manière claire et concise."},
                {"role": "user", "content": question}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return {
            "response": response.choices[0].message.content,
            "cost": 0.0,
            "tokens_used": response.usage.total_tokens
        }
    except Exception as e:
        raise Exception(f"Erreur Azure OpenAI Mini: {str(e)}")

def query_anthropic(question):
    """Interroge Anthropic (Claude 3 Haiku)"""
    try:
        api_key = os.getenv('ANTHROPIC_API_KEY')
        
        if not api_key:
            raise Exception("Configuration Anthropic manquante")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": question}
            ]
        )
        
        return {
            "response": response.content[0].text,
            "cost": 0.0,
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens
        }
    except Exception as e:
        raise Exception(f"Erreur Anthropic: {str(e)}")

def query_bedrock(question):
    """Interroge AWS Bedrock (Mixtral)"""
    try:
        client = boto3.client(
            'bedrock-runtime',
            region_name='eu-west-3',
            aws_access_key_id=os.getenv('CUSTOM_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('CUSTOM_AWS_SECRET_ACCESS_KEY')
        )
        
        prompt = f"""<s>[INST] {question} [/INST]"""
        
        response = client.invoke_model(
            modelId="mistral.mixtral-8x7b-instruct-v0:1",
            body=json.dumps({
                "prompt": prompt,
                "max_tokens": 1000,
                "temperature": 0.7
            })
        )
        
        response_body = json.loads(response['body'].read())
        
        return {
            "response": response_body['completions'][0]['text'],
            "cost": 0.0,
            "tokens_used": 0
        }
    except Exception as e:
        raise Exception(f"Erreur Bedrock: {str(e)}") 