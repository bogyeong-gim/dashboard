import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // 간단한 사용을 위해 세션 유지 비활성화
  }
})

// Storage 버킷 이름
export const BUCKET_NAME = 'excel-files'
export const FILE_NAME = 'latest.xlsx'

