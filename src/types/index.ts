export interface ExcelData {
  지역단: string;
  사번: string;
  이름: string;
  성적: number;
  차월: number;
}

export interface RankedPlayer {
  rank: number;
  branch: string;
  employeeId: string;
  name: string;
  points: number;
  months: number;
  isCurrentUser?: boolean;
}

export interface RankingData {
  branch: RankedPlayer[];
  region: RankedPlayer[];
  rookie: RankedPlayer[];
}

export type TabType = 'branch' | 'region' | 'rookie';




