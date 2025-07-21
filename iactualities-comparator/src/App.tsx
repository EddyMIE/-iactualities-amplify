import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Rocket, Palette, Gem, Star, Bot, Settings, DollarSign } from 'lucide-react';
import Header from './components/Header';
import { LLMService } from './services/LLMService';
import { theme } from './styles/theme';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: white;
    min-height: 100vh;
    color: #2d3748;
    overflow-x: hidden;
  }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
`;

const RobotIllustrationContainer = styled.div`
  position: fixed;
  right: 0;
  top: 80px;
  width: 300px;
  height: calc(100vh - 80px);
  z-index: 0;
  opacity: 0.8;
  pointer-events: none;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const RobotImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: all 0.3s ease;
  
  /* Optimisations spécifiques pour SVG */
  image-rendering: optimizeQuality;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  
  &:hover {
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
    transform: scale(1.02);
  }
`;

const MainContentWrapper = styled.div`
  flex: 1;
  margin-right: 300px;
  width: 100%;
  
  @media (max-width: 1200px) {
    margin-right: 0;
  }
`;

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

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  border: 1px solid rgba(26, 35, 126, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(26, 35, 126, 0.12);
  }
`;



const ActionButton = styled(motion.button)`
  background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const ModelsInfo = styled(motion.div)`
  text-align: center;
  margin: 1rem 0;
  color: #1a237e;
  font-weight: 500;
`;

const QuestionInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const QuestionInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  padding-right: 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 1.125rem;
  resize: vertical;
  transition: border-color 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const ImproveButton = styled(motion.button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuggestionCard = styled(motion.div)`
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 1px solid #4caf50;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  position: relative;
`;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SuggestionTitle = styled.h4`
  color: #2e7d32;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PromptTypeBadge = styled.span`
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const ApplyButton = styled(motion.button)`
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #388e3c;
    transform: translateY(-1px);
  }
`;

const SuggestionText = styled.p`
  color: #1b5e20;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const ModelCard = styled(motion.div)<{ selected: boolean }>`
  background: ${props => props.selected ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)' : 'white'};
  color: ${props => props.selected ? 'white' : '#2d3748'};
  border: 2px solid ${props => props.selected ? '#1a237e' : '#e1e8ed'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.12);
  }
`;



const ModelInfo = styled.div`
  flex: 1;
`;

const ModelName = styled.h4`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ModelDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;



const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: none;
`;

const ResultCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  border-left: 4px solid #1a237e;
  height: fit-content;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-shrink: 0;
`;

const ResultModelName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a237e;
`;

const ResultMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 1rem;
  color: #718096;
`;

const ResultResponse = styled.div`
  font-size: 1.1rem;
  line-height: 1.7;
  color: #2d3748;
  flex: 1;
  overflow-y: auto;
  max-height: 600px;
  
  /* Styles pour améliorer la lisibilité */
  h1, h2, h3, h4, h5, h6 {
    color: #1a237e;
    margin: 1.5rem 0 0.8rem 0;
    font-weight: 600;
  }
  
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.3rem; }
  h3 { font-size: 1.2rem; }
  
  p {
    margin: 0.8rem 0;
  }
  
  ul, ol {
    margin: 0.8rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.4rem 0;
  }
  
  strong, b {
    color: #1a237e;
    font-weight: 600;
  }
  
  em, i {
    color: #e91e63;
    font-style: italic;
  }
  
  blockquote {
    border-left: 4px solid #1a237e;
    padding-left: 1rem;
    margin: 1rem 0;
    background: #f8f9fc;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
  }
  
  code {
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
  }
  
  pre {
    background: #f8f9fc;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #e1e8ed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #1a237e;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #f56565;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
`;

export interface LLMResult {
  model: string;
  response: string;
  error?: string;
  cost?: number;
  tokens?: number;
}

