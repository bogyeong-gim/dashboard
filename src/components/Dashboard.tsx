import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Star, Users, Calendar, ChevronLeft, ChevronUp, ChevronDown, Minus, LogOut } from 'lucide-react';
import { RankedPlayer, TabType, RankingData, ExcelData } from '../types';

// 신인 기준: 차월이 13개월 이하
const ROOKIE_THRESHOLD = 13;

interface DashboardProps {
  rankingData: RankingData;
  currentUserId: string;
  excelData: ExcelData[];
  onLogout: () => void;
  onAdminClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  rankingData, 
  currentUserId, 
  excelData,
  onLogout,
  onAdminClick
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('branch');
  const [animateRanks, setAnimateRanks] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const tabs: TabType[] = ['branch', 'region', 'rookie'];
  const tabLabels: Record<TabType, string> = {
    branch: '지점',
    region: '지역단',
    rookie: '신인'
  };

  // 지점별 컬러 매핑
  const branchColors: Record<string, { bg: string; text: string; badge: string; border: string }> = {};

  const getRandomColor = (branch: string) => {
    if (!branchColors[branch]) {
      const colors = [
        { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100', border: 'border-orange-200' },
        { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100', border: 'border-amber-200' },
        { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100', border: 'border-red-200' },
        { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100', border: 'border-rose-200' },
        { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100', border: 'border-pink-200' },
        { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100', border: 'border-purple-200' },
        { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100', border: 'border-indigo-200' },
      ];
      const index = Object.keys(branchColors).length % colors.length;
      branchColors[branch] = colors[index];
    }
    return branchColors[branch];
  };

  const getPointsDisplay = (points: number) => {
    return points.toLocaleString();
  };

  const getCurrentData = () => {
    return rankingData[activeTab];
  };

  const currentData = getCurrentData();
  const top3 = currentData.slice(0, 3);
  const restData = currentData.slice(3);

  // 로그인한 사용자의 지점과 지역단 정보 가져오기
  const userInfo = useMemo(() => {
    if (!currentUserId || excelData.length === 0) return null;
    const user = excelData.find(item => item.사번 === currentUserId);
    return user ? { branch: user.지점, region: user.지역단 } : null;
  }, [currentUserId, excelData]);

  // 탭에 따른 전체 참가자 수 계산
  const getTotalParticipants = useMemo(() => {
    if (excelData.length === 0) return 0;
    
    switch (activeTab) {
      case 'branch':
        // 지점 탭: 로그인한 사용자와 동일한 지점인 사람들의 전체 데이터 수
        if (userInfo?.branch) {
          return excelData.filter(item => item.지점 === userInfo.branch).length;
        }
        return excelData.length;
        
      case 'region':
        // 지역단 탭: 로그인한 사용자와 동일한 지역단인 사람들의 전체 데이터 수
        if (userInfo?.region) {
          return excelData.filter(item => item.지역단 === userInfo.region).length;
        }
        return excelData.length;
        
      case 'rookie':
        // 신인 탭: 로그인한 사용자의 지점의 신인 숫자
        if (userInfo?.branch) {
          return excelData.filter(
            item => item.차월 <= ROOKIE_THRESHOLD && item.지점 === userInfo.branch
          ).length;
        }
        return excelData.filter(item => item.차월 <= ROOKIE_THRESHOLD).length;
        
      default:
        return excelData.length;
    }
  }, [activeTab, excelData, userInfo]);

  const totalParticipants = getTotalParticipants;

  // 동적 뉴스 메시지 생성
  const newsItems = [
    top3[0] ? `🏆 1등: ${top3[0].name} (${top3[0].branch}) ${getPointsDisplay(top3[0].points)}점` : '🎉 최고 점수 달성자를 축하합니다!',
    top3[1] ? `🥈 2등: ${top3[1].name} (${top3[1].branch}) ${getPointsDisplay(top3[1].points)}점` : '',
    top3[2] ? `🥉 3등: ${top3[2].name} (${top3[2].branch}) ${getPointsDisplay(top3[2].points)}점` : '',
    '🔥 이번 달 신인왕 경쟁 치열',
    '💪 목표 달성까지 화이팅!',
    '🎯 개인 목표 달성률 상승 중'
  ].filter(item => item !== ''); // 빈 문자열 제거

  useEffect(() => {
    setAnimateRanks(true);
    const timer = setTimeout(() => setAnimateRanks(false), 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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

  const getChangeIcon = () => {
    // 변동 정보가 없으므로 중립 아이콘 표시
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getRankStyle = (isCurrentUser?: boolean) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-400 shadow-md';
    return 'bg-white hover:bg-gray-50/50';
  };

  const getBranchColor = (branch: string) => {
    return getRandomColor(branch);
  };

  // 현재 사용자 정보
  const currentUserData = currentData.find(player => player.isCurrentUser);

  // top3가 3개 미만일 경우를 대비한 안전 체크
  if (top3.length < 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">데이터가 충분하지 않습니다.</p>
          <button
            onClick={onLogout}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-4 shadow-lg border border-orange-100"
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
          <div className="flex items-center justify-between mb-6">
            <button onClick={onLogout} className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">로그아웃</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">12월 기네스 리더보드</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>진행중</span>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-medium transition-all text-sm shadow-sm ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg'
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
                  key={`${player.rank}-${player.employeeId}`}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                    player.isCurrentUser ? 'border-orange-300' : 'border-transparent'
                  } ${getRankStyle(player.isCurrentUser)} ${
                    animateRanks ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`text-lg font-bold ${player.isCurrentUser ? 'text-orange-600' : 'text-gray-700'} min-w-[35px]`}>
                      {player.rank}
                    </div>
                    
                    <div className={`w-9 h-9 rounded-lg ${colorScheme.bg} border ${colorScheme.border} flex items-center justify-center`}>
                      {getChangeIcon()}
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
                        {player.isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500 text-white">
                            나
                          </span>
                        )}
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
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Users className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">{totalParticipants}</div>
            <div className="text-xs text-gray-600">
              {activeTab === 'branch' ? '지점 참가자' : activeTab === 'region' ? '지역단 참가자' : '신인 참가자'}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Trophy className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">{currentUserData?.rank || '-'}</div>
            <div className="text-xs text-gray-600">내 순위</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <Star className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-gray-800">
              {currentUserData ? (currentUserData.points / 10000).toFixed(1) + '만' : '-'}
            </div>
            <div className="text-xs text-gray-600">내 포인트</div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onAdminClick}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            관리자 페이지
          </button>
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

export default Dashboard;




