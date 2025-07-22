import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash, Download, Upload, File, X, AlertCircle, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import { theme } from '../styles/theme';
import { LLMService } from '../services/LLMService';

// Configuration - Mettre à false si problèmes avec PDF.js
const ENABLE_PDF_SUPPORT = true;

// Importation conditionnelle pour éviter les erreurs si les modules ne sont pas disponibles
let pdfjs: any = null;
let mammoth: any = null;

try {
  if (ENABLE_PDF_SUPPORT) {
    pdfjs = require('pdfjs-dist');
  }
  mammoth = require('mammoth');
  
  // Configuration du worker PDF.js - Version compatible Create React App
  if (pdfjs) {
    // Utiliser unpkg.com qui est plus fiable que cdnjs
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }
} catch (error) {
  console.warn('Modules pdfjs-dist ou mammoth non disponibles:', error);
}

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 2rem;
  padding-top: 8rem;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 1rem;
    padding-top: 6rem;
    gap: 1rem;
  }
`;

const ChatContainer = styled.div`
  background: rgba(255,255,255,0.55);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.08);
  border: 1px solid rgba(26, 35, 126, 0.1);
  backdrop-filter: blur(16px);
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;

  @media (max-width: 1200px) {
    height: 70vh;
  }
`;

const Sidebar = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 1300px) {
    width: 300px;
  }
  
  @media (max-width: 900px) {
    width: 100%;
    order: 2;
  }
`;

const ModelSelectorCard = styled.div`
  background: rgba(255,255,255,0.7);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(26, 35, 126, 0.08);
  border: 1px solid rgba(26, 35, 126, 0.1);
  backdrop-filter: blur(10px);
`;

