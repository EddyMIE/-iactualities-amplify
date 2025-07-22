import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, File, Search, MessageSquare, X, Download } from 'lucide-react';
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
  height: calc(100vh - 10rem);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  border: 1px solid rgba(26, 35, 126, 0.1);
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  color: ${theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const UploadArea = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? theme.colors.secondary : theme.colors.primaryLight};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(233, 30, 99, 0.05)' : 'transparent'};
  margin-bottom: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${theme.colors.secondary};
    background: rgba(233, 30, 99, 0.05);
  }
`;

const UploadIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: ${theme.colors.primary};
`;

const UploadText = styled.p`
  color: ${theme.colors.textLight};
  margin: 0.5rem 0;
  font-size: 1.1rem;
`;

const UploadSubtext = styled.p`
  color: ${theme.colors.textLight};
  opacity: 0.7;
  margin: 0.5rem 0;
  font-size: 0.9rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  overflow-y: auto;
  max-height: 200px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid ${theme.colors.primary};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FileName = styled.span`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const FileSize = styled.span`
  font-size: 0.8rem;
  color: ${theme.colors.textLight};
`;

const FileActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: ${theme.colors.primary};
  }
`;

const QueryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const QueryInput = styled.textarea`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  height: 100px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }
`;

const QueryButton = styled.button`
  background: ${theme.gradients.primary};
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 35, 126, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 1.5rem;
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${theme.colors.primary};
`;

const ResponseContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: ${theme.colors.text};

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.colors.primary};
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
    color: ${theme.colors.primary};
    font-weight: 600;
  }
  
  em, i {
    color: ${theme.colors.secondary};
    font-style: italic;
  }
  
  blockquote {
    border-left: 4px solid ${theme.colors.primary};
    padding-left: 1rem;
    margin: 1rem 0;
    background: white;
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
`;

const ModelSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const ModelOption = styled.button<{ selected: boolean }>`
  background: ${props => props.selected ? theme.gradients.primary : 'white'};
  color: ${props => props.selected ? 'white' : theme.colors.primary};
  border: 2px solid ${props => props.selected ? 'transparent' : theme.colors.primaryLight};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
  }
`;

const NoFilesMessage = styled.div`
  text-align: center;
  color: ${theme.colors.textLight};
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

const DocumentsPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      // Vérifier si c'est un PDF ou DOCX
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        
        const reader = new FileReader();
        reader.onload = () => {
          const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: typeof reader.result === 'string' ? reader.result : undefined
          };
          
          setFiles(prev => [...prev, newFile]);
        };
        
        reader.readAsDataURL(file);
      } else {
        alert('Seuls les fichiers PDF et DOCX sont acceptés.');
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleQuerySubmit = async () => {
    if (!query.trim() || files.length === 0) return;

    setIsLoading(true);
    setResponse('');

    try {
      // Dans un vrai scénario, vous enverriez les fichiers et la requête à votre backend
      // Ici, nous simulons une réponse après un délai
      const llmService = new LLMService();
      
      // Construire un prompt qui inclut des informations sur les fichiers
      const filesList = files.map(file => `- ${file.name} (${formatFileSize(file.size)})`).join('\\n');
      const prompt = `J'ai les fichiers suivants : \\n${filesList}\\n\\nMa question est : ${query}\\n\\nVeuillez analyser ces documents et répondre à ma question.`;
      
      const result = await llmService.queryModel(selectedModel, prompt);
      setResponse(result.response || "Désolé, je n'ai pas pu analyser vos documents.");
      
    } catch (error) {
      console.error('Error processing documents:', error);
      setResponse("Une erreur s'est produite lors de l'analyse des documents. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainContent>
      <Container>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle>Vos Documents</CardTitle>
          
          <UploadArea 
            isDragActive={isDragActive}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileInput 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInputChange}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
            />
            <UploadIcon>
              <Upload size={32} />
            </UploadIcon>
            <UploadText>Glissez-déposez vos fichiers ici</UploadText>
            <UploadSubtext>ou cliquez pour parcourir</UploadSubtext>
            <UploadSubtext>Formats acceptés : PDF, DOCX</UploadSubtext>
          </UploadArea>
          
          {files.length > 0 ? (
            <FileList>
              {files.map(file => (
                <FileItem key={file.id}>
                  <FileInfo>
                    <File size={20} color={theme.colors.primary} />
                    <div>
                      <FileName>{file.name}</FileName>
                      <FileSize>{formatFileSize(file.size)}</FileSize>
                    </div>
                  </FileInfo>
                  <FileActions>
                    <ActionButton onClick={() => removeFile(file.id)}>
                      <X size={18} />
                    </ActionButton>
                  </FileActions>
                </FileItem>
              ))}
            </FileList>
          ) : (
            <NoFilesMessage>
              <FileText size={48} color={theme.colors.primaryLight} />
              <p>Aucun document ajouté</p>
            </NoFilesMessage>
          )}
        </Card>
        
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CardTitle>Interroger vos documents</CardTitle>
          
          <ModelSelector>
            {['Claude 3.7 Sonnet', 'Claude 3 Sonnet', 'Claude 3 Haiku', 'Mixtral 8x7B Instruct'].map(model => (
              <ModelOption
                key={model}
                selected={selectedModel === model}
                onClick={() => setSelectedModel(model)}
              >
                {model}
              </ModelOption>
            ))}
          </ModelSelector>
          
          <QueryContainer>
            <QueryInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Posez une question sur vos documents..."
              disabled={files.length === 0 || isLoading}
            />
            
            <QueryButton 
              onClick={handleQuerySubmit}
              disabled={!query.trim() || files.length === 0 || isLoading}
            >
              {isLoading ? 'Analyse en cours...' : 'Analyser les documents'}
              {!isLoading && <Search size={18} />}
            </QueryButton>
            
            <ResponseContainer>
              {response ? (
                <ResponseContent>
                  {response}
                </ResponseContent>
              ) : (
                <div style={{ textAlign: 'center', color: theme.colors.textLight }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 1rem' }} />
                  <p>Les réponses à vos questions sur les documents apparaîtront ici.</p>
                </div>
              )}
            </ResponseContainer>
          </QueryContainer>
        </Card>
      </Container>
    </MainContent>
  );
};

export default DocumentsPage; 