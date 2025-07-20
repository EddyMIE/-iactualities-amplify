# 🚀 Guide de Déploiement AWS Amplify

## Pourquoi AWS Amplify ?

**Avantages :**
- ✅ **Intégration native AWS** (Bedrock, Lambda, API Gateway)
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **HTTPS et CDN** inclus
- ✅ **Scalabilité** automatique
- ✅ **Coûts optimisés** (pay-per-use)

## 📋 Prérequis

1. **Compte AWS** avec accès Bedrock
2. **AWS CLI** installé et configuré
3. **Node.js** (version 14+)
4. **Git** et repository GitHub

## 🛠️ Installation et Configuration

### 1. Installer AWS Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

### 2. Initialiser le projet
```bash
cd amplify
amplify init
# Répondez aux questions :
# - Nom du projet : llm-comparateur
# - Environnement : dev
# - Type d'app : javascript
# - Framework : react
# - Source Directory Path : src
# - Distribution Directory Path : build
# - Build Command : npm run build
# - Start Command : npm start
```

### 3. Ajouter l'API et la fonction Lambda
```bash
amplify add api
# Répondez aux questions :
# - Service : REST
# - Nom : llmcomparator
# - Path : /query
# - Lambda function : bedrockFunction
# - Authorization : NONE

amplify add function
# Répondez aux questions :
# - Nom : bedrockFunction
# - Runtime : NodeJS
# - Template : Hello World
```

### 4. Configurer les permissions IAM
```bash
amplify update function
# Sélectionnez bedrockFunction
# Ajoutez les permissions Bedrock
```

### 5. Déployer
```bash
amplify push
```

## 🔧 Configuration des Variables d'Environnement

### Dans AWS Console :
1. Allez dans **Lambda** → **bedrockFunction**
2. **Configuration** → **Variables d'environnement**
3. Ajoutez :
   ```
   AWS_REGION = eu-west-3
   ```

### Permissions IAM nécessaires :
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📱 Déploiement du Frontend

### 1. Publier l'application
```bash
amplify publish
```

### 2. Ou déployer automatiquement depuis GitHub :
- Connectez votre repo à AWS Amplify Console
- Configurez le build :
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm install
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: build
      files:
        - '**/*'
  ```

## 🔄 Mises à jour

### Développement local :
```bash
# Modifiez votre code
npm start  # Test local

# Déployez les changements
amplify push
amplify publish
```

### Déploiement automatique :
- Poussez sur GitHub → **déploiement automatique**
- Ou utilisez `amplify console` pour accéder à l'interface web

## 💰 Coûts estimés

**AWS Amplify :**
- **Frontend hosting** : Gratuit (1GB stockage, 15GB transfert/mois)
- **API Gateway** : ~$3.50/million d'appels
- **Lambda** : ~$0.20/million d'invocations
- **Bedrock** : Selon l'usage (voir tarifs AWS)

**Total estimé** : $5-20/mois selon l'usage

## 🌐 URL finale

Votre application sera accessible via :
```
https://main.xxxxxxxxx.amplifyapp.com
```

## 🔍 Monitoring

### AWS Amplify Console :
- **Builds** : Statut des déploiements
- **Analytics** : Utilisation et performance
- **Logs** : Erreurs et debugging

### CloudWatch :
- **Lambda logs** : Fonction bedrockFunction
- **API Gateway logs** : Requêtes et erreurs

## 🚨 Troubleshooting

### Erreurs communes :
1. **Permissions Bedrock** : Vérifiez les IAM roles
2. **CORS** : Configuré dans l'API Gateway
3. **Timeout Lambda** : Augmentez la durée (max 15s)
4. **Mémoire Lambda** : Augmentez si nécessaire

### Commandes utiles :
```bash
amplify status          # État du projet
amplify console         # Interface web
amplify logs            # Logs en temps réel
amplify remove api      # Supprimer l'API
```

## 📈 Évolution future

### Ajouts possibles :
- **Authentification** : Cognito
- **Base de données** : DynamoDB
- **Cache** : ElastiCache
- **CDN** : CloudFront
- **Monitoring** : CloudWatch

---

**AWS Amplify** est la solution AWS la plus simple pour votre cas d'usage. Elle combine la puissance d'AWS avec la simplicité de déploiement ! 