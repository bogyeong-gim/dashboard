import React, { useState, useEffect } from 'react';
import { Trophy, Star, Users, Calendar, ChevronLeft, ChevronUp, ChevronDown, Minus, Search, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EmployeeData {
  region: string;        // 지역
  branch: string;        // 지점단
  employeeId: string;    // 사번
  name: string;          // 이름
  points: number;        // 성적
  months: number;        // 차월
  change: 'up' | 'down' | 'stable';
}

const LeaderboardApp = () => {
  const [activeTab, setActiveTab] = useState('branch');
  const [animateRanks, setAnimateRanks] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [employeeId, setEmployeeId] = useState('');
  const [currentUser, setCurrentUser] = useState<EmployeeData | null>(null);
  const [allData, setAllData] = useState<EmployeeData[]>([]);

  const tabs = ['branch', 'region', 'rookie'];
  const tabLabels = {
    branch: '지점',
    region: '지역단',
    rookie: '신인'
  };

  // 엑셀 파일 로드 (초기 로드)
  useEffect(() => {
    fetch('/guinness_test_data.xlsx')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('📊 엑셀 데이터 로드 완료:', {
          시트명: sheetName,
          총데이터수: jsonData.length,
          첫번째행샘플: jsonData[0]
        });
        
        const data: EmployeeData[] = jsonData.map((row: any) => {
          const randomValue = Math.random();
          const changeValue: 'up' | 'down' | 'stable' = randomValue > 0.6 ? 'up' : (randomValue > 0.3 ? 'stable' : 'down');
          return {
            region: String(row['지역'] || row['region'] || '').trim(),
            branch: String(row['지점단'] || row['branch'] || '').trim(),
            employeeId: String(row['사번'] || row['employeeId'] || '').trim(),
            name: String(row['이름'] || row['name'] || '').trim(),
            points: parseInt(String(row['성적'] || row['points'] || '0').replace(/,/g, '')) || 0,
            months: parseInt(String(row['차월'] || row['months'] || '0')) || 0,
            change: changeValue
          };
        }).filter(item => item.employeeId && item.name && item.branch); // 유효한 데이터만 필터링
        
        console.log('✅ 변환된 데이터:', {
          총개수: data.length,
          지역목록: [...new Set(data.map(d => d.region))],
          지점단목록: [...new Set(data.map(d => d.branch))],
          첫5개: data.slice(0, 5)
        });
        
        setAllData(data);
      })
      .catch(error => {
        console.error('❌ 엑셀 로드 오류:', error);
        alert('엑셀 파일을 불러올 수 없습니다. public 폴더에 guinness_test_data.xlsx 파일이 있는지 확인해주세요.');
      });
  }, []);

  // 엑셀 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const data: EmployeeData[] = jsonData.map((row: any) => {
          const randomValue = Math.random();
          const changeValue: 'up' | 'down' | 'stable' = randomValue > 0.6 ? 'up' : (randomValue > 0.3 ? 'stable' : 'down');
          return {
            region: String(row['지역'] || row['region'] || '').trim(),
            branch: String(row['지점단'] || row['branch'] || '').trim(),
            employeeId: String(row['사번'] || row['employeeId'] || '').trim(),
            name: String(row['이름'] || row['name'] || '').trim(),
            points: parseInt(String(row['성적'] || row['points'] || '0').replace(/,/g, '')) || 0,
            months: parseInt(String(row['차월'] || row['months'] || '0')) || 0,
            change: changeValue
          };
        }).filter(item => item.employeeId && item.name && item.branch);
        
        setAllData(data);
        alert(`엑셀 파일 업로드 완료! (${data.length}명의 데이터)`);
      } catch (error) {
        console.error('파일 읽기 오류:', error);
        alert('엑셀 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 실제 데이터
  const branchData = [
    { rank: 1, branch: '정동', name: '이현미', points: 2005073, change: 'up' as const, months: 216, isCurrentUser: false },
    { rank: 2, branch: '정동', name: '채희관', points: 1583626, change: 'up' as const, months: 158, isCurrentUser: false },
    { rank: 3, branch: '정동', name: '김지훈', points: 1548519, change: 'stable' as const, months: 146, isCurrentUser: false },
    { rank: 4, branch: '정동', name: '홍백영', points: 1402058, change: 'up' as const, months: 364, isCurrentUser: false },
    { rank: 5, branch: '정동', name: '권경애', points: 1206563, change: 'stable' as const, months: 340, isCurrentUser: false },
    { rank: 6, branch: '정동', name: '최인선', points: 1168209, change: 'up' as const, months: 317, isCurrentUser: false },
    { rank: 7, branch: '정동', name: '안미숙', points: 1011767, change: 'stable' as const, months: 118, isCurrentUser: false },
    { rank: 8, branch: '정동', name: '이금신', points: 1005203, change: 'up' as const, months: 9, isCurrentUser: false },
    { rank: 9, branch: '정동', name: '한옥숙', points: 1004274, change: 'stable' as const, months: 347, isCurrentUser: false },
    { rank: 10, branch: '정동', name: '홍나희', points: 834576, change: 'down' as const, months: 168, isCurrentUser: false },
    { rank: 11, branch: '정동', name: '고숙희', points: 776184, change: 'stable' as const, months: 350, isCurrentUser: false },
    { rank: 12, branch: '정동', name: '문해선', points: 745856, change: 'up' as const, months: 137, isCurrentUser: false },
    { rank: 13, branch: '정동', name: '태현', points: 740305, change: 'stable' as const, months: 282, isCurrentUser: false },
    { rank: 14, branch: '정동', name: '이영애', points: 710739, change: 'up' as const, months: 25, isCurrentUser: false },
    { rank: 15, branch: '정동', name: '종로2', points: 701827, change: 'down' as const, months: 289, isCurrentUser: false },
    { rank: 38, branch: '정동', name: '서진일', points: 19510, change: 'stable' as const, months: 147, isCurrentUser: true }
  ];

  const regionData = [
    { rank: 1, branch: '정동', name: '이현미', points: 2005073, change: 'up' as const, months: 216, isCurrentUser: false },
    { rank: 2, branch: '로얄', name: '최명진', points: 1993939, change: 'up' as const, months: 275, isCurrentUser: false },
    { rank: 3, branch: '불광', name: '지영란', points: 2405251, change: 'up' as const, months: 335, isCurrentUser: false },
    { rank: 4, branch: '불광', name: '임정숙', points: 2002229, change: 'stable' as const, months: 338, isCurrentUser: false },
    { rank: 5, branch: '정동', name: '채희관', points: 1583626, change: 'up' as const, months: 158, isCurrentUser: false },
    { rank: 6, branch: '정동', name: '김지훈', points: 1548519, change: 'down' as const, months: 146, isCurrentUser: false },
    { rank: 7, branch: '불광', name: '애은대리점', points: 1674011, change: 'up' as const, months: 353, isCurrentUser: false },
    { rank: 8, branch: '로얄', name: '이현희', points: 1473181, change: 'stable' as const, months: 222, isCurrentUser: false },
    { rank: 9, branch: '불광', name: '지영란', points: 1458780, change: 'up' as const, months: 335, isCurrentUser: false },
    { rank: 10, branch: '정동', name: '홍백영', points: 1402058, change: 'stable' as const, months: 364, isCurrentUser: false }
  ];

  const rookieData = [
    { rank: 1, branch: '로얄', name: '강혜연', points: 1099028, change: 'up' as const, months: 7, isCurrentUser: false },
    { rank: 2, branch: '정동', name: '이금신', points: 1005203, change: 'up' as const, months: 9, isCurrentUser: false },
    { rank: 3, branch: '로얄', name: '송정훈', points: 706554, change: 'up' as const, months: 3, isCurrentUser: false },
    { rank: 4, branch: '로얄', name: '이예환', points: 524268, change: 'stable' as const, months: 11, isCurrentUser: false },
    { rank: 5, branch: '로얄', name: '박달수', points: 506880, change: 'up' as const, months: 7, isCurrentUser: false },
    { rank: 6, branch: '로얄', name: '이현', points: 451604, change: 'up' as const, months: 3, isCurrentUser: false },
    { rank: 7, branch: '로얄', name: '전소영', points: 448128, change: 'stable' as const, months: 4, isCurrentUser: false },
    { rank: 8, branch: '로얄', name: '김종원', points: 443928, change: 'up' as const, months: 1, isCurrentUser: false },
    { rank: 9, branch: '로얄', name: '이한성', points: 442391, change: 'up' as const, months: 3, isCurrentUser: false },
    { rank: 10, branch: '로얄', name: '안명남', points: 427990, change: 'down' as const, months: 4, isCurrentUser: false }
  ];

  // 지점별 컬러 매핑
  const branchColors = {
    '정동': { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100', border: 'border-orange-200' },
    '불광': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100', border: 'border-amber-200' },
    '로얄': { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100', border: 'border-red-200' }
  };

  const newsItems = [
    '🎉 정동지점 이현미 FP 200만점 돌파!',
    '🔥 신인 강혜연 FP 1위 달성',
    '⭐ 채희관 FP 지점 2위 선전',
    '🏆 TOP 10 진입자 특별 보상 지급',
    '💪 마감까지 3일 남았습니다',
    '🎯 개인 목표 달성률 85% 돌파'
  ];

  useEffect(() => {
    setAnimateRanks(true);
    const timer = setTimeout(() => setAnimateRanks(false), 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getChangeIcon = (change) => {
    if (change === 'up') return <ChevronUp className="w-5 h-5 text-green-600" />;
    if (change === 'down') return <ChevronDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getPointsDisplay = (points) => {
    return points.toLocaleString();
  };

  const getRankStyle = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-400 shadow-md';
    return 'bg-white hover:bg-gray-50/50';
  };

  const getBranchColor = (branch) => {
    return branchColors[branch] || { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100', border: 'border-gray-200' };
  };

  // 사번으로 사용자 검색
  const handleSearchEmployee = () => {
    if (!employeeId.trim()) {
      alert('사번을 입력해주세요.');
      return;
    }
    const user = allData.find(person => person.employeeId === employeeId.trim());
    if (user) {
      setCurrentUser(user);
    } else {
      alert('해당 사번을 찾을 수 없습니다.');
      setCurrentUser(null);
    }
  };

  // 동일 지점단 데이터 필터링 및 순위 계산
  const getFilteredData = () => {
    if (!currentUser || allData.length === 0) {
      return [];
    }

    // 동일 지점단만 필터링
    const sameBranchData = allData.filter(person => person.branch === currentUser.branch);
    
    // 성적순으로 정렬 (내림차순)
    const sortedData = [...sameBranchData].sort((a, b) => b.points - a.points);
    
    // 순위 부여
    return sortedData.map((person, index) => ({
      rank: index + 1,
      branch: person.branch,
      name: person.name,
      points: person.points,
      change: person.change,
      months: person.months,
      isCurrentUser: person.employeeId === currentUser.employeeId
    }));
  };

  const getCurrentData = () => {
    // CSV 데이터가 로드되고 사용자가 선택되었으면 필터링된 데이터 사용
    if (currentUser && allData.length > 0) {
      const filteredData = getFilteredData();
      
      switch(activeTab) {
        case 'branch':
        case 'region':
          return filteredData;
        case 'rookie':
          // 신인: 12개월 이하만 필터링
          return filteredData.filter(person => person.months <= 12);
        default:
          return filteredData;
      }
    }
    
    // 기본 하드코딩된 데이터
    switch(activeTab) {
      case 'branch': return branchData;
      case 'region': return regionData;
      case 'rookie': return rookieData;
      default: return branchData;
    }
  };

  const currentData = getCurrentData();
  const top3 = currentData.slice(0, 3);
  const restData = currentData.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-4 shadow-lg border border-orange-100"
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
          <div className="flex items-center justify-between mb-6">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-800">12월 기네스 리더보드</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>진행현황</span>
            </div>
          </div>

          {/* 엑셀 파일 업로드 */}
          <div className="mb-3">
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>엑셀 파일 업로드</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <div className="mt-2 text-xs text-gray-600 text-center">
              {allData.length > 0 ? (
                <p className="text-green-600 font-medium">✅ 로드된 데이터: {allData.length}명</p>
              ) : (
                <p>파일을 업로드하거나 자동 로드를 기다려주세요.</p>
              )}
              <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-700 mb-1">📋 엑셀 파일 형식</p>
                <p className="text-gray-600">
                  <span className="font-medium">필수 컬럼:</span> 지역, 지점단, 사번, 이름, 성적, 차월
                </p>
              </div>
            </div>
          </div>

          {/* 사번 검색 */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
                placeholder="사번을 입력하세요"
                className="flex-1 px-4 py-2.5 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <button
                onClick={handleSearchEmployee}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-sm flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>검색</span>
              </button>
            </div>
            {currentUser && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-800">
                  <span className="font-bold">{currentUser.name}</span>님 ({currentUser.region} - {currentUser.branch} 지점단) - 동일 지점단 내 순위를 표시합니다.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-medium transition-all text-sm shadow-sm ${
                  activeTab === tab
                    ? tab === 'rookie'
                      ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-orange-200'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-200'
                    : tab === 'rookie'
                    ? 'bg-gradient-to-r from-orange-200 to-amber-300 text-orange-900 hover:from-orange-300 hover:to-amber-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner">
            <div className="py-2.5 px-3">
              <div className="overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee">
                  <span className="text-white text-sm font-medium">
                    {newsItems.map((item, index) => (
                      <span key={index} className="mx-8">{item}</span>
                    ))}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {newsItems.map((item, index) => (
                      <span key={`dup-${index}`} className="mx-8">{item}</span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-end gap-3 mt-6">
            {/* 2nd Place */}
            <div className={`text-center transition-all duration-500 ${animateRanks ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-full shadow-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl filter drop-shadow-md">🥈</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    2nd
                  </div>
                </div>
                <div className="relative">
                  <div className="w-24 h-20 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-xl shadow-lg">
                    <div className="pt-2 text-center">
                      <div className="text-[10px] text-gray-600 font-medium">{top3[1].branch}</div>
                      <div className="text-sm font-bold text-gray-800">{top3[1].name}</div>
                      <div className="text-xs text-gray-700 font-semibold mt-0.5">{getPointsDisplay(top3[1].points)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className={`text-center transition-all duration-500 ${animateRanks ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
              <div className="relative">
                <div className="w-28 h-28 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 rounded-full shadow-xl ring-4 ring-orange-200"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl filter drop-shadow-lg">🏆</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md">
                    CHAMPION
                  </div>
                </div>
                <div className="relative">
                  <div className="w-32 h-28 bg-gradient-to-b from-orange-400 to-amber-500 rounded-t-xl shadow-xl">
                    <div className="pt-3 text-center">
                      <div className="text-xs text-orange-900 font-medium">{top3[0].branch}</div>
                      <div className="text-lg font-bold text-orange-900">{top3[0].name}</div>
                      <div className="text-sm text-orange-800 font-bold mt-1">
                        <span className="text-xl">{getPointsDisplay(top3[0].points)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-2 text-orange-300 animate-pulse">✨</div>
                  <div className="absolute -top-3 -right-2 text-orange-300 animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className={`text-center transition-all duration-500 ${animateRanks ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full shadow-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl filter drop-shadow-md">🥉</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3rd
                  </div>
                </div>
                <div className="relative">
                  <div className="w-24 h-16 bg-gradient-to-b from-amber-400 to-orange-500 rounded-t-xl shadow-lg">
                    <div className="pt-1 text-center">
                      <div className="text-[10px] text-amber-800 font-medium">{top3[2].branch}</div>
                      <div className="text-sm font-bold text-amber-900">{top3[2].name}</div>
                      <div className="text-xs text-amber-800 font-semibold mt-0.5">{getPointsDisplay(top3[2].points)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-orange-50">
          <div className="space-y-2">
            {restData.map((player, index) => {
              const colorScheme = getBranchColor(player.branch);
              
              return (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                    player.isCurrentUser ? 'border-orange-300' : 'border-transparent'
                  } ${getRankStyle(player.rank, player.isCurrentUser)} ${
                    animateRanks ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`text-lg font-bold ${player.isCurrentUser ? 'text-orange-600' : 'text-gray-700'} min-w-[35px]`}>
                      {player.rank}
                    </div>
                    
                    <div className={`w-9 h-9 rounded-lg ${colorScheme.bg} border ${colorScheme.border} flex items-center justify-center`}>
                      {getChangeIcon(player.change)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-base ${player.isCurrentUser ? 'text-orange-700' : 'text-gray-800'}`}>
                          {player.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          player.isCurrentUser 
                            ? 'bg-orange-100 text-orange-700' 
                            : `${colorScheme.badge} ${colorScheme.text}`
                        }`}>
                          {player.branch}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-right ${player.isCurrentUser ? 'text-orange-600' : 'text-gray-800'}`}>
                    <div className="font-bold text-lg">{getPointsDisplay(player.points)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-md">
            전체 순위 보기
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Users className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">
              {currentUser ? getFilteredData().length : allData.length || 147}
            </div>
            <div className="text-xs text-gray-600">
              {currentUser ? '지점단 참가자' : '전체 참가자'}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Trophy className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">
              {currentUser ? getFilteredData().find(p => p.isCurrentUser)?.rank || '-' : '-'}
            </div>
            <div className="text-xs text-gray-600">내 순위</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Star className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">
              {currentUser ? (currentUser.points / 1000).toFixed(1) + 'K' : '-'}
            </div>
            <div className="text-xs text-gray-600">내 포인트</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LeaderboardApp;