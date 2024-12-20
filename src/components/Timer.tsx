import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const TimerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
    font-size: 0.8rem;
    padding: 8px 15px;
  }
`;

const TimeValue = styled.span`
  font-weight: bold;
  color: #2196f3;
`;

interface TimerProps {
  onExpire: () => void;
  code: string;
  navigate: (path: string) => void;
}

export const Timer: React.FC<TimerProps> = ({ onExpire, code, navigate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const expireTime = localStorage.getItem('expireTime');
    if (!expireTime) return 10;
    const timeLeftMs = parseInt(expireTime) - Date.now();
    return Math.max(0, Math.floor(timeLeftMs / 1000));
  });

  useEffect(() => {
    // Check if blocked
    const blocked = localStorage.getItem('blocked') === 'true';
    if (blocked) {
      navigate('/request');
      return;
    }

    // Check if expired
    const expireTime = localStorage.getItem('expireTime');
    if (!expireTime || Date.now() >= parseInt(expireTime)) {
      onExpire();
      navigate('/request');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onExpire();
          navigate('/request');
        }
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, onExpire]);

  const formatTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}დ ${hours}სთ ${minutes}წთ ${secs}წმ`;
  };

  return (
    <div>
      <TimerContainer>
        დარჩენილი დრო: <TimeValue>{formatTime(timeLeft)}</TimeValue>
      </TimerContainer>
    </div>
  );
};

export default Timer;
