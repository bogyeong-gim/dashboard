import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminUpload from './components/AdminUpload';
import Dashboard from './components/Dashboard';
import { ExcelData, RankingData } from './types';
import { 
  processExcelData, 
  saveDataToStorage, 
  loadDataFromStorage,
  getUserRankInfo 
} from './utils/dataProcessor';

type Screen = 'login' | 'dashboard' | 'admin';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [rankingData, setRankingData] = useState<RankingData>({
    branch: [],
    region: [],
    rookie: []
  });

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = loadDataFromStorage();
    if (savedData && savedData.length > 0) {
      setExcelData(savedData);
    }
  }, []);

  // 엑셀 데이터가 변경될 때마다 랭킹 데이터 업데이트
  useEffect(() => {
    if (excelData.length > 0) {
      const newRankingData = processExcelData(excelData, currentUserId);
      setRankingData(newRankingData);
    }
  }, [excelData, currentUserId]);

  const handleLogin = (employeeId: string) => {
    // 데이터가 없으면 로그인 불가
    if (excelData.length === 0) {
      alert('등록된 데이터가 없습니다. 관리자에게 문의하세요.');
      return;
    }

    // 사용자 존재 확인
    const userInfo = getUserRankInfo(excelData, employeeId);
    if (!userInfo) {
      alert('등록되지 않은 사번입니다. 사번을 확인해주세요.');
      return;
    }

    setCurrentUserId(employeeId);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUserId('');
    setCurrentScreen('login');
  };

  const handleAdminClick = () => {
    setCurrentScreen('admin');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handleDataUpload = (data: ExcelData[]) => {
    setExcelData(data);
    saveDataToStorage(data);
    
    // 업로드 완료 후 로그인 화면으로 이동
    setTimeout(() => {
      alert(`${data.length}명의 데이터가 업로드되었습니다.`);
      setCurrentScreen('login');
    }, 2000);
  };

  // 화면 렌더링
  if (currentScreen === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onAdminClick={handleAdminClick}
      />
    );
  }

  if (currentScreen === 'admin') {
    return (
      <AdminUpload 
        onDataUpload={handleDataUpload}
        onBack={handleBackToLogin}
      />
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <Dashboard 
        rankingData={rankingData}
        currentUserId={currentUserId}
        totalParticipants={excelData.length}
        onLogout={handleLogout}
        onAdminClick={handleAdminClick}
      />
    );
  }

  return null;
};

export default App;


