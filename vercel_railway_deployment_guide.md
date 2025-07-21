# 🚀 Guide de Déploiement Vercel + Railway - IA'ctualités

## 📋 Vue d'ensemble

Cette solution combine Vercel pour le frontend React et Railway pour le backend Python. Idéal pour les applications modernes avec une séparation claire frontend/backend.

## 🏗️ Architecture Vercel + Railway

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Vercel        │◄──►│   Railway       │◄──►│   PostgreSQL    │
│   (React)       │    │   (FastAPI)     │    │   (Railway)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   External      │
                       │   AI Services   │
                       │   (Bedrock,     │
                       │    Azure)       │
                       └─────────────────┘
```

## 🔧 Configuration Frontend (Vercel)

### 1. Préparation du Projet React

```json
// package.json
{
  "name": "iactualities-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0",
    "styled-components": "^6.1.0",
    "framer-motion": "^10.16.0"
  }
}
```

### 2. Configuration Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
```

### 3. Variables d'Environnement Vercel

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=https://your-app.railway.app
NEXT_PUBLIC_APP_NAME=IA'ctualités
```

## 🔧 Configuration Backend (Railway)

### 1. Préparation du Projet FastAPI

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import boto3
from openai import AzureOpenAI

app = FastAPI(title="IA'ctualités API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables d'environnement Railway
BEDROCK_REGION = os.getenv("BEDROCK_REGION", "us-east-1")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

class QueryRequest(BaseModel):
    model: str
    prompt: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "IA'ctualités API"}

@app.post("/query")
async def query_model(request: QueryRequest):
    try:
        # Votre logique existante
        return {
            "response": "Réponse du modèle",
            "cost": 0.001,
            "tokens": 150
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
```

### 2. Configuration Railway

```json
// railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Dépendances Python

```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
boto3==1.34.0
openai==1.3.0
python-dotenv==1.0.0
pydantic==2.5.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
alembic==1.13.0
```

## 🚀 Déploiement

### 1. Déploiement Backend (Railway)

```bash
# Installation Railway CLI
npm install -g @railway/cli

# Connexion à Railway
railway login

# Initialisation du projet
railway init

# Ajout des variables d'environnement
railway variables set BEDROCK_REGION=us-east-1
railway variables set AZURE_OPENAI_KEY=votre_clé
railway variables set AZURE_OPENAI_ENDPOINT=votre_endpoint

# Déploiement
railway up
```

### 2. Déploiement Frontend (Vercel)

```bash
# Installation Vercel CLI
npm install -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel --prod
```

### 3. Configuration des Domaines

```bash
# Railway - Obtenir l'URL du backend
railway domain

# Vercel - Configurer le domaine personnalisé
vercel domains add your-domain.com
```

## 🔒 Sécurité et Configuration

### 1. Variables d'Environnement Railway

```bash
# Backend variables
BEDROCK_REGION=us-east-1
BEDROCK_ACCESS_KEY_ID=votre_clé_aws
BEDROCK_SECRET_ACCESS_KEY=votre_secret_aws
AZURE_OPENAI_KEY=votre_clé_azure
AZURE_OPENAI_ENDPOINT=votre_endpoint_azure
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=votre_secret_jwt
```

### 2. Variables d'Environnement Vercel

```bash
# Frontend variables
NEXT_PUBLIC_BACKEND_URL=https://your-app.railway.app
NEXT_PUBLIC_APP_NAME=IA'ctualités
NEXT_PUBLIC_GA_ID=your_ga_id
```

### 3. Configuration CORS

```python
# Backend CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "https://your-domain.com",
        "http://localhost:3000"  # Development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## 💰 Coûts Estimés

### Railway
- **Starter** : $5/mois - 1GB RAM, 1 CPU
- **Standard** : $20/mois - 4GB RAM, 2 CPU
- **Pro** : $50/mois - 8GB RAM, 4 CPU

### Vercel
- **Hobby** : Gratuit - 100GB bandwidth
- **Pro** : $20/mois - 1TB bandwidth
- **Enterprise** : Sur devis

**Total estimé** : $25-70/mois pour 1000 utilisateurs

## 📊 Monitoring et Analytics

### 1. Railway Monitoring

```python
# Monitoring des performances
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 2. Vercel Analytics

```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 3. Logs et Alertes

```yaml
# .github/workflows/monitoring.yml
name: Monitoring
on:
  schedule:
    - cron: '0 */6 * * *'  # Toutes les 6 heures

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Backend Health
        run: |
          curl -f https://your-app.railway.app/health || exit 1
      
      - name: Check Frontend
        run: |
          curl -f https://your-app.vercel.app || exit 1
```

## 🔧 CI/CD Automatisé

### 1. GitHub Actions pour Railway

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to Railway
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          service: backend
          token: ${{ secrets.RAILWAY_TOKEN }}
```

### 2. GitHub Actions pour Vercel

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend to Vercel
on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 Avantages de cette Solution

1. **Performance** : CDN global Vercel + Railway optimisé
2. **Scalabilité** : Auto-scaling automatique
3. **Flexibilité** : Séparation frontend/backend
4. **Modernité** : Stack technologique récente
5. **Monitoring** : Outils intégrés
6. **Déploiement** : Automatique et rapide

## ⚠️ Points d'Attention

- **Complexité** : Plus de services à gérer
- **Coûts** : Plus élevés que Streamlit
- **Configuration** : Plus de paramètres
- **Maintenance** : Deux plateformes à surveiller

## 📈 Optimisations Recommandées

1. **Cache** : Redis sur Railway
2. **CDN** : Vercel Edge Functions
3. **Database** : Connection pooling
4. **Rate Limiting** : API Gateway
5. **Monitoring** : Alertes automatiques
6. **Backup** : Base de données automatique 