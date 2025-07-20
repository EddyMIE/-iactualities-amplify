# IA'ctualités - Comparateur de LLM

Une application web moderne pour comparer les réponses de différents modèles d'intelligence artificielle via AWS Bedrock.

## 🚀 Déploiement sur Streamlit Cloud

### Étape 1 : Créer un repository GitHub
1. Créez un nouveau repository sur GitHub
2. Uploadez ce code dans votre repository

### Étape 2 : Configurer Streamlit Cloud
1. Allez sur [share.streamlit.io](https://share.streamlit.io/)
2. Connectez votre compte GitHub
3. Sélectionnez votre repository
4. Configurez le fichier principal : `streamlit_app.py`

### Étape 3 : Configurer les secrets AWS
Dans Streamlit Cloud, allez dans **Settings** → **Secrets** et ajoutez :

```toml
AWS_REGION = "eu-west-3"
AWS_ACCESS_KEY_ID = "votre-access-key"
AWS_SECRET_ACCESS_KEY = "votre-secret-key"
```

### Étape 4 : Déployer
Cliquez sur **Deploy** ! Votre app sera accessible via une URL du type :
`https://votre-app.streamlit.app`

## 🔧 Développement local

### Installation
```bash
pip install -r requirements.txt
```

### Configuration locale
Créez un fichier `.env` :
```bash
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=votre-access-key
AWS_SECRET_ACCESS_KEY=votre-secret-key
```

### Lancement
```bash
streamlit run streamlit_app.py
```

## 📋 Fonctionnalités

- **Comparaison multi-modèles** : Claude 3, Mixtral, Pixtral
- **Interface moderne** : Design responsive et intuitif
- **Réponses en temps réel** : Appels directs à AWS Bedrock
- **Affichage JSON** : Option pour voir les réponses brutes

## 🔄 Mises à jour

Pour mettre à jour l'application :
1. Modifiez votre code local
2. Testez avec `streamlit run streamlit_app.py`
3. Poussez sur GitHub : `git push`
4. Streamlit Cloud se met à jour automatiquement !

## 🛠️ Structure du projet

```
Article/
├── streamlit_app.py      # Application principale
├── requirements.txt      # Dépendances Python
├── .streamlit/          # Configuration Streamlit
├── DEPLOIEMENT.md       # Guide de déploiement
└── README.md           # Ce fichier
```

## 🔐 Sécurité

- Les clés AWS sont stockées dans les secrets Streamlit
- Aucune clé sensible dans le code
- CORS configuré pour la sécurité

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs dans Streamlit Cloud
2. Testez localement d'abord
3. Vérifiez vos permissions AWS Bedrock 