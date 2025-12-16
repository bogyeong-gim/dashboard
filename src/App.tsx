import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Login from './components/Login';
import AdminUpload from './components/AdminUpload';
import Dashboard from './components/Dashboard';
import { ExcelData, RankingData } from './types';
import { 
  processExcelData, 
  getUserRankInfo 
} from './utils/dataProcessor';
import { supabase, BUCKET_NAME, FILE_NAME } from './lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Storage에서 엑셀 파일 로드
  const loadDataFromSupabase = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Supabase에서 데이터 로드 시작...');
      
      // Supabase Storage에서 파일 다운로드
      const { data: fileData, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(FILE_NAME);
      
      if (error) {
        console.log('ℹ️ 업로드된 파일이 없습니다. 관리자가 엑셀 파일을 업로드하면 데이터가 표시됩니다.');
        setExcelData([]);
        return;
      }
      
      // Blob을 ArrayBuffer로 변환
      const buffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const data: ExcelData[] = jsonData.map((row: any) => ({
        지점: String(row['지점'] || '').trim(),
        지역단: String(row['지역단'] || '').trim(),
        사번: String(row['사번'] || '').trim(),
        이름: String(row['이름'] || '').trim(),
        성적: parseInt(String(row['성적'] || '0').replace(/,/g, '')) || 0,
        차월: parseInt(String(row['차월'] || '0')) || 0
      })).filter(item => item.사번 && item.이름 && item.지점);
      
      console.log('✅ Supabase에서 데이터 로드 완료:', data.length, '명');
      setExcelData(data);
      
    } catch (error) {
      console.error('❌ 데이터 로드 오류:', error);
      setExcelData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 Supabase에서 데이터 불러오기
  useEffect(() => {
    loadDataFromSupabase();
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

  const handleDataUpload = async (data: ExcelData[]) => {
    setExcelData(data);
    
    // Supabase에서 최신 데이터 다시 로드
    await loadDataFromSupabase();
    
    // 업로드 완료 후 로그인 화면으로 이동
    setTimeout(() => {
      alert(`${data.length}명의 데이터가 업로드되었습니다. 모든 기기에서 확인 가능합니다! 🎉`);
      setCurrentScreen('login');
    }, 1500);
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
        excelData={excelData}
        onLogout={handleLogout}
        onAdminClick={handleAdminClick}
      />
    );
  }

  return null;
};

export default App;