function App() {
  const [question, setQuestion] = useState("Comment structurer un projet de transformation digitale en tant qu'AMOA ?");
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "Mixtral 8x7B Instruct", 
    "Claude 3 Sonnet", 
    "Claude 3 Haiku"
  ]);
  const [results, setResults] = useState<LLMResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [improvePrompt, setImprovePrompt] = useState(false);
  const [showCost, setShowCost] = useState(true);
  const [suggestion, setSuggestion] = useState<string>('');
  const [improvingPrompt, setImprovingPrompt] = useState(false);
  const [promptType, setPromptType] = useState<string>('');

  const detectPromptType = (prompt: string): string => {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('comparer') || promptLower.includes('différence') || promptLower.includes('vs') || promptLower.includes('versus')) {
      return 'COMPARAISON';
    } else if (promptLower.includes('analyser') || promptLower.includes('expliquer') || promptLower.includes('pourquoi')) {
      return 'ANALYSE';
    } else if (promptLower.includes('créer') || promptLower.includes('générer') || promptLower.includes('écrire') || promptLower.includes('rédiger')) {
      return 'CRÉATION';
    } else if (promptLower.includes('rechercher') || promptLower.includes('trouver') || promptLower.includes('quand') || promptLower.includes('où')) {
      return 'RECHERCHE';
    } else if (promptLower.includes('calculer') || promptLower.includes('résoudre') || promptLower.includes('problème')) {
      return 'CALCUL';
    } else {
      return 'GÉNÉRAL';
    }
  };

  const availableModels = [
    { name: "Mixtral 8x7B Instruct", description: "Modèle open source performant" },
    { name: "Claude 3 Sonnet", description: "IA conversationnelle avancée" },
    { name: "Claude 3 Haiku", description: "Rapide et efficace" },
    { name: "Claude 3.7 Sonnet", description: "Dernière génération" },
    { name: "Pixtral Large", description: "Vision et création" }
  ];

  const handleCompare = async () => {
    if (selectedModels.length === 0 || !question.trim()) return;
    
    // Vérification supplémentaire de la limite
    if (selectedModels.length > 3) {
      alert("⚠️ Trop de modèles sélectionnés. Veuillez limiter votre sélection à 3 modèles maximum.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const llmService = new LLMService();
      
      // Ajouter un délai entre les requêtes pour éviter la surcharge
      const results = [];
      for (const model of selectedModels) {
        try {
          console.log(`🔄 Requête en cours pour ${model}...`);
          const result = await llmService.queryModel(model, question);
          results.push({
            model,
            response: result.response || 'Réponse vide',
            cost: result.cost || 0,
            tokens: result.tokens || 0
          });
          
          // Petit délai entre les requêtes pour éviter la surcharge du serveur
          if (selectedModels.indexOf(model) < selectedModels.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`❌ Erreur pour ${model}:`, error);
          results.push({
            model,
            response: '',
            error: error.message || 'Erreur de connexion au serveur'
          });
        }
      }
      
      setResults(results);
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      alert("❌ Erreur de connexion au serveur. Veuillez réessayer dans quelques instants.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        // Retirer le modèle
        return prev.filter(m => m !== modelName);
      } else {
        // Ajouter le modèle seulement si on n'a pas déjà 3 modèles
        if (prev.length >= 3) {
          alert("⚠️ Limite atteinte : Vous ne pouvez comparer que 3 modèles à la fois pour éviter les erreurs de serveur. Veuillez désélectionner un modèle avant d'en ajouter un autre.");
          return prev;
        }
        return [...prev, modelName];
      }
    });
  };

  const getEncouragementMessage = () => {
    const count = selectedModels.length;
    if (count >= 3) return "IA'ctualités : Parfait ! 3 modèles offrent un bon équilibre entre diversité et rapidité. Limite maximale atteinte.";
    if (count === 2) return "IA'ctualités : Comparaison ciblée ! Vous pouvez encore ajouter 1 modèle (max 3).";
    if (count === 1) return "IA'ctualités : Bon début ! Vous pouvez encore ajouter 2 modèles (max 3).";
    return "IA'ctualités : Sélectionnez 1 à 3 modèles pour une comparaison optimale !";
  };

  const handleImprovePrompt = async () => {
    if (!question.trim() || improvingPrompt) return;
    
    setImprovingPrompt(true);
    setSuggestion('');
    
    // Détecter le type de prompt
    const detectedType = detectPromptType(question);
    setPromptType(detectedType);
    
    try {
      const llmService = new LLMService();
      const result = await llmService.improvePrompt(question);
      setSuggestion(result || '');
    } catch (error) {
      console.error('Erreur lors de l\'amélioration du prompt:', error);
      setSuggestion('Impossible d\'améliorer le prompt pour le moment.');
    } finally {
      setImprovingPrompt(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      setQuestion(suggestion);
      setSuggestion('');
    }
  };

  // Fonction pour formater et améliorer la lisibilité des réponses
  const formatResponse = (response: string): string => {
    if (!response) return '';
    
    let formatted = response;
    
    // Améliorer les titres et sous-titres
    formatted = formatted.replace(/^(\d+\.\s*)(.+)$/gm, '<h3>$1$2</h3>');
    formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level}>${text}</h${level}>`;
    });
    
    // Améliorer les listes
    formatted = formatted.replace(/^[-*]\s*(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^(\d+\.)\s*(.+)$/gm, '<li>$1 $2</li>');
    
    // Encapsuler les listes dans des balises ul/ol
    formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    // Améliorer les mots en gras
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Améliorer les mots en italique
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Améliorer les citations
    formatted = formatted.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Améliorer le code inline
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Améliorer les blocs de code
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Améliorer les paragraphes
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/^([^<].+)$/gm, '<p>$1</p>');
    
    // Nettoyer les balises vides
    formatted = formatted.replace(/<p><\/p>/g, '');
    formatted = formatted.replace(/<p>\s*<\/p>/g, '');
    
    // Ajouter des espaces entre les sections
    formatted = formatted.replace(/(<\/h[1-6]>)/g, '$1\n');
    formatted = formatted.replace(/(<\/p>)/g, '$1\n');
    
    return formatted;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <MainContentWrapper>
          <Header />
          
          <MainContent>
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ marginBottom: '1rem', color: '#1a237e' }}>Votre question</h2>
              <QuestionInputContainer>
                <QuestionInput
                  placeholder="Posez votre question ici..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                                                  <ImproveButton
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleImprovePrompt}
                   disabled={loading || improvingPrompt || !question.trim()}
                   title={question.trim() ? `Type détecté: ${detectPromptType(question)}` : ''}
                 >
                   <Bot size={16} />
                   {improvingPrompt ? 'Amélioration...' : 'Améliorer'}
                 </ImproveButton>
               </QuestionInputContainer>
               
               {suggestion && (
                 <SuggestionCard
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   <SuggestionHeader>
                     <SuggestionTitle>
                       💡 Suggestion d'amélioration
                       {promptType && (
                         <PromptTypeBadge>
                           {promptType}
                         </PromptTypeBadge>
                       )}
                     </SuggestionTitle>
                     <ApplyButton
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={applySuggestion}
                     >
                       Appliquer
                     </ApplyButton>
                   </SuggestionHeader>
                   <SuggestionText>{suggestion}</SuggestionText>
                 </SuggestionCard>
               )}
             </Card>

            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: '#1a237e', margin: 0 }}>Sélectionnez les modèles</h2>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedModels.length >= 3 ? '#ffebee' : '#e8f5e8',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: selectedModels.length >= 3 ? '#c62828' : '#2e7d32'
                }}>
                  <span>{selectedModels.length}/3</span>
                  <span>modèles sélectionnés</span>
                </div>
              </div>
              
              {selectedModels.length >= 3 && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  color: '#856404'
                }}>
                  ⚠️ Limite de 3 modèles atteinte. Désélectionnez un modèle pour en ajouter un autre.
                </div>
              )}
              
              <ModelGrid>
                {availableModels.map((model) => {
                  const isSelected = selectedModels.includes(model.name);
                  const isDisabled = !isSelected && selectedModels.length >= 3;
                  return (
                    <ModelCard
                      key={model.name}
                      selected={isSelected}
                      onClick={() => !isDisabled && toggleModel(model.name)}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ModelInfo>
                        <ModelName>{model.name}</ModelName>
                        <ModelDescription>
                          {model.description}
                        </ModelDescription>
                      </ModelInfo>
                    </ModelCard>
                  );
                })}
              </ModelGrid>
            </Card>

            {question.trim() && selectedModels.length > 0 && (
              <Card
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ModelsInfo>
                  {getEncouragementMessage()}
                </ModelsInfo>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <CheckboxContainer>
                    <input 
                      type="checkbox" 
                      checked={showCost}
                      onChange={(e) => setShowCost(e.target.checked)}
                    />
                    <DollarSign size={16} />
                    Afficher les coûts
                  </CheckboxContainer>
                </div>

                <ActionButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompare}
                  disabled={loading || selectedModels.length === 0}
                >
                  {loading ? 'Analyse en cours...' : 'Lancer la comparaison'}
                </ActionButton>
              </Card>
            )}

            {loading && (
              <LoadingSpinner>
                <Spinner />
              </LoadingSpinner>
            )}

            {results.length > 0 && (
              <ResultsContainer>
                {results.map((result, index) => (
                  <ResultCard
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ResultHeader>
                      <ResultModelName>
                        {result.model}
                      </ResultModelName>
                      {showCost && result.cost && (
                        <ResultMeta>
                          <span>${result.cost.toFixed(4)}</span>
                          <span>{result.tokens} tokens</span>
                        </ResultMeta>
                      )}
                    </ResultHeader>
                    <ResultResponse
                      dangerouslySetInnerHTML={{
                        __html: result.error || formatResponse(result.response)
                      }}
                    />
                  </ResultCard>
                ))}
              </ResultsContainer>
            )}
          </MainContent>
        </MainContentWrapper>
        
        <RobotIllustrationContainer>
          <RobotImage 
            src="/images/Human-robot-line.svg" 
            alt="Robot Assistant" 
          />
        </RobotIllustrationContainer>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
