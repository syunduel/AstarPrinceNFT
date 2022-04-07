
import React from 'react';
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons'
import Mint from './Mint';
import * as s from "./styles/globalStyles";

const CONTAINER_BG = '#15162d';

export const Root = styled.div`
  background-color: #05061d;
`;

export const StyledSection = styled.section`
  min-height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 900px){
    section h1{
      font-size: 2rem;
      text-align: center;
    }
    section .text-container{
      flex-direction: column;
    }
  }
`;

export const HeaderSection = styled(StyledSection)`
  background-image: url(/config/images/background.jpg);
  background-repeat: no-repeat;
  min-height: 80vh;
  align-items: center;
  display: flex;

  @media (max-width: 800px){
    flex-direction: column;
  }
`;

export const StyledContainer = styled.div`
  background-color: ${(props) => props.background};
  padding: 40px;
  width: 70%;

  @media (max-width: 800px){
    padding: 10px;
    width: 90%;
  }
`;

export const ImagesContainer = styled(StyledContainer)`
  display:flex;
  flex-wrap: wrap;
  justify-content: center;

  img {
    margin: 10px;
    width: 350px;
    width: calc(100% / 2.5);
  }

  @media (max-width: 480px){
    img {
      width: 200px;
    }
  }
`;

export const LogoConainer = styled(StyledContainer)`
  text-align: right;
  img {
    width: 80%;
    min-width: 200px;
    max-width: 500px;
  }

  @media (max-width: 800px){
    text-align: center;
    margin-top: 50px;
  }
`;

const MintPage = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Root>
      <HeaderSection>
        <LogoConainer style={{ height: '100%' }}>
          <img src="/config/images/logo.png" />
        </LogoConainer>
        <StyledContainer>
          <Mint />
        </StyledContainer>
      </HeaderSection>
    </Root>
  )
}

export default MintPage;