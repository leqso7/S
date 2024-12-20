import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface RequestAccessProps {
  onAccessGranted: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  background: linear-gradient(120deg, #ffeb3b 0%, #8bc34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
`;

const Button = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #3367d6;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CodeDisplay = styled.div`
  margin-top: 20px;
`;

const CodeText = styled.p`
  font-weight: bold;
  font-size: 18px;
  color: #333;
`;

const StatusText = styled.p`
  font-size: 16px;
  color: #666;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #721c24;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const RequestAccess: React.FC<RequestAccessProps> = ({ onAccessGranted }) => {
  const [loading, setLoading] = useState(false);
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const generateCode = () => {
    // Generate a 5-digit number between 10000 and 99999
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  useEffect(() => {
    const checkApprovalStatus = async () => {
      // Check if user is blocked
      const blocked = localStorage.getItem('blocked') === 'true';
      if (blocked) {
        setIsBlocked(true);
        return;
      }

      const savedStatus = localStorage.getItem('approvalStatus');
      if (savedStatus === 'approved') {
        onAccessGranted();
        return;
      }

      if (!requestCode) {
        // შევამოწმოთ არის თუ არა შენახული კოდი და სახელები
        const savedCode = localStorage.getItem('lastRequestCode');
        const savedFirstName = localStorage.getItem('firstName');
        const savedLastName = localStorage.getItem('lastName');
        if (savedCode) {
          setRequestCode(savedCode);
          setFirstName(savedFirstName || '');
          setLastName(savedLastName || '');
        }
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('access_requests')
          .select('status')
          .eq('code', requestCode)
          .single();

        if (fetchError) throw fetchError;

        if (data?.status === 'approved') {
          localStorage.removeItem('blocked'); // Clear any blocked status if approved
          localStorage.setItem('approvalStatus', 'approved');
          onAccessGranted();
        } else if (data?.status === 'blocked') {
          setIsBlocked(true);
          localStorage.setItem('blocked', 'true');
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
  }, [requestCode, onAccessGranted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError('გთხოვთ შეავსოთ სახელი და გვარი');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const code = generateCode();
      
      const { error: insertError } = await supabase
        .from('access_requests')
        .insert([{ 
          code,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        throw insertError;
      }

      // შევინახოთ ყველა მონაცემი ლოკალურად
      localStorage.setItem('lastRequestCode', code);
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
      setRequestCode(code);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError('მოთხოვნის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      setError('გთხოვთ შეიყვანოთ კოდი');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('access_requests')
        .select('*')
        .eq('code', manualCode.trim())
        .single();

      if (fetchError) throw fetchError;

      if (data?.status === 'approved') {
        localStorage.removeItem('blocked'); // Clear any blocked status if approved
        localStorage.setItem('approvalStatus', 'approved');
        const expireTime = Date.now() + (10 * 1000);
        localStorage.setItem('expireTime', expireTime.toString());
        onAccessGranted();
      } else if (data) {
        setError('კოდი ჯერ არ არის დადასტურებული');
      } else {
        setError('კოდი ვერ მოიძებნა');
      }
    } catch (err) {
      console.error('Error checking code:', err);
      setError('კოდის შემოწმებისას დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={requestCode ? handleCheckCode : handleSubmit}>
        <Title>მოთხოვნის გაგზავნა</Title>
        {isBlocked ? (
          <>
            <ErrorText>თქვენი წვდომა შეზღუდულია. გთხოვთ დაელოდოთ ადმინისტრატორის დადასტურებას.</ErrorText>
            <StatusText>სახელი: {firstName}</StatusText>
            <StatusText>გვარი: {lastName}</StatusText>
          </>
        ) : requestCode ? (
          <>
            <CodeDisplay>
              <CodeText>თქვენი კოდი: {requestCode}</CodeText>
              <StatusText>სტატუსი: მოლოდინში...</StatusText>
              <StatusText>სახელი: {firstName}</StatusText>
              <StatusText>გვარი: {lastName}</StatusText>
            </CodeDisplay>
            <Input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="შეიყვანეთ კოდი"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'მოწმდება...' : 'კოდის შემოწმება'}
            </Button>
          </>
        ) : (
          <>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="სახელი"
              required
            />
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="გვარი"
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
            </Button>
          </>
        )}
        {error && <ErrorText>{error}</ErrorText>}
      </Form>
    </Container>
  );
};

export default RequestAccess;
