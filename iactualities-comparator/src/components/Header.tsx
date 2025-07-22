import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    height: 60px;
    width: auto;
    object-fit: contain;
  }
`;



const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <Logo onClick={() => navigate('/')}>
        <img src="/images/logo_dark.png" alt="IA'ctualités" />
      </Logo>
    </HeaderContainer>
  );
};

export default Header; 