# Guide de Déploiement - IA'ctualités Comparateur de LLM

## Option 1 : Streamlit Cloud (Recommandé - Gratuit)

### Étapes :
1. **Créez un compte sur Streamlit Cloud** : https://share.streamlit.io/
2. **Connectez votre repository GitHub** :
   - Uploadez votre code sur GitHub
   - Connectez votre compte GitHub à Streamlit Cloud
3. **Configurez les variables d'environnement** :
   - Dans Streamlit Cloud, allez dans "Settings" → "Secrets"
   - Ajoutez vos clés AWS :
   ```toml
   AWS_REGION = "eu-west-3"
   AWS_ACCESS_KEY_ID = "votre-access-key"
   AWS_SECRET_ACCESS_KEY = "votre-secret-key"
   ```
4. **Déployez** :
   - Sélectionnez le repository
   - Choisissez `streamlit_app.py` comme fichier principal
   - Cliquez sur "Deploy"

### Avantages :
- ✅ Gratuit
- ✅ Déploiement automatique
- ✅ URL publique immédiate
- ✅ Pas de serveur à gérer

---

## Option 2 : Railway (Alternative - Payant après usage gratuit)

### Étapes :
1. **Créez un compte Railway** : https://railway.app/
2. **Connectez votre GitHub**
3. **Déployez depuis GitHub**
4. **Configurez les variables d'environnement** dans Railway

---

## Option 3 : Vercel + API Routes

### Étapes :
1. **Créez un compte Vercel** : https://vercel.com/
2. **Structurez votre projet** :
   ```
   /api/bedrock.py  # API route
   /pages/index.py  # Interface Streamlit
   ```
3. **Déployez** avec `vercel --prod`

---

## Option 4 : Serveur VPS (Contrôle total)

### Étapes :
1. **Louez un VPS** (OVH, DigitalOcean, etc.)
2. **Installez Docker** :
   ```bash
   docker build -t llm-comparateur .
   docker run -p 8501:8501 llm-comparateur
   ```
3. **Configurez un domaine** et SSL

---

## Configuration des Variables d'Environnement

### Variables requises :
```bash
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Permissions AWS nécessaires :
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

---

## Recommandation

**Streamlit Cloud** est la solution la plus simple pour commencer. Elle offre :
- Déploiement en 5 minutes
- URL publique immédiate
- Gestion automatique des mises à jour
- Interface intuitive

Votre application sera accessible à tous via une URL du type : `https://votre-app.streamlit.app` 