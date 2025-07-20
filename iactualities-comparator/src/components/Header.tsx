import React from 'react';
import styled from 'styled-components';
import { Settings } from 'lucide-react';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  img {
    height: 60px;
    width: auto;
    object-fit: contain;
  }
`;

const SettingsButton = styled.button`
  background: transparent;
  border: none;
  color: #1a237e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo>
        <img src="/images/logo_dark.png" alt="IA'ctualités" />
      </Logo>
      <SettingsButton>
        <Settings size={20} />
        Paramètres
      </SettingsButton>
    </HeaderContainer>
  );
};

export default Header; 