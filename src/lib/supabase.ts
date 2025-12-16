import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 디버깅: 환경 변수 확인 (배포 후 브라우저 콘솔에서 확인)
console.log('🔍 Supabase 설정 확인:');
console.log('- URL:', supabaseUrl || '❌ 설정되지 않음');
console.log('- Key:', supabaseAnonKey ? '✅ 설정됨 (길이: ' + supabaseAnonKey.length + ')' : '❌ 설정되지 않음');

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // 간단한 사용을 위해 세션 유지 비활성화
  }
})

// Storage 버킷 이름
export const BUCKET_NAME = 'excel-files'
export const FILE_NAME = 'latest.xlsx'

console.log('- Bucket 이름:', BUCKET_NAME);
console.log('- 파일 이름:', FILE_NAME);

