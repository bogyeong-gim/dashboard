import { ExcelData, RankedPlayer, RankingData } from '../types';

// 신인 기준: 차월이 12개월 이하
const ROOKIE_THRESHOLD = 12;

export const processExcelData = (data: ExcelData[], currentUserId?: string): RankingData => {
  // 지점별 랭킹 (전체)
  const branchRanking = createRanking(data, currentUserId);

  // 지역단별 랭킹 (전체)
  const regionRanking = createRanking(data, currentUserId);

  // 신인 랭킹 (차월 12개월 이하만)
  const rookieData = data.filter(item => item.차월 <= ROOKIE_THRESHOLD);
  const rookieRanking = createRanking(rookieData, currentUserId);

  return {
    branch: branchRanking,
    region: regionRanking,
    rookie: rookieRanking
  };
};

const createRanking = (data: ExcelData[], currentUserId?: string): RankedPlayer[] => {
  // 성적 기준으로 내림차순 정렬
  const sorted = [...data].sort((a, b) => b.성적 - a.성적);

  // 랭킹 부여
  const ranked: RankedPlayer[] = sorted.map((item, index) => ({
    rank: index + 1,
    branch: item.지역단,
    employeeId: item.사번,
    name: item.이름,
    points: item.성적,
    months: item.차월,
    isCurrentUser: currentUserId ? item.사번 === currentUserId : false
  }));

  // 현재 사용자의 순위 확인
  if (currentUserId) {
    const userIndex = ranked.findIndex(player => player.employeeId === currentUserId);
    
    // 사용자가 15등 안에 없는 경우
    if (userIndex > 14) {
      // 1~15등 + 사용자
      return [...ranked.slice(0, 15), ranked[userIndex]];
    }
  }

  // 15등까지만 반환 (사용자가 15등 안에 있거나 로그인하지 않은 경우)
  return ranked.slice(0, 15);
};

export const getUserRankInfo = (data: ExcelData[], employeeId: string) => {
  const sorted = [...data].sort((a, b) => b.성적 - a.성적);
  const userIndex = sorted.findIndex(item => item.사번 === employeeId);
  
  if (userIndex === -1) {
    return null;
  }

  const userData = sorted[userIndex];
  
  return {
    rank: userIndex + 1,
    name: userData.이름,
    points: userData.성적,
    totalParticipants: data.length,
    branch: userData.지역단,
    months: userData.차월
  };
};

// 로컬 스토리지에 데이터 저장
export const saveDataToStorage = (data: ExcelData[]) => {
  localStorage.setItem('leaderboardData', JSON.stringify(data));
  localStorage.setItem('lastUpdated', new Date().toISOString());
};

// 로컬 스토리지에서 데이터 불러오기
export const loadDataFromStorage = (): ExcelData[] | null => {
  const data = localStorage.getItem('leaderboardData');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse data from storage:', error);
      return null;
    }
  }
  return null;
};

// 마지막 업데이트 시간 가져오기
export const getLastUpdatedTime = (): string | null => {
  return localStorage.getItem('lastUpdated');
};




