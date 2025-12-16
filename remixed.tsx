import React, { useState, useEffect } from 'react';
import { Trophy, Star, Users, Calendar, ChevronLeft, ChevronUp, ChevronDown, Minus, Search, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EmployeeData {
  region: string;        // 지역단
  branch: string;        // 지점
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

  // 서버에서 엑셀 파일 로드 (초기 로드 - 파일이 없으면 무시)
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/data');
        
        // 404면 파일이 없는 것이므로 무시
        if (response.status === 404) {
          console.log('ℹ️ 업로드된 파일이 없습니다. 엑셀 파일을 업로드해주세요.');
          setAllData([]);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('📊 서버에서 데이터 로드 완료:', {
          시트명: sheetName,
          총데이터수: jsonData.length,
          첫번째행샘플: jsonData[0]
        });
        
        const data: EmployeeData[] = jsonData.map((row: any) => {
          const randomValue = Math.random();
          const changeValue: 'up' | 'down' | 'stable' = randomValue > 0.6 ? 'up' : (randomValue > 0.3 ? 'stable' : 'down');
          return {
            region: String(row['지역단'] || row['region'] || '').trim(),
            branch: String(row['지점'] || row['branch'] || '').trim(),
            employeeId: String(row['사번'] || row['employeeId'] || '').trim(),
            name: String(row['이름'] || row['name'] || '').trim(),
            points: parseInt(String(row['성적'] || row['points'] || '0').replace(/,/g, '')) || 0,
            months: parseInt(String(row['차월'] || row['months'] || '0')) || 0,
            change: changeValue
          };
        }).filter(item => item.employeeId && item.name && item.branch);
        
        console.log('✅ 변환된 데이터:', {
          총개수: data.length,
          지역단목록: [...new Set(data.map(d => d.region))],
          지점목록: [...new Set(data.map(d => d.branch))],
          첫5개: data.slice(0, 5)
        });
        
        setAllData(data);
      } catch (error) {
        console.error('❌ 서버에서 데이터 로드 오류:', error);
        console.log('서버가 실행 중인지 확인해주세요. (npm run server)');
        setAllData([]);
      }
    };
    
    loadData();
  }, []);

  // 서버로 엑셀 파일 업로드 (관리자용)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // FormData로 파일 전송
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 서버로 파일 업로드 중...');
      
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const result = await response.json();
      console.log('✅ 서버 업로드 성공:', result);

      // 업로드 후 데이터 다시 로드
      const dataResponse = await fetch('http://localhost:3001/api/data');
      const buffer = await dataResponse.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const data: EmployeeData[] = jsonData.map((row: any) => {
        const randomValue = Math.random();
        const changeValue: 'up' | 'down' | 'stable' = randomValue > 0.6 ? 'up' : (randomValue > 0.3 ? 'stable' : 'down');
        return {
          region: String(row['지역단'] || row['region'] || '').trim(),
          branch: String(row['지점'] || row['branch'] || '').trim(),
          employeeId: String(row['사번'] || row['employeeId'] || '').trim(),
          name: String(row['이름'] || row['name'] || '').trim(),
          points: parseInt(String(row['성적'] || row['points'] || '0').replace(/,/g, '')) || 0,
          months: parseInt(String(row['차월'] || row['months'] || '0')) || 0,
          change: changeValue
        };
      }).filter(item => item.employeeId && item.name && item.branch);

      setAllData(data);
      alert(`✅ 엑셀 파일이 서버에 업로드되었습니다! (${data.length}명의 데이터)\n모든 사용자가 업데이트된 데이터를 볼 수 있습니다.`);
      
      // 파일 입력 초기화
      event.target.value = '';
    } catch (error) {
      console.error('❌ 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  // 지점별 컬러 매핑 (동적으로 생성)
  const getBranchColors = (branch: string) => {
    const colorSchemes = [
      { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100', border: 'border-orange-200' },
      { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100', border: 'border-amber-200' },
      { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100', border: 'border-red-200' },
      { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100', border: 'border-blue-200' },
      { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100', border: 'border-green-200' },
      { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100', border: 'border-purple-200' },
      { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100', border: 'border-pink-200' },
    ];
    
    // 지점명을 해시하여 일관된 색상 할당
    const hash = branch.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorSchemes[hash % colorSchemes.length];
  };

  // 동적 뉴스 아이템 생성
  const getNewsItems = () => {
    if (allData.length === 0) {
      return ['📊 데이터를 불러오는 중입니다...'];
    }

    const sortedByPoints = [...allData].sort((a, b) => b.points - a.points);
    const topPlayer = sortedByPoints[0];
    const rookies = allData.filter(p => p.months <= 12).sort((a, b) => b.points - a.points);
    const topRookie = rookies[0];
    
    const newsItems = [
      topPlayer ? `🎉 ${topPlayer.branch} ${topPlayer.name} FP ${(topPlayer.points / 10000).toFixed(0)}만점 ${topPlayer.points >= 1000000 ? '돌파!' : '선전!'}` : '',
      topRookie ? `🔥 신인 ${topRookie.name} FP ${topRookie.months}개월차 ${(topRookie.points / 10000).toFixed(0)}만점 달성` : '',
      sortedByPoints[1] ? `⭐ ${sortedByPoints[1].name} FP 2위 선전` : '',
      '🏆 TOP 10 진입자 특별 보상 지급',
      '💪 마감까지 열심히 달려봅시다',
      `🎯 전체 참가자 ${allData.length}명`
    ].filter(Boolean);
    
    return newsItems.length > 0 ? newsItems : ['🎉 기네스 리더보드에 오신 것을 환영합니다!'];
  };

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

  const getBranchColor = (branch: string) => {
    return getBranchColors(branch);
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

  // 데이터 필터링 및 순위 계산
  const getCurrentData = () => {
    if (allData.length === 0) {
      return [];
    }

    let filteredData = [...allData];
    
    // 탭에 따른 필터링
    switch(activeTab) {
      case 'branch':
        // 지점 탭: 사용자가 선택되면 동일 지점단만, 아니면 전체
        if (currentUser) {
          filteredData = filteredData.filter(person => person.branch === currentUser.branch);
        }
        break;
        
      case 'region':
        // 지역단 탭: 사용자가 선택되면 동일 지역만, 아니면 전체
        if (currentUser) {
          filteredData = filteredData.filter(person => person.region === currentUser.region);
        }
        break;
        
      case 'rookie':
        // 신인 탭: 12개월 이하만 필터링
        filteredData = filteredData.filter(person => person.months <= 12);
        // 사용자가 선택되면 동일 지점단 내 신인만
        if (currentUser) {
          filteredData = filteredData.filter(person => person.branch === currentUser.branch);
        }
        break;
    }
    
    // 성적순으로 정렬 (내림차순)
    const sortedData = filteredData.sort((a, b) => b.points - a.points);
    
    // 순위 부여
    return sortedData.map((person, index) => ({
      rank: index + 1,
      branch: person.branch,
      name: person.name,
      points: person.points,
      change: person.change,
      months: person.months,
      isCurrentUser: currentUser ? person.employeeId === currentUser.employeeId : false
    }));
  };

  const currentData = getCurrentData();
  const top3 = currentData.slice(0, 3);
  const restData = currentData.slice(3);
  const newsItems = getNewsItems();

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
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg cursor-pointer hover:shadow-xl transform hover:scale-[1.02]">
              <Upload className="w-5 h-5" />
              <span className="text-base">엑셀 파일 업로드</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <div className="mt-2 text-xs text-center">
              {allData.length > 0 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-bold text-sm">✅ 로드된 데이터: {allData.length}명</p>
                  <p className="text-green-600 text-xs mt-1">대시보드가 활성화되었습니다!</p>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                  <p className="text-orange-800 font-bold text-sm mb-2">⚠️ 엑셀 파일을 업로드해주세요</p>
                  <p className="text-orange-700 text-xs">데이터가 없으면 대시보드를 표시할 수 없습니다.</p>
                </div>
              )}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">📋 엑셀 파일 형식</p>
                <p className="text-blue-800 text-left">
                  <span className="font-medium">필수 컬럼:</span><br/>
                  • 지점<br/>
                  • 지역단<br/>
                  • 사번<br/>
                  • 이름<br/>
                  • 성적<br/>
                  • 차월
                </p>
              </div>
            </div>
          </div>

          {/* 사번 검색 */}
          {allData.length > 0 && (
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
          )}

          {allData.length > 0 && (
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
          )}

          {allData.length > 0 && (
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
          )}

          {allData.length === 0 ? (
            <div className="flex justify-center items-center mt-6 p-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-dashed border-orange-300">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-800 font-bold text-lg mb-2">데이터가 없습니다</p>
                <p className="text-gray-600 text-sm mb-4">위의 "엑셀 파일 업로드" 버튼을 클릭하여<br/>데이터를 업로드해주세요.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-200">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600 font-medium text-sm">엑셀 파일 필수</span>
                </div>
              </div>
            </div>
          ) : currentData.length >= 3 ? (
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
          ) : (
            <div className="flex justify-center items-center mt-6 p-8 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-gray-700 text-center">
                🔍 데이터가 충분하지 않습니다.<br/>
                <span className="text-sm text-gray-600">다른 탭을 선택하거나 필터를 변경해보세요.</span>
              </p>
            </div>
          )}
        </div>

        {allData.length > 0 && restData.length > 0 && (
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
        )}

        {allData.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
              <Users className="w-5 h-5 mx-auto mb-2 text-orange-500" />
              <div className="text-xl font-bold text-gray-800">
                {currentData.length || allData.length || 0}
              </div>
              <div className="text-xs text-gray-600">
                {currentUser ? `${activeTab === 'branch' ? '지점단' : activeTab === 'region' ? '지역' : '신인'} 참가자` : '전체 참가자'}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
              <Trophy className="w-5 h-5 mx-auto mb-2 text-orange-500" />
              <div className="text-xl font-bold text-gray-800">
                {currentUser ? currentData.find(p => p.isCurrentUser)?.rank || '-' : '-'}
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
        )}
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