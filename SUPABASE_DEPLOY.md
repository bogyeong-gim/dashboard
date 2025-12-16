# 🌟 Supabase + Vercel 배포 가이드

**가장 현대적이고 확장 가능한 방법!**

백엔드 서버 없이 Vercel 하나로만 배포하고, Supabase를 백엔드로 사용합니다.

---

## ✅ 장점

- 🚀 **Vercel만 배포** (백엔드 서버 불필요)
- 💾 **파일 영구 저장** (Supabase Storage)
- 📊 **선택적 데이터베이스** (파싱된 데이터 저장 가능)
- ⚡ **실시간 업데이트** (선택사항)
- 🌍 **글로벌 CDN** (빠른 속도)
- 💰 **무료** (500MB 스토리지, 500MB 데이터 전송)
- 🔒 **보안** (RLS, 인증 기능)

---

## 📝 단계별 가이드

### 1단계: Supabase 프로젝트 생성

1. **[supabase.com](https://supabase.com) 가입**
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Name: `dashboard`
   - Database Password: 안전한 비밀번호 입력
   - Region: `Northeast Asia (Seoul)` 선택 ⭐
   - "Create new project" 클릭

3. **프로젝트 정보 복사**
   - Settings → API
   - `Project URL` 복사
   - `anon public` 키 복사

### 2단계: Supabase Storage 버킷 생성

1. **Storage 메뉴 이동**
   - 왼쪽 메뉴에서 "Storage" 클릭

2. **새 버킷 생성**
   - "Create a new bucket" 클릭
   - Name: `excel-files`
   - Public: ✅ 체크 (모든 사용자가 다운로드 가능)
   - "Create bucket" 클릭

3. **정책 설정** (선택사항: 업로드 제한)
   - 기본적으로 읽기는 모두 가능
   - 쓰기(업로드)는 인증된 사용자만 가능하게 설정 가능

---

### 3단계: 코드 수정

#### A. 의존성 설치

```bash
npm install @supabase/supabase-js
```

#### B. Supabase 클라이언트 생성

새 파일 생성: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### C. remixed.tsx 수정

기존 Express API 호출을 Supabase로 변경:

**기존 코드 (Express):**
```typescript
// 서버에서 엑셀 파일 로드
const response = await fetch(`${API_URL}/api/data`);
const buffer = await response.arrayBuffer();
```

**새 코드 (Supabase):**
```typescript
import { supabase } from './lib/supabase';

// Supabase에서 엑셀 파일 로드
const { data, error } = await supabase.storage
  .from('excel-files')
  .download('latest.xlsx');

if (error) {
  console.log('ℹ️ 업로드된 파일이 없습니다.');
  setAllData([]);
  return;
}

const buffer = await data.arrayBuffer();
```

**파일 업로드 (Supabase):**
```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    // Supabase Storage에 업로드 (기존 파일 덮어쓰기)
    const { error: uploadError } = await supabase.storage
      .from('excel-files')
      .upload('latest.xlsx', file, {
        cacheControl: '3600',
        upsert: true // 기존 파일 덮어쓰기
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('✅ 파일 업로드 성공!');
    
    // 업로드 후 데이터 다시 로드
    const { data, error: downloadError } = await supabase.storage
      .from('excel-files')
      .download('latest.xlsx');

    if (downloadError) throw downloadError;

    const buffer = await data.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    // ... 기존 파싱 코드 ...
    
    alert(`✅ 파일이 업로드되었습니다! (${parsedData.length}명)`);
  } catch (error) {
    console.error('❌ 업로드 오류:', error);
    alert('파일 업로드 중 오류가 발생했습니다.');
  }
};
```

---

### 4단계: 환경 변수 설정

#### 로컬 개발용 (.env)

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Vercel 배포용

```bash
# Vercel CLI로 환경 변수 추가
vercel env add VITE_SUPABASE_URL production
# 입력: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 입력: your-anon-key
```

또는 Vercel 대시보드에서:
- Project → Settings → Environment Variables

---

### 5단계: Vercel 배포

```bash
# 1. 빌드 테스트
npm run build

# 2. 로컬 미리보기
npm run preview

# 3. Vercel 배포
vercel --prod
```

---

## 🎯 완성된 구조

```
┌─────────────────────────────────────┐
│         Vercel (프론트엔드)          │
│  - React/Vite                       │
│  - UI 표시                          │
│  - 엑셀 파싱                        │
└───────────┬─────────────────────────┘
            │
            ↓ API 호출
┌─────────────────────────────────────┐
│      Supabase (백엔드)              │
│  - Storage (엑셀 파일 저장)         │
│  - Database (선택사항)              │
│  - Auth (선택사항)                  │
└─────────────────────────────────────┘
```

---

## 🚀 추가 기능 (선택사항)

### 1. 데이터베이스에 파싱된 데이터 저장

엑셀을 파싱한 후 DB에 저장하면:
- 더 빠른 조회 속도
- 복잡한 쿼리 가능
- 실시간 업데이트

**테이블 생성:**
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  region TEXT,
  branch TEXT,
  employee_id TEXT UNIQUE,
  name TEXT,
  points INTEGER,
  months INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**데이터 저장 코드:**
```typescript
// 엑셀 파싱 후
const { error } = await supabase
  .from('employees')
  .upsert(parsedData, { onConflict: 'employee_id' });
```

### 2. 관리자 인증 추가

```typescript
// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
});

// 업로드 시 인증 확인
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert('로그인이 필요합니다.');
  return;
}
```

### 3. 실시간 업데이트

```typescript
// 다른 사용자가 업로드하면 자동 새로고침
supabase
  .channel('excel-uploads')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'storage', table: 'objects' },
    payload => {
      console.log('새 파일 업로드됨!', payload);
      loadData(); // 자동 새로고침
    }
  )
  .subscribe();
```

---

## 💰 Supabase 무료 티어

| 항목 | 제한 |
|------|------|
| 스토리지 | 1GB |
| 데이터 전송 | 2GB/월 |
| 데이터베이스 | 500MB |
| 동시 연결 | 무제한 |
| 가격 | **무료** |

대부분의 중소규모 프로젝트에 충분합니다!

---

## 🐛 트러블슈팅

### 파일 업로드 안 됨
- Storage 버킷이 생성되었는지 확인
- 버킷 이름이 `excel-files`인지 확인
- Public 설정 확인

### 다운로드 안 됨
- 파일이 업로드되었는지 Supabase 대시보드에서 확인
- Storage → excel-files → latest.xlsx 확인

### CORS 오류
- Supabase는 자동으로 CORS 설정됨
- 환경 변수가 올바른지 확인

---

## 🆚 최종 비교

| 방법 | 배포 | 비용 | 속도 | 확장성 | 복잡도 |
|------|------|------|------|--------|--------|
| **Supabase** | ⭐⭐⭐⭐⭐ | 무료 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 중간 |
| Render 통합 | ⭐⭐⭐⭐ | 무료 | ⚡⚡ | ⭐⭐⭐ | 쉬움 |
| Vercel+Render | ⭐⭐⭐ | 무료 | ⚡⚡⚡ | ⭐⭐⭐⭐ | 복잡 |

---

## 🎉 완료!

이제 Vercel 하나로만 배포하고, Supabase를 백엔드로 사용할 수 있습니다!

**다음 단계:**
1. Supabase 프로젝트 생성
2. Storage 버킷 생성
3. 코드 수정 (제가 도와드릴 수 있습니다!)
4. Vercel 배포
5. 테스트 ✅

