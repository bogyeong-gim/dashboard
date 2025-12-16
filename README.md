# 🏆 기네스 리더보드 대시보드

엑셀 데이터 기반 실시간 성적 순위 시스템

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)

## ✨ 주요 기능

### 📊 동적 랭킹 시스템
- **지점 탭**: 사용자 선택 시 동일 지점단 내 순위, 미선택 시 전체 순위
- **지역단 탭**: 사용자 선택 시 동일 지역 내 순위, 미선택 시 전체 순위  
- **신인 탭**: 차월 12개월 이하 직원만 필터링 (사용자 선택 시 동일 지점단 내 신인만)

### 🎯 개인 맞춤 기능
- 사번으로 직원 검색
- 본인 순위 하이라이트 표시 (주황색 테두리)
- 개인 통계 실시간 표시
  - 현재 탭 기준 참가자 수
  - 내 순위
  - 내 포인트

### 🏅 TOP 3 시각화
- 1위: 🏆 금색 시상대 (가장 높음)
- 2위: 🥈 은색 시상대
- 3위: 🥉 동메달 시상대
- 애니메이션 효과로 탭 전환 시 부드러운 전환

### 📰 실시간 뉴스 마퀴
- 현재 1위 선수 정보 자동 표시
- 신인 1위 정보
- 전체 참가자 수
- 자동 스크롤 애니메이션

### 📤 엑셀 파일 관리
- 드래그 앤 드롭 또는 버튼 클릭으로 업로드
- Supabase Storage에 영구 저장
- 자동 데이터 파싱 및 검증
- **모든 기기에서 동일한 데이터 공유** ✨

### 🎨 동적 UI
- 지점별 자동 색상 할당 (7가지 색상 팔레트)
- 스와이프 제스처로 탭 전환 (모바일 최적화)
- 반응형 디자인
- 부드러운 애니메이션 효과

---

## 📋 엑셀 파일 형식

### 필수 컬럼

| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| **지점** | 지점명 | 정동, 불광, 로얄 |
| **지역단** | 지역단명 | 서울, 경기, 부산 |
| **사번** | 직원 사번 (고유값) | 1000001 |
| **이름** | 직원 이름 | 김민준 |
| **성적** | 성과 점수 | 850000 |
| **차월** | 재직 개월 수 | 24 |

### 예시

| 지점 | 지역단 | 사번 | 이름 | 성적 | 차월 |
|------|--------|------|------|---------|------|
| 정동 | 서울 | 1000001 | 김민준 | 850000 | 24 |
| 불광 | 서울 | 1000002 | 이서연 | 820000 | 36 |
| 로얄 | 경기 | 1000003 | 박지호 | 795000 | 18 |

---

## 🚀 빠른 시작 (로컬 개발)

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 생성

