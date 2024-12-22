import { Routes, Route, Navigate, useNavigate, HashRouter } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import RequestAccess from './pages/RequestAccess'
import SearchList, { Student } from './components/SearchList'
import InstallPWA from './components/InstallPWA'
import { Timer } from './components/Timer'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ClassData {
  name: string;
  students: {
    name: string;
    timestamp: number;
  }[];
}

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100vh;
    width: 100vw;
  }

  body {
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(120deg, #ffeb3b 0%, #8bc34a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 0;
  width: 100%;
  position: relative;
`;

const ClassForm = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isVisible ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  width: 100%;
  min-height: 150px;
  resize: vertical;
`;

const SaveButton = styled.button`
  background: #4CAF50;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  backdrop-filter: blur(5px);
  transition: background 0.3s;
  
  &:hover {
    background: #45a049;
  }
`;

function App() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isClassFormVisible, setIsClassFormVisible] = useState(false);
  const [className, setClassName] = useState('');
  const [classList, setClassList] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = () => {
      try {
        const savedStatus = localStorage.getItem('approvalStatus');
        const expireTime = localStorage.getItem('expireTime');
        
        if (savedStatus === 'approved' && expireTime) {
          const now = Date.now();
          const expire = parseInt(expireTime);
          
          if (isNaN(expire)) {
            console.error('Invalid expire time format');
            setHasAccess(false);
            localStorage.removeItem('approvalStatus');
            localStorage.removeItem('expireTime');
            navigate('/request', { replace: true });
            return;
          }
          
          if (now >= expire) {
            setHasAccess(false);
            localStorage.removeItem('approvalStatus');
            localStorage.removeItem('expireTime');
            navigate('/request', { replace: true });
          } else {
            setHasAccess(true);
          }
        } else {
          setHasAccess(false);
          navigate('/request', { replace: true });
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        navigate('/request', { replace: true });
      }
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === '/S/' || pathname === '/S/index.html') {
      window.location.href = hasAccess ? '/S/#/app' : '/S/#/request';
    }
  }, [hasAccess]);

  if (hasAccess === null) {
    return (
      <AppContainer>
        <div style={{ textAlign: 'center', padding: '20px', color: '#333' }}>
          იტვირთება...
        </div>
      </AppContainer>
    );
  }

  const handleAccessExpire = () => {
    setHasAccess(false);
    localStorage.removeItem('approvalStatus');
    localStorage.removeItem('expireTime');
    navigate('/request', { replace: true });
  };

  const handleSaveClass = () => {
    if (!className.trim() || !classList.trim()) {
      toast.error('გთხოვთ შეავსოთ ყველა ველი', {
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    const students = classList.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => ({
        name,
        timestamp: Date.now()
      }));

    const classData: ClassData = {
      name: className.trim(),
      students
    };

    try {
      const savedClasses: ClassData[] = JSON.parse(localStorage.getItem('classes') || '[]');
      
      // Check if class already exists
      const existingClassIndex = savedClasses.findIndex((c: ClassData) => 
        c.name.toLowerCase() === className.trim().toLowerCase()
      );

      if (existingClassIndex !== -1) {
        // Update existing class
        savedClasses[existingClassIndex] = classData;
        localStorage.setItem('classes', JSON.stringify(savedClasses));
        toast.success('კლასი განახლდა', {
          autoClose: 1500,
          closeOnClick: true,
          pauseOnHover: false
        });
      } else {
        // Add new class
        localStorage.setItem('classes', JSON.stringify([...savedClasses, classData]));
        toast.success('კლასი წარმატებით შეინახა', {
          autoClose: 1500,
          closeOnClick: true,
          pauseOnHover: false
        });
      }
      
      setClassName('');
      setClassList('');
      setIsClassFormVisible(false);
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('შეცდომა კლასის შენახვისას', {
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: false
      });
    }
  };

  return (
    <HashRouter>
      <GlobalStyle />
      <AppContainer>
        <Routes>
          <Route path="/" element={<Navigate to={hasAccess ? "/app" : "/request"} replace />} />
          <Route
            path="/request"
            element={
              hasAccess ? (
                <Navigate to="/app" replace />
              ) : (
                <RequestAccess onAccessGranted={() => {
                  setHasAccess(true);
                  const expireTime = Date.now() + (10 * 1000);
                  localStorage.setItem('expireTime', expireTime.toString());
                  navigate('/app', { replace: true });
                }} />
              )
            }
          />
          <Route
            path="/app"
            element={
              hasAccess ? (
                <>
                  <Timer 
                    onExpire={handleAccessExpire} 
                    code={localStorage.getItem('requestCode') || ''} 
                    navigate={navigate}
                  />
                  <SearchList students={students} setStudents={setStudents} />
                  <InstallPWA />
                </>
              ) : (
                <Navigate to="/request" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={hasAccess ? "/app" : "/request"} replace />} />
        </Routes>
        <ClassForm $isVisible={isClassFormVisible}>
          <h2>კლასის დამატება</h2>
          <Input
            type="text"
            placeholder="კლასის სახელი"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextArea
            placeholder="მოსწავლეების სია (თითო მოსწავლე ახალ ხაზზე)"
            value={classList}
            onChange={(e) => setClassList(e.target.value)}
          />
          <SaveButton onClick={handleSaveClass}>შენახვა</SaveButton>
          <SaveButton onClick={() => setIsClassFormVisible(false)}>დახურვა</SaveButton>
        </ClassForm>
      </AppContainer>
      <ToastContainer position="bottom-right" />
    </HashRouter>
  );
}

export default App;