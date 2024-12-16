import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import RequestAccess from './pages/RequestAccess'
import SearchList from './components/SearchList'
import InstallPWA from './components/InstallPWA'
import styled from 'styled-components'
import { useState, useEffect } from 'react'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(120deg, #ffeb3b 0%, #8bc34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 0;
  width: 100vw;
  position: relative;
`;

const NavigationBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px;
  display: flex;
  justify-content: space-between;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  backdrop-filter: blur(5px);
  transition: background 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

function App() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const savedStatus = localStorage.getItem('approvalStatus');
    const isApproved = savedStatus === 'approved';
    setHasAccess(isApproved);

    // Handle direct access to /app
    if (location.pathname.includes('app') && !isApproved) {
      window.location.replace('#/request');
      return;
    }

    // Handle root access
    if (location.pathname === '/' && isApproved) {
      window.location.replace('#/app');
      return;
    }

    // Handle root access without approval
    if (location.pathname === '/' && !isApproved) {
      window.location.replace('#/request');
      return;
    }
  }, [location]);

  const handleAccessGranted = () => {
    setHasAccess(true);
    localStorage.setItem('approvalStatus', 'approved');
    window.location.replace('#/app');
  };

  // Wait for access check
  if (hasAccess === null) {
    return null;
  }

  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route
          path="/"
          element={
            hasAccess ? (
              <Navigate to="/app" replace />
            ) : (
              <Navigate to="/request" replace />
            )
          }
        />
        <Route
          path="/app"
          element={
            hasAccess ? (
              <AppContainer>
                <SearchList />
                <InstallPWA />
              </AppContainer>
            ) : (
              <Navigate to="/request" replace />
            )
          }
        />
        <Route
          path="/request"
          element={
            hasAccess ? (
              <Navigate to="/app" replace />
            ) : (
              <RequestAccess onAccessGranted={handleAccessGranted} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
