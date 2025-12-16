# Vercel 환경 변수 설정 가이드

## 📋 설정해야 할 환경 변수

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 방법 1: Vercel CLI로 설정 (추천)

### 1단계: Vercel CLI 설치 (이미 설치되어 있다면 생략)

```bash
npm install -g vercel
```

### 2단계: Vercel 로그인

```bash
vercel login
```

### 3단계: 환경 변수 추가

```bash
# Supabase URL 추가
vercel env add VITE_SUPABASE_URL production
# 입력 프롬프트에서 실제 Supabase URL 입력
# 예: https://your-project.supabase.co

# Supabase Anon Key 추가
vercel env add VITE_SUPABASE_ANON_KEY production
# 입력 프롬프트에서 실제 Anon Key 입력
```

### 4단계: 재배포

```bash
vercel --prod
```

---

## 방법 2: Vercel 대시보드에서 설정

### 1단계: Vercel 대시보드 접속

1. [vercel.com](https://vercel.com) 접속 후 로그인
2. 프로젝트 선택

### 2단계: 환경 변수 설정

1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 다음 변수들을 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

### 3단계: 재배포

- **Deployments** 탭으로 이동
- 최신 배포를 찾아서 **Redeploy** 클릭
- 또는 Git push로 자동 재배포

---

## 🔍 환경 변수가 올바르게 설정되었는지 확인

### 로컬에서 확인:
```bash
npm run dev
```
- 브라우저 콘솔(F12)에서 "Supabase에서 데이터 로드 중..." 메시지 확인

### Vercel에서 확인:
1. 배포된 URL 접속
2. 브라우저 콘솔(F12) 열기
3. 에러 메시지가 없는지 확인
4. 관리자 화면에서 파일 업로드 테스트

---

## ⚠️ 주의사항

1. **환경 변수 변경 후 반드시 재배포**
   - Vercel은 빌드 시점에 환경 변수를 주입합니다
   - 변수 변경 후 재배포하지 않으면 적용되지 않습니다

2. **VITE_ 접두사 필수**
   - Vite는 `VITE_`로 시작하는 환경 변수만 클라이언트에 노출합니다
   - 접두사 없으면 브라우저에서 접근 불가

3. **Anon Key는 공개해도 안전**
   - Public Key이므로 클라이언트에 노출되어도 안전합니다
   - Service Role Key는 절대 노출하면 안 됩니다!

4. **.env 파일은 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 포함되어 있습니다
   - 실수로 커밋하면 즉시 키를 재발급하세요

---

## 🎯 전체 배포 프로세스

```bash
# 1. 로컬 개발 환경 설정
copy env.example.txt .env
# .env 파일에 Supabase 정보 입력

# 2. 로컬에서 테스트
npm run dev

# 3. Vercel에 환경 변수 설정
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 4. Vercel에 배포
vercel --prod
```

---

## 📚 참고 문서

- [Vercel 환경 변수 가이드](https://vercel.com/docs/projects/environment-variables)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)

