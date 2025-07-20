# 🤖 IA'ctualités - Comparateur de LLM React

Une application React moderne et professionnelle pour comparer les réponses de différents modèles de langage (LLM).

## ✨ Fonctionnalités

- 🎨 **Interface moderne** avec identité visuelle IA'ctualités
- 🤖 **Assistant robot interactif** avec conseils adaptatifs
- 📊 **Comparaison en temps réel** de 7 modèles LLM différents
- 💰 **Calcul automatique des coûts** et tokens utilisés
- 📱 **Design responsive** pour mobile et desktop
- 🌟 **Animations fluides** avec Framer Motion
- 🎯 **UX optimisée** avec feedback utilisateur

## 🚀 Modèles supportés

- **Mixtral 8x7B Instruct** - Modèle open source performant
- **Claude 3 Sonnet** - IA conversationnelle avancée  
- **Claude 3 Haiku** - Rapide et efficace
- **Claude 3.7 Sonnet** - Dernière génération
- **Pixtral Large** - Vision et création
- **GPT-4o (Azure)** - Modèle multimodal
- **GPT-4o Mini (Azure)** - Version optimisée

## 🛠️ Technologies utilisées

- **React 18** avec TypeScript
- **Styled-components** pour le styling
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes
- **Axios** pour les appels API

## 🔧 Installation

1. **Cloner le projet** (déjà fait)
```bash
cd iactualities-comparator
```

2. **Installer les dépendances** (déjà fait)
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env.local` :
```env
REACT_APP_API_URL=http://localhost:8000
```

4. **Démarrer l'application**
```bash
npm start
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🔌 Backend requis

Cette application frontend nécessite votre backend FastAPI existant (`backend.py`) qui doit être démarré sur le port 8000.

### Endpoints attendus :

- `POST /query` - Interroger un modèle LLM
  ```json
  {
    "model": "Claude 3 Sonnet",
    "prompt": "Votre question"
  }
  ```

- `GET /health` - Vérifier la santé du service
- `POST /improve-prompt` - Améliorer un prompt (optionnel)

## 🎨 Identité visuelle

L'application respecte l'identité **IA'ctualités** :
- **Couleurs primaires** : Bleu marine (`#1a237e`) et Rose (`#e91e63`)
- **Typographie** : Inter font family
- **Mascotte robot** intégrée avec animations
- **Design glassmorphism** pour un aspect moderne

## 📱 Responsive Design

- **Mobile** : Interface adaptée avec navigation simplifiée
- **Tablet** : Layout optimisé pour écrans moyens  
- **Desktop** : Expérience complète avec sidebar assistant

## 🚀 Fonctionnalités avancées

### Assistant Robot Intelligent
- Conseils adaptatifs selon le nombre de modèles sélectionnés
- Messages d'encouragement contextuels
- Animation pulse quand des modèles sont sélectionnés

### Affichage des Coûts
- Calcul automatique basé sur les tokens
- Comparaison des coûts entre modèles
- Résumé avec modèle le plus/moins cher

### Interface Moderne
- Animations d'entrée en cascade
- Effets de hover et feedback tactile
- Loading states avec animations robot
- Messages d'erreur élégants

## 🔧 Scripts disponibles

```bash
npm start          # Démarrer en mode développement
npm run build      # Construire pour la production
npm test           # Lancer les tests
npm run eject      # Éjecter la configuration (irréversible)
```

## 📦 Structure du projet

```
src/
├── components/           # Composants React
│   ├── Header.tsx       # En-tête avec logo et mascotte
│   ├── QuestionInput.tsx # Saisie de question
│   ├── ModelSelector.tsx # Sélection des modèles
│   ├── ResultsDisplay.tsx # Affichage des résultats
│   ├── RobotAssistant.tsx # Assistant flottant
│   └── CostSummary.tsx  # Résumé des coûts
├── services/
│   └── LLMService.ts    # Service API
├── styles/
│   ├── theme.ts         # Thème et variables
│   └── styled.d.ts      # Types TypeScript
└── App.tsx              # Composant principal
```

## 🐛 Dépannage

**Erreur de connexion API** :
- Vérifiez que votre backend FastAPI est démarré sur le port 8000
- Contrôlez l'URL dans les variables d'environnement

**Problèmes d'affichage** :
- Videz le cache du navigateur
- Redémarrez le serveur de développement

**Erreurs TypeScript** :
- Assurez-vous que tous les composants sont bien typés
- Vérifiez les imports de styled-components

## 🌟 Améliorations futures

- [ ] Mode sombre automatique
- [ ] Sauvegarde des conversations
- [ ] Export des comparaisons en PDF
- [ ] Intégration de nouveaux modèles
- [ ] Système de favoris
- [ ] Historique des questions

## 📄 Licence

Ce projet utilise la même licence que votre projet principal.

## 🤝 Support

Pour toute question ou problème, consultez la documentation de votre backend ou contactez l'équipe IA'ctualités.

---

**Développé avec ❤️ pour IA'ctualités** 🤖
