import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ComparatorPage from './components/ComparatorPage';
import ChatbotPage from './components/ChatbotPage';
import PromptsPage from './components/PromptsPage';
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
  display: flex;
  flex-direction: column;
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
      <AppContainer>
          <Header />
          <MainContentWrapper>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/comparateur" element={<ComparatorPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </MainContentWrapper>
        <RobotIllustrationContainer>
          <RobotImage 
            src="/images/Human-robot-line.svg" 
            alt="Robot Assistant" 
          />
        </RobotIllustrationContainer>
      </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
