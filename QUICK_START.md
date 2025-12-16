# ⚡ 빠른 시작 가이드 (5분!)

이 가이드를 따라하면 5-10분 안에 배포 완료!

---

## ✅ 체크리스트

### 1단계: Supabase 설정 (3분)

- [ ] [supabase.com](https://supabase.com) 가입 (GitHub 로그인)
- [ ] 새 프로젝트 생성
  - Name: `dashboard`
  - Region: `Northeast Asia (Seoul)` ⭐
- [ ] Storage 버킷 생성
  - Name: `excel-files`
  - Public: ✅ 체크
- [ ] API 키 복사
  - Settings → API
  - Project URL 복사
  - anon public 키 복사

---

### 2단계: Vercel 배포 (2분)

```bash
# Vercel CLI 설치 및 로그인
npm install -g vercel
vercel login

# 환경 변수 설정
vercel env add VITE_SUPABASE_URL production
# 붙여넣기: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 붙여넣기: your-anon-public-key

# 배포!
vercel --prod
```

---

### 3단계: 테스트 (1분)

- [ ] 배포된 URL 접속
- [ ] 엑셀 파일 업로드
- [ ] 데이터 확인
- [ ] 다른 기기에서 같은 URL 접속
- [ ] 동일한 데이터 확인 ✅

---

## 🎉 완료!

이제 전 세계 어디서든 같은 데이터를 볼 수 있습니다!

**배포된 URL**: `https://______________.vercel.app`

---

## 🐛 문제 해결

### "업로드된 파일이 없습니다"
→ Supabase에서 엑셀 파일 업로드 (첫 업로드 필요)

### "파일 업로드 오류"
→ 환경 변수 확인 (Vercel 대시보드 → Settings → Environment Variables)

### "다른 기기에서 안 보여요"
→ 브라우저 캐시 삭제 (Ctrl+Shift+R)

---

## 📖 상세 가이드

더 자세한 내용은 다음 파일 참고:
- **[README.md](./README.md)** - 전체 문서
- **[SUPABASE_DEPLOY.md](./SUPABASE_DEPLOY.md)** - 상세 배포 가이드

