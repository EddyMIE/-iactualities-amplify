import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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

const QuestionInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SuggestionButton = styled.button`
  background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem 0.5rem 0.5rem 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  }
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ModelCard = styled(motion.div)<{ selected: boolean }>`
  background: ${props => props.selected ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)' : 'white'};
  color: ${props => props.selected ? 'white' : '#2d3748'};
  border: 2px solid ${props => props.selected ? '#1a237e' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(26, 35, 126, 0.1) 0%, rgba(40, 53, 147, 0.1) 100%);
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.15);
  }
`;

const ModelInfo = styled.div`
  position: relative;
  z-index: 1;
`;

const ModelName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ModelDescription = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.4;
`;

const CompareButton = styled.button`
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.3);
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
`;

const ResultCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #1a237e;
  min-width: 340px;
  max-width: 420px;
  flex: 1 1 340px;
  display: flex;
  flex-direction: column;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ResultTitle = styled.h3`
  color: #1a237e;
  font-weight: 600;
  font-size: 1.1rem;
`;

const ResultMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
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
  color: #1a237e;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background: #fed7d7;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #e53e3e;
`;

const EncouragementMessage = styled.div`
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.1) 0%, rgba(40, 53, 147, 0.1) 100%);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  color: #1a237e;
  font-weight: 500;
`;

const availableModels = [
  {
    name: "Claude 3 Sonnet",
    description: "Modèle avancé d'Anthropic, excellent pour l'analyse et la création de contenu"
  },
  {
    name: "Claude 3 Haiku",
    description: "Version rapide et efficace de Claude, parfaite pour les tâches quotidiennes"
  },
  {
    name: "Claude 3.7 Sonnet",
    description: "Dernière version de Claude avec des capacités améliorées"
  },
  {
    name: "Mixtral 8x7B Instruct",
    description: "Modèle open source puissant avec d'excellentes capacités de raisonnement"
  },
  {
    name: "Pixtral Large",
    description: "Modèle open source performant pour diverses tâches"
  }
];

export interface LLMResult {
  model: string;
  response: string;
  error?: string;
  cost?: number;
  tokens?: number;
}

const ComparatorPage: React.FC = () => {
  const [question, setQuestion] = useState("Comment structurer un projet de transformation digitale en tant qu'AMOA ?");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [results, setResults] = useState<LLMResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

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

  return (
    <MainContent>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 style={{ marginBottom: '1rem', color: '#1a237e' }}>Posez votre question</h2>
        <QuestionInput
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Entrez votre question ici..."
        />
        
        <div style={{ marginTop: '1rem' }}>
          <SuggestionButton onClick={() => setSuggestion("Comment optimiser la gestion de projet agile ?")}>
            Gestion de projet
          </SuggestionButton>
          <SuggestionButton onClick={() => setSuggestion("Quelles sont les meilleures pratiques pour la transformation digitale ?")}>
            Transformation digitale
          </SuggestionButton>
          <SuggestionButton onClick={() => setSuggestion("Comment structurer une équipe de développement ?")}>
            Management d'équipe
          </SuggestionButton>
          {suggestion && (
            <SuggestionButton 
              onClick={applySuggestion}
              style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}
            >
              Appliquer la suggestion
            </SuggestionButton>
          )}
        </div>
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

        <EncouragementMessage>
          {getEncouragementMessage()}
        </EncouragementMessage>

        <CompareButton
          onClick={handleCompare}
          disabled={selectedModels.length === 0 || !question.trim() || loading}
        >
          {loading ? 'Comparaison en cours...' : 'Comparer les modèles'}
        </CompareButton>
      </Card>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <LoadingSpinner>
                🔄 Comparaison en cours... Veuillez patienter.
              </LoadingSpinner>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <h2 style={{ marginBottom: '1.5rem', color: '#1a237e' }}>Résultats de la comparaison</h2>
              <ResultsContainer>
                {results.map((result, index) => (
                  <motion.div
                    key={result.model}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ResultCard>
                      <ResultHeader>
                        <ResultTitle>{result.model}</ResultTitle>
                        <ResultMeta>
                          {result.tokens && <span>📊 {result.tokens} tokens</span>}
                          {result.cost && <span>💰 ${result.cost.toFixed(6)}</span>}
                        </ResultMeta>
                      </ResultHeader>
                      <ResultResponse
                        dangerouslySetInnerHTML={{
                          __html: result.error || formatResponse(result.response)
                        }}
                      />
                    </ResultCard>
                  </motion.div>
                ))}
              </ResultsContainer>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </MainContent>
  );
};

export default ComparatorPage; 