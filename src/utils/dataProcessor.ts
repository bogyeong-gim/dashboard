import { ExcelData, RankedPlayer, RankingData } from '../types';

// 신인 기준: 차월이 13개월 이하
const ROOKIE_THRESHOLD = 13;

export const processExcelData = (data: ExcelData[], currentUserId?: string): RankingData => {
  // 로그인한 사용자의 지점과 지역단 정보 가져오기
  let userBranch: string | undefined;
  let userRegion: string | undefined;
  
  if (currentUserId) {
    const userData = data.find(item => item.사번 === currentUserId);
    if (userData) {
      userBranch = userData.지점;
      userRegion = userData.지역단;
    }
  }

  // 지점별 랭킹 (로그인한 사용자의 지점만, 지점 내에서 순위 계산)
  const branchData = userBranch 
    ? data.filter(item => item.지점 === userBranch)
    : data;
  const branchRanking = createRanking(branchData, currentUserId);
  
  console.log('🔍 지점별 랭킹:', {
    지점: userBranch,
    필터링된_데이터_수: branchData.length,
    첫_3명_순위: branchRanking.slice(0, 3).map(p => ({ 이름: p.name, 순위: p.rank }))
  });

  // 지역단별 랭킹 (로그인한 사용자의 지역단만, 지역단 내에서 순위 계산)
  const regionData = userRegion
    ? data.filter(item => item.지역단 === userRegion)
    : data;
  const regionRanking = createRanking(regionData, currentUserId);

  // 신인 랭킹 (로그인한 사용자의 지점 내 신인만, 차월 13개월 이하, 지점 내 신인 중에서 순위 계산)
  const rookieData = userBranch
    ? data.filter(item => item.차월 <= ROOKIE_THRESHOLD && item.지점 === userBranch)
    : data.filter(item => item.차월 <= ROOKIE_THRESHOLD);
  const rookieRanking = createRanking(rookieData, currentUserId);

  return {
    branch: branchRanking,
    region: regionRanking,
    rookie: rookieRanking
  };
};

const createRanking = (data: ExcelData[], currentUserId?: string): RankedPlayer[] => {
  // 필터링된 데이터가 비어있으면 빈 배열 반환
  if (data.length === 0) {
    return [];
  }

  // 성적 기준으로 내림차순 정렬
  const sorted = [...data].sort((a, b) => b.성적 - a.성적);

  // 랭킹 부여 (필터링된 데이터 내에서 1등부터 시작)
  // 중요: index + 1로 필터링된 그룹 내에서의 순위를 부여
  const ranked: RankedPlayer[] = sorted.map((item, index) => {
    const localRank = index + 1; // 필터링된 그룹 내에서의 순위 (1, 2, 3...)
    
    return {
      rank: localRank, // 지점/지역단 내 순위
      branch: item.지점,
      employeeId: item.사번,
      name: item.이름,
      points: item.성적,
      months: item.차월,
      isCurrentUser: currentUserId ? item.사번 === currentUserId : false
    };
  });

  // 현재 사용자의 순위 확인
  if (currentUserId) {
    const userIndex = ranked.findIndex(player => player.employeeId === currentUserId);
    
    // 사용자가 15등 안에 없는 경우
    if (userIndex > 14) {
      // 상위 15명 + 사용자 (모두 필터링된 그룹 내 순위)
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
    branch: userData.지점,
    months: userData.차월
  };
};