1. **[supabase.com](https://supabase.com) 가입** (무료)
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Name: `dashboard`
   - Database Password: 안전한 비밀번호 입력
   - Region: `Northeast Asia (Seoul)` 선택 ⭐
   - "Create new project" 클릭

3. **Storage 버킷 생성**
   - 왼쪽 메뉴 → "Storage" 클릭
   - "Create a new bucket" 클릭
   - Name: `excel-files`
   - Public: ✅ 체크
   - "Create bucket" 클릭

4. **API 키 복사**
   - Settings → API
   - `Project URL` 복사
   - `anon public` 키 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 엑셀 파일 업로드

1. 앱 화면에서 "엑셀 파일 업로드" 버튼 클릭
2. 위의 "엑셀 파일 형식"에 맞는 파일 선택
3. 업로드 완료 후 대시보드 자동 표시 ✅

---

## 🌍 프로덕션 배포 (Vercel)

### 전제 조건

- ✅ Supabase 프로젝트 생성 완료
- ✅ `excel-files` 버킷 생성 완료
- ✅ API URL과 Anon Key 확보

### Vercel CLI 배포 (추천)

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 환경 변수 설정
vercel env add VITE_SUPABASE_URL production
# 입력: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 입력: your-anon-public-key

# 4. 배포
vercel --prod
```

### Vercel 대시보드 배포

1. **[vercel.com](https://vercel.com) 가입**
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - "Environment Variables" 섹션:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your-anon-public-key
     ```

4. **Deploy 클릭**

5. **완료!** 🎉
   - 배포된 URL로 접속
   - 모든 기기에서 동일한 데이터 확인 가능

---

## 📱 사용 방법

### 관리자

1. **엑셀 파일 업로드**
   - "엑셀 파일 업로드" 버튼 클릭
   - 새로운 엑셀 파일 선택
   - 자동으로 Supabase에 저장됨
   - **모든 사용자에게 즉시 반영** ✨

2. **데이터 확인**
   - 업로드 후 로드된 데이터 수 확인
   - 각 탭에서 데이터 정상 표시 확인

### 일반 사용자

1. **사번 검색**
   - 사번 입력란에 본인 사번 입력
   - "검색" 버튼 클릭 또는 Enter 키

2. **순위 확인**
   - 본인 순위가 주황색으로 하이라이트됨
   - 지점/지역단/신인 탭 전환하여 다양한 순위 확인
   - 스와이프로 탭 전환 가능 (모바일)

3. **개인 통계 확인**
   - 하단에 참가자 수, 내 순위, 내 포인트 표시

---

## 🛠️ 기술 스택

### Frontend
- **React 18.2** - UI 라이브러리
- **TypeScript 5.2** - 타입 안정성
- **Vite 5.0** - 빌드 도구
- **Tailwind CSS 3.4** - 스타일링

### Backend (Serverless)
- **Supabase Storage** - 엑셀 파일 클라우드 저장
  - 모든 기기에서 동일한 데이터 공유 ✨
  - 영구 저장 및 자동 백업
  - 글로벌 CDN으로 빠른 다운로드

### Libraries
- **@supabase/supabase-js** - Supabase 클라이언트
- **xlsx 0.18.5** - 엑셀 파일 파싱
- **lucide-react 0.294** - 아이콘 라이브러리

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────┐
│         사용자 (모든 기기)           │
│  - PC, 모바일, 태블릿 등             │
└───────────┬─────────────────────────┘
            │ URL 접속
            ↓
┌─────────────────────────────────────┐
│      Vercel (프론트엔드 CDN)        │
│  - React/Vite 앱                    │
│  - UI 렌더링                        │
│  - 엑셀 파싱 (브라우저)             │
└───────────┬─────────────────────────┘
            │ Storage API 호출
            ↓
┌─────────────────────────────────────┐
│   Supabase Storage (클라우드)       │
│  - latest.xlsx 파일 저장            │
│  - 글로벌 CDN (빠른 다운로드)       │
│  - 자동 백업 및 영구 저장           │
└─────────────────────────────────────┘
```

### 데이터 흐름

1. **관리자가 파일 업로드** (어떤 기기에서든)
   - 엑셀 파일 → Supabase Storage에 업로드
   - 기존 `latest.xlsx` 파일 자동 덮어쓰기
   - ✅ 클라우드에 영구 저장

2. **사용자가 접속** (어떤 기기에서든)
   - Supabase Storage에서 `latest.xlsx` 다운로드
   - 브라우저에서 실시간 파싱 및 렌더링
   - ✅ **모든 기기에서 동일한 최신 데이터 표시!**

3. **데이터 공유 원리**
   - ❌ localStorage 사용 안 함 (각 기기마다 다름)
   - ✅ Supabase Storage 사용 (클라우드에서 공유)

---

## 🐛 트러블슈팅

### 1. 데이터가 로드되지 않아요

**증상**: "업로드된 파일이 없습니다" 메시지

**해결책**:
1. Supabase 대시보드 → Storage → `excel-files` 확인
2. `latest.xlsx` 파일이 있는지 확인
3. 버킷이 Public으로 설정되었는지 확인
4. 브라우저 콘솔(F12)에서 오류 메시지 확인

### 2. 업로드가 안 돼요

**증상**: "파일 업로드 중 오류가 발생했습니다"

**해결책**:
1. 환경 변수 확인 (`.env` 또는 Vercel 설정)
2. Supabase URL과 Anon Key가 올바른지 확인
3. `excel-files` 버킷이 생성되었는지 확인
4. 브라우저 콘솔에서 구체적인 오류 확인

### 3. 다른 기기에서 데이터가 다르게 보여요

**증상**: PC에서 업로드했는데 모바일에서 안 보임

**해결책**:
1. 두 기기 모두 같은 URL에 접속했는지 확인
2. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
3. Supabase 대시보드에서 파일이 올바르게 저장되었는지 확인

### 4. 빌드 오류

**증상**: `npm run build` 실패

**해결책**:
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 다시 빌드
npm run build
```

### 5. Supabase 연결 오류

**증상**: CORS 오류 또는 401 Unauthorized

**해결책**:
1. Supabase 프로젝트가 활성화되어 있는지 확인
2. API URL이 `https://`로 시작하는지 확인
3. Anon Key가 올바른지 확인 (Service Role Key 아님!)
4. 버킷 정책에서 `public` 읽기 권한 확인

---

## 💰 비용 안내

### Supabase (무료 티어)
- ✅ 스토리지: 1GB
- ✅ 데이터 전송: 2GB/월
- ✅ 무제한 API 요청
- ✅ 무료!

### Vercel (무료 티어)
- ✅ 무제한 배포
- ✅ 대역폭: 100GB/월
- ✅ 빌드: 6000분/월
- ✅ 무료!

**총 비용: 완전 무료! 💸**

---

## 🔒 보안

### 현재 보안 수준
- ✅ HTTPS 자동 적용 (Vercel + Supabase)
- ✅ 환경 변수로 API 키 관리
- ⚠️ 관리자 인증 없음 (누구나 업로드 가능)

### 관리자 인증 추가 (선택사항)

나중에 Supabase Auth를 사용하여 관리자만 업로드할 수 있도록 설정 가능:

```typescript
// 로그인 필요
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert('관리자만 업로드할 수 있습니다.');
  return;
}
```

---

## 📈 성능 최적화

- ✅ **Vercel CDN**: 전 세계 빠른 로딩
- ✅ **Supabase CDN**: 파일 다운로드 최적화
- ✅ **React 18**: 자동 배치 업데이트
- ✅ **Vite**: 빠른 빌드 및 개발 서버
- ✅ **Tailwind CSS**: 미사용 CSS 제거

---

## 🎯 완료된 기능 ✅

- [x] **Supabase Storage 통합** (백엔드 서버 불필요)
- [x] **동적 랭킹 시스템** (지점/지역단/신인)
- [x] **사번 검색 기능**
- [x] **TOP 3 시각화**
- [x] **실시간 뉴스 마퀴**
- [x] **반응형 디자인**
- [x] **다중 기기 데이터 공유** ⭐

---

## 🚀 향후 개선 사항

- [ ] 관리자 인증 시스템 (Supabase Auth)
- [ ] 데이터베이스 저장 (더 빠른 쿼리)
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 다크 모드 지원
- [ ] 순위 변동 히스토리 추적
- [ ] PDF 리포트 생성
- [ ] PWA 지원 (오프라인 모드)
- [ ] 다국어 지원 (i18n)

---

## 📚 추가 문서

- **[SUPABASE_DEPLOY.md](./SUPABASE_DEPLOY.md)** - 상세 배포 가이드
- **[env.example.txt](./env.example.txt)** - 환경 변수 설정 예시

---

## 🤝 기여

이슈 및 풀 리퀘스트 환영합니다!

---

## 📄 라이선스

MIT License

---

## 👨‍💻 개발자

Dashboard Project Team

---

**Made with ❤️ using React, TypeScript & Supabase**

🌟 모든 기기에서 동일한 데이터를 공유하는 현대적인 대시보드!
