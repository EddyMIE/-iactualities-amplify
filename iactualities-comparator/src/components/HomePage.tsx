import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';

const HomeContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: white;
  padding: 2rem;
  padding-top: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroTitle = styled.h1`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin-bottom: 1rem;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textLight};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: nowrap;
  
  @media (max-width: 1200px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.large};
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(26, 35, 126, 0.15);
  border: 2px solid ${theme.colors.primaryLight};
  cursor: pointer;
  transition: ${theme.transitions.medium};
  position: relative;
  overflow: hidden;
  width: 280px;
  height: 350px;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.gradients.primary};
    transform: scaleX(0);
    transition: ${theme.transitions.medium};
  }

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 50px rgba(26, 35, 126, 0.18);
    border-color: ${theme.colors.secondary};
    &::before {
      transform: scaleX(1);
    }
  }
  
  @media (max-width: 768px) {
    width: 260px;
    height: 320px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    height: 300px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FeatureDescription = styled.p`
  color: ${theme.colors.textLight};
  line-height: 1.6;
  text-align: center;
  height: 120px;
  overflow: hidden;
`;

const FeatureButtonContainer = styled.div`
  margin-top: auto;
  width: 100%;
`;

const FeatureButton = styled.button`
  background: ${theme.gradients.primary};
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: ${theme.borderRadius.medium};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: 1.1rem;
  cursor: pointer;
  transition: ${theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const features = [
  {
    id: 'comparateur',
    title: 'Comparateur de LLM',
    description: 'Comparez les réponses de différents modèles d\'IA pour trouver le meilleur.',
    path: '/comparateur'
  },
  {
    id: 'chatbot',
    title: 'Chatbot IA',
    description: 'Discutez avec des modèles d\'IA sur n\'importe quel sujet.',
    path: '/chatbot'
  },
  {
    id: 'prompts',
    title: 'Générateur de Prompts',
    description: 'Créez des prompts optimisés pour vos modèles IA.',
    path: '/prompts'
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <HomeContainer>
      <HeroSection>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroTitle>IA'ctualités by mc2i</HeroTitle>
          <HeroSubtitle>
            Découvrez notre plateforme d'intelligence artificielle pour explorer, comparer et interagir avec les meilleurs modèles IA du marché qui font l'actualité.
          </HeroSubtitle>
        </motion.div>
      </HeroSection>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <FeatureCard
              onClick={() => handleFeatureClick(feature.path)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureButtonContainer>
                <FeatureButton>
                  Accéder
                </FeatureButton>
              </FeatureButtonContainer>
            </FeatureCard>
          </motion.div>
        ))}
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default HomePage; 