const ModelSelectorTitle = styled.h3`
  color: ${theme.colors.primary};
  margin: 0 0 1rem 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModelSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ModelOption = styled.div<{ selected: boolean }>`
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.selected ? theme.colors.primary : 'transparent'};
  background: ${props => props.selected ? 
    'linear-gradient(135deg, rgba(26, 35, 126, 0.1), rgba(233, 30, 99, 0.05))' : 
    'rgba(248, 250, 252, 0.8)'};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
  }
  
  span:first-child {
    font-weight: 600;
  }
  
  span:last-child {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const DocumentsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid ${theme.colors.primaryLight};
  display: flex;
  flex-direction: column;
`;

const DocumentsSection = styled.div`
  margin-top: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const DocumentsTitle = styled.h3`
  color: ${theme.colors.primary};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadArea = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragActive'].includes(prop),
})<{ isDragActive: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? theme.colors.primary : theme.colors.primaryLight};
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(74, 144, 226, 0.05)' : 'rgba(248, 250, 252, 0.5)'};
  margin-bottom: 1rem;
  flex-shrink: 0;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(74, 144, 226, 0.05);
  }
`;

const UploadText = styled.p`
  margin: 0.2rem 0 0 0;
  color: ${theme.colors.text};
  font-size: 0.8rem;
  line-height: 1.1;
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: rgba(248, 250, 252, 1);
    border-color: ${theme.colors.primaryLight};
  }
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 0.5rem;
`;

const DocumentName = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const DocumentDetails = styled.div`
  font-size: 0.8rem;
  color: ${theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const DocumentStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop),
})<{ status: 'loading' | 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'loading': return 'rgba(251, 191, 36, 0.1)';
      case 'success': return 'rgba(34, 197, 94, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'loading': return theme.colors.warning;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      default: return theme.colors.textLight;
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'loading': return 'rgba(251, 191, 36, 0.2)';
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.error};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

const WarningMessage = styled.div`
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: ${theme.colors.warning};
  line-height: 1.3;
`;

const TypingIndicator = styled(motion.div)`
  max-width: 70%;
  padding: 1rem;
  border-radius: 12px;
  align-self: flex-start;
  background: #f8fafc;
  color: #2d3748;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    animation: typing 1.4s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
`;

const FileInput = styled.input`
  display: none;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  color: ${theme.colors.primary};
  margin: 0;
  font-size: 1.25rem;
`;

const ChatControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
    color: ${theme.colors.primary};
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 70%;
  padding: 1rem;
  border-radius: 12px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? theme.gradients.primary : '#f8fafc'};
  color: ${props => props.isUser ? 'white' : '#2d3748'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const MessageContent = styled.div`
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: inherit;
  
  /* Désactiver le rendu markdown */
  * {
    all: unset;
    display: inline;
  }
`;

const InputContainer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
  z-index: 10;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SendButton = styled.button`
  background: ${theme.gradients.primary};
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  textContent?: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

const MAX_CONTENT_LENGTH = 10000; // Limiter le contenu à 10 000 caractères par document

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant IA. Vous pouvez me poser des questions ou charger des documents PDF/DOCX. Une fois les documents chargés, posez-moi des questions spécifiques pour que je les analyse.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3 Sonnet');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const llmService = new LLMService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Préparer le prompt avec le contenu des documents
      let enhancedPrompt = input;
      const successfulDocuments = documents.filter(doc => doc.status === 'success' && doc.textContent);
      
      if (successfulDocuments.length > 0) {
        const documentsContext = successfulDocuments.map(doc => 
          `=== DOCUMENT: ${doc.name} ===\n${doc.textContent}\n=== FIN DU DOCUMENT ===`
        ).join('\n\n');
        
        enhancedPrompt = `CONTEXTE: L'utilisateur a chargé ${successfulDocuments.length} document(s). Voici leur contenu :

${documentsContext}

INSTRUCTION: Réponds UNIQUEMENT en te basant sur les documents fournis ci-dessus. Si la réponse ne se trouve pas dans les documents, dis-le clairement. Réponds en français.

QUESTION DE L'UTILISATEUR: ${input}`;
      }

      const response = await llmService.queryModel(selectedModel, enhancedPrompt);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessages = [
        "🤖 Oups ! Mon cerveau a fait un petit bug ! Peux-tu réessayer ? 🔧",
        "🎭 Je fais une pause créative ! Relance-moi dans quelques secondes ! ✨",
        "🚀 Houston, on a un problème ! Mais rien de grave, réessaie ! 🛸",
        "🎪 Mon cirque numérique fait des siennes ! Un petit refresh ? 🎨"
      ];
      
      let errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (error.message) {
        if (error.message.includes('500')) {
          errorMessage = `🤖 ${selectedModel} fait une petite sieste ! Il se réveille dans 2 minutes ! 😴`;
        } else if (error.message.includes('429')) {
          errorMessage = `⚡ ${selectedModel} dit "Doucement ! Tu vas trop vite !" Fais une petite pause ! 🐌`;
        } else if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
          errorMessage = `⏰ ${selectedModel} prend son temps comme un sage ! Patience... 🧘‍♂️`;
        } else if (error.message.includes('Network')) {
          errorMessage = `📡 Problème de connexion ! Internet fait des caprices ! 🌐`;
        }
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!pdfjs) {
          reject('Lecteur PDF non disponible. Veuillez réessayer ou utiliser un fichier DOCX.');
          return;
        }

        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          reject('Fichier PDF trop volumineux. Veuillez utiliser un fichier de moins de 10MB.');
          return;
        }

        // Lire le fichier comme ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Charger le document PDF avec options de sécurité
        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
          verbosity: 0, // Réduire les logs
          disableAutoFetch: true,
          disableStream: true
        });
        
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 50); // Limiter à 50 pages max
        
        // Extraire le texte de chaque page
        for (let i = 1; i <= maxPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str || '')
              .join(' ');
            
            fullText += pageText + '\n\n';
          } catch (pageError) {
            console.warn(`Erreur page ${i}:`, pageError);
            fullText += `[Erreur lecture page ${i}]\n\n`;
          }
        }
        
        if (pdf.numPages > 50) {
          fullText += `\n[Document tronqué : ${pdf.numPages} pages au total, 50 premières pages analysées]`;
        }
        
        if (!fullText.trim()) {
          reject('Aucun texte trouvé dans ce PDF. Le document pourrait être protégé ou composé uniquement d\'images.');
          return;
        }
        
        resolve(fullText);
      } catch (error: any) {
        console.error('Erreur extraction PDF:', error);
        if (error.message?.includes('worker')) {
          reject('Erreur de chargement du lecteur PDF. Veuillez rafraîchir la page et réessayer.');
        } else if (error.message?.includes('Invalid PDF')) {
          reject('Fichier PDF invalide ou corrompu. Veuillez vérifier votre fichier.');
        } else {
          reject(`Impossible de lire ce fichier PDF : ${error.message || 'Erreur inconnue'}`);
        }
      }
    });
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        if (!mammoth) {
          reject('Module mammoth non disponible');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target?.result });
            resolve(result.value);
          } catch (error) {
            reject(`Erreur lors de l'extraction du texte du DOCX: ${error}`);
          }
        };
        reader.onerror = () => reject('Erreur lors de la lecture du fichier');
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(`Erreur lors de l'extraction du texte du DOCX: ${error}`);
      }
    });
  };

  const handleFiles = async (fileList: FileList) => {
    const newDocuments: UploadedDocument[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Vérifier le type de fichier et la disponibilité des modules
      if (file.type === 'application/pdf') {
        if (!ENABLE_PDF_SUPPORT || !pdfjs) {
          alert('⚠️ Support PDF temporairement désactivé. Veuillez utiliser un fichier DOCX ou convertir votre PDF en DOCX.');
          continue;
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        if (!mammoth) {
          alert('⚠️ Support DOCX non disponible. Veuillez réessayer plus tard.');
          continue;
        }
      } else {
        alert('Seuls les fichiers PDF et DOCX sont acceptés.');
        continue;
      }
      
      // Ajouter d'abord le document avec le statut "loading"
      const newDoc: UploadedDocument = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'loading'
      };
      
      newDocuments.push(newDoc);
      
      // Lire le fichier pour l'aperçu (non bloquant)
      const reader = new FileReader();
      reader.onload = () => {
        setDocuments(prevDocs => {
          const updatedDocs = [...prevDocs];
          const docIndex = updatedDocs.findIndex(d => d.id === newDoc.id);
          if (docIndex !== -1) {
            updatedDocs[docIndex] = {
              ...updatedDocs[docIndex],
              content: typeof reader.result === 'string' ? reader.result : undefined
            };
          }
          return updatedDocs;
        });
      };
      reader.readAsDataURL(file);
      
      // Extraire le texte du document en arrière-plan (non bloquant)
      setTimeout(async () => {
        try {
          let textContent = '';
          
          if (file.type === 'application/pdf') {
            textContent = await extractTextFromPDF(file);
          } else {
            textContent = await extractTextFromDOCX(file);
          }
          
          // Limiter la taille du contenu extrait
          if (textContent.length > MAX_CONTENT_LENGTH) {
            textContent = textContent.substring(0, MAX_CONTENT_LENGTH) + 
              `\n\n[Contenu tronqué. Document original contient ${textContent.length} caractères]`;
          }
          
          setDocuments(prevDocs => {
            const updatedDocs = [...prevDocs];
            const docIndex = updatedDocs.findIndex(d => d.id === newDoc.id);
            if (docIndex !== -1) {
              updatedDocs[docIndex] = {
                ...updatedDocs[docIndex],
                textContent,
                status: 'success'
              };
            }
            return updatedDocs;
          });
        } catch (error) {
          console.error(`Erreur d'extraction pour ${file.name}:`, error);
          
          // Gestion d'erreurs plus détaillée pour l'extraction
          let errorMsg = "Erreur lors de l'analyse du document";
          if (error instanceof Error) {
            if (error.message.includes('worker') || error.message.includes('fetch')) {
              errorMsg = "Problème de chargement du lecteur PDF. Essayez de rafraîchir la page ou utilisez un fichier DOCX.";
            } else if (error.message.includes('PDF')) {
              errorMsg = "Impossible de lire ce fichier PDF. Le fichier pourrait être corrompu ou protégé.";
            } else if (error.message.includes('DOCX') || error.message.includes('mammoth')) {
              errorMsg = "Impossible de lire ce fichier DOCX. Le format n'est peut-être pas supporté.";
            } else {
              errorMsg = `Erreur technique: ${error.message}`;
            }
          }
          
          setDocuments(prevDocs => {
            const updatedDocs = [...prevDocs];
            const docIndex = updatedDocs.findIndex(d => d.id === newDoc.id);
            if (docIndex !== -1) {
              updatedDocs[docIndex] = {
                ...updatedDocs[docIndex],
                status: 'error',
                error: errorMsg
              };
            }
            return updatedDocs;
          });
        }
      }, 100); // Délai minimal pour éviter de bloquer l'UI
    }
    
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    // Réinitialiser l'input file pour éviter les problèmes de cache
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Bonjour ! Je suis votre assistant IA. Vous pouvez me poser des questions ou charger des documents PDF/DOCX. Une fois les documents chargés, posez-moi des questions spécifiques pour que je les analyse.',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.isUser ? 'Vous' : 'Assistant'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n\n`
    ).join('');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasDocumentsWithErrors = documents.some(doc => doc.status === 'error');
  const hasDocumentsLoading = documents.some(doc => doc.status === 'loading');

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

  return (
    <MainContent>
      <Sidebar>
        <ModelSelectorCard>
          <ModelSelectorTitle>Modèles disponibles</ModelSelectorTitle>
          <ModelSelector>
            {availableModels.map(model => (
              <ModelOption
                key={model.name}
                selected={selectedModel === model.name}
                onClick={() => setSelectedModel(model.name)}
              >
                <span>{model.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#718096' }}>{model.description}</span>
              </ModelOption>
            ))}
          </ModelSelector>
        </ModelSelectorCard>

        <DocumentsCard>
          <DocumentsTitle>
            <File size={16} />
            Documents chargés ({documents.length})
          </DocumentsTitle>
          
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
              accept={ENABLE_PDF_SUPPORT ? ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
              multiple
            />
            <Upload size={16} color={theme.colors.primary} />
            <UploadText>
              {ENABLE_PDF_SUPPORT 
                ? "Glissez vos documents PDF/DOCX ou cliquez"
                : "Glissez vos documents DOCX ou cliquez (PDF désactivé)"
              }
            </UploadText>
          </UploadArea>
          
          {documents.length > 0 && (
            <DocumentsList>
              {documents.map(doc => (
                <div key={doc.id}>
                  <DocumentItem>
                    <DocumentInfo>
                      <DocumentName>{doc.name}</DocumentName>
                      <DocumentDetails>
                        <span>{formatFileSize(doc.size)}</span>
                        <DocumentStatus status={doc.status}>
                          {doc.status === 'loading' ? (
                            <Loader size={12} />
                          ) : doc.status === 'success' ? (
                            <CheckCircle size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {doc.status === 'loading' ? 'Analyse...' : 
                           doc.status === 'success' ? 'Analysé' : 
                           'Erreur'}
                        </DocumentStatus>
                      </DocumentDetails>
                    </DocumentInfo>
                    <RemoveButton onClick={() => removeDocument(doc.id)}>
                      <X size={12} />
                    </RemoveButton>
                  </DocumentItem>
                  {doc.status === 'error' && doc.error && (
                    <WarningMessage>
                      <AlertTriangle size={14} />
                      {doc.error}
                    </WarningMessage>
                  )}
                </div>
              ))}
            </DocumentsList>
          )}
        </DocumentsCard>
      </Sidebar>

      <ChatContainer>
        <ChatHeader>
          <ChatTitle>Assistant IA</ChatTitle>
          <ChatControls>
            <ControlButton onClick={clearChat} title="Effacer la conversation">
              <Trash size={18} />
            </ControlButton>
            <ControlButton onClick={exportChat} title="Exporter la conversation">
              <Download size={18} />
            </ControlButton>
          </ChatControls>
        </ChatHeader>
        
        <MessagesContainer>
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                isUser={message.isUser}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MessageContent>
                  {message.content}
                </MessageContent>
              </MessageBubble>
            ))}
            
            {isLoading && (
              <TypingIndicator
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>L'IA réfléchit</span>
                <TypingDots>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </TypingDots>
              </TypingIndicator>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        <InputContainer>
          <MessageInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={documents.length > 0 ? 
              "Posez une question spécifique sur vos documents ou discutez librement..." :
              "Posez votre question ou chargez des documents..."}
            disabled={isLoading}
          />
          <SendButton 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} />
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </MainContent>
  );
};

export default ChatbotPage; 