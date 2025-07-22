import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Zap, Copy, Download, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { theme } from '../styles/theme';
import { LLMService } from '../services/LLMService';

const MainContent = styled.main`
  flex: 1;
  max-width: none;
  margin: 0;
  padding: 2rem;
  padding-top: 6rem;
  position: relative;
  z-index: 1;
  width: 100%;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  border: 1px solid rgba(26, 35, 126, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  color: ${theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }
`;

const Button = styled.button`
  background: ${theme.gradients.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PromptResult = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 4px solid ${theme.colors.primary};
  white-space: pre-wrap;
  line-height: 1.6;
  position: relative;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${theme.colors.textLight};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    background: ${theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.15);
  }
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  }
`;

const TemplateTitle = styled.h3`
  color: ${theme.colors.primary};
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TemplateDescription = styled.p`
  color: ${theme.colors.textLight};
  margin: 0;
  font-size: 0.9rem;
`;

const PromptHeader = styled.div`
  margin-bottom: 1rem;
`;

const PromptTitle = styled.h3`
  color: ${theme.colors.primary};
  margin: 0;
  margin-bottom: 0.5rem;
`;

const PromptSubtitle = styled.p`
  color: ${theme.colors.textLight};
  margin: 0;
  font-size: 0.9rem;
`;

const CopyConfirmation = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: ${theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.2);
  z-index: 1000;
`;

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
}

const promptTemplates: PromptTemplate[] = [
  {
    id: 'detailed',
    title: 'Réponse détaillée',
    description: 'Obtenez une réponse complète et approfondie avec des exemples',
    template: `Je veux que tu agisses comme un expert sur le sujet suivant : {sujet}. 

Fournir une réponse détaillée qui couvre les aspects suivants :
1. Une explication claire et complète du sujet
2. Les points clés à comprendre
3. Des exemples concrets et pertinents
4. Des applications pratiques
5. Les tendances actuelles ou développements récents

Ton objectif est de m'aider à acquérir une compréhension approfondie de ce sujet. Utilise un langage {style} et structure ta réponse de manière logique avec des sections clairement définies.`
  },
  {
    id: 'creative',
    title: 'Contenu créatif',
    description: 'Générez du contenu créatif et original sur un sujet',
    template: `Je souhaite que tu génères un contenu créatif sur le sujet suivant : {sujet}.

Sois original et innovant dans ton approche avec :
- Un angle unique et captivant
- Un style d'écriture {style} et engageant
- Des métaphores ou analogies pertinentes
- Une structure narrative fluide
- Une conclusion mémorable

Le contenu doit être conçu pour {objectif} et s'adresser à une audience qui {audience}.`
  },
  {
    id: 'analysis',
    title: 'Analyse critique',
    description: 'Obtenez une analyse critique et objective d\'un sujet',
    template: `Je te demande de réaliser une analyse critique approfondie sur le sujet suivant : {sujet}.

Dans ton analyse, assure-toi d'inclure :
1. Un résumé objectif des principaux arguments ou caractéristiques
2. Une évaluation des forces et faiblesses
3. Une mise en contexte historique ou théorique
4. Une comparaison avec d'autres approches ou perspectives
5. Des questions critiques qui méritent d'être explorées davantage

Adopte un ton {style} et équilibré, en présentant différents points de vue de manière impartiale.`
  },
  {
    id: 'technical',
    title: 'Documentation technique',
    description: 'Créez une documentation technique claire et précise',
    template: `Je souhaite que tu crées une documentation technique sur : {sujet}.

La documentation doit inclure :
- Une introduction claire expliquant l'objectif et le contexte
- Des spécifications techniques précises
- Des instructions étape par étape
- Des exemples d'utilisation ou de mise en œuvre
- Des solutions aux problèmes courants
- Des références ou ressources supplémentaires

Utilise un langage {style} et précis, adapté à {audience}. Structure le document avec des titres, sous-titres et listes pour faciliter la lecture.`
  }
];

const PromptsPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [style, setStyle] = useState('professionnel');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    let processedTemplate = template.template
      .replace('{sujet}', subject || '[SUJET]')
      .replace('{style}', style)
      .replace('{objectif}', goal || '[OBJECTIF]')
      .replace('{audience}', audience || '[AUDIENCE]');
    
    setCustomPrompt(processedTemplate);
  };

  const handleGeneratePrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      const llmService = new LLMService();
      const optimizationPrompt = `
Je souhaite optimiser ce prompt pour obtenir les meilleurs résultats possibles d'un modèle de langage avancé.

Prompt original :
"""
${customPrompt}
"""

Peux-tu améliorer ce prompt en :
1. Clarifiant les instructions
2. Ajoutant plus de détails et de contexte
3. Structurant mieux les demandes
4. Rendant les objectifs plus explicites
5. Ajoutant des contraintes ou directives spécifiques

Fournis uniquement le prompt optimisé, sans explications ni commentaires.`;
      
      const result = await llmService.queryModel('Claude 3.7 Sonnet', optimizationPrompt);
      setGeneratedPrompt(result.response || "Désolé, je n'ai pas pu optimiser votre prompt.");
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt("Une erreur s'est produite lors de l'optimisation du prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setShowCopyConfirmation(true);
    setTimeout(() => setShowCopyConfirmation(false), 3000);
  };

  const handleDownloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-optimisé-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateTemplateWithValues = () => {
    if (selectedTemplate) {
      let processedTemplate = selectedTemplate.template
        .replace('{sujet}', subject || '[SUJET]')
        .replace('{style}', style)
        .replace('{objectif}', goal || '[OBJECTIF]')
        .replace('{audience}', audience || '[AUDIENCE]');
      
      setCustomPrompt(processedTemplate);
    }
  };

  React.useEffect(() => {
    updateTemplateWithValues();
  }, [subject, goal, audience, style]);

  return (
    <MainContent>
      <Container>
        <div>
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle>
              <Zap size={24} color={theme.colors.primary} />
              Générateur de Prompts
            </CardTitle>
            
            <FormGroup>
              <Label htmlFor="subject">Sujet principal</Label>
              <Input 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Ex: Intelligence artificielle, Marketing digital, etc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="goal">Objectif du prompt</Label>
              <Input 
                id="goal" 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                placeholder="Ex: Éduquer, Persuader, Divertir, etc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="audience">Audience cible</Label>
              <Input 
                id="audience" 
                value={audience} 
                onChange={(e) => setAudience(e.target.value)} 
                placeholder="Ex: Débutants, Professionnels, Étudiants, etc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="style">Style d'écriture</Label>
              <Select 
                id="style" 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="professionnel">Professionnel</option>
                <option value="conversationnel">Conversationnel</option>
                <option value="académique">Académique</option>
                <option value="simple et accessible">Simple et accessible</option>
                <option value="enthousiaste">Enthousiaste</option>
                <option value="formel">Formel</option>
              </Select>
            </FormGroup>
          </Card>
          
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardTitle>
              <Sparkles size={24} color={theme.colors.primary} />
              Modèles de Prompts
            </CardTitle>
            
            {promptTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                onClick={() => handleTemplateSelect(template)}
                style={selectedTemplate?.id === template.id ? { borderColor: theme.colors.primary, boxShadow: '0 8px 25px rgba(26, 35, 126, 0.08)' } : {}}
              >
                <TemplateTitle>
                  {template.title}
                  {selectedTemplate?.id === template.id && <CheckCircle size={16} color={theme.colors.primary} />}
                </TemplateTitle>
                <TemplateDescription>{template.description}</TemplateDescription>
              </TemplateCard>
            ))}
          </Card>
        </div>
        
        <div>
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardTitle>
              <ArrowRight size={24} color={theme.colors.primary} />
              Votre Prompt
            </CardTitle>
            
            <FormGroup>
              <Label htmlFor="customPrompt">Éditer votre prompt</Label>
              <TextArea 
                id="customPrompt" 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)} 
                placeholder="Sélectionnez un modèle ou écrivez votre prompt personnalisé ici..."
                rows={10}
              />
            </FormGroup>
            
            <Button 
              onClick={handleGeneratePrompt}
              disabled={!customPrompt.trim() || isLoading}
            >
              {isLoading ? 'Optimisation en cours...' : 'Optimiser le prompt'}
              {!isLoading && <Zap size={20} />}
            </Button>
            
            {generatedPrompt && (
              <PromptResult>
                <PromptHeader>
                  <PromptTitle>Prompt Optimisé</PromptTitle>
                  <PromptSubtitle>Voici votre prompt optimisé pour de meilleurs résultats</PromptSubtitle>
                </PromptHeader>
                
                <ActionButtons>
                  <ActionButton onClick={handleCopyPrompt} title="Copier le prompt">
                    <Copy size={18} />
                  </ActionButton>
                  <ActionButton onClick={handleDownloadPrompt} title="Télécharger le prompt">
                    <Download size={18} />
                  </ActionButton>
                </ActionButtons>
                
                {generatedPrompt}
              </PromptResult>
            )}
          </Card>
        </div>
      </Container>
      
      {showCopyConfirmation && (
        <CopyConfirmation>
          <CheckCircle size={20} />
          Prompt copié dans le presse-papiers !
        </CopyConfirmation>
      )}
    </MainContent>
  );
};

export default PromptsPage; 