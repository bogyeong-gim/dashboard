const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// CORS 설정 (프론트엔드에서 접근 가능하도록)
app.use(cors());
app.use(express.json());

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 항상 같은 이름으로 저장 (최신 파일로 덮어쓰기)
    cb(null, 'latest.xlsx');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('엑셀 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  }
});

// 파일 업로드 엔드포인트 (관리자용)
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }
    
    console.log('✅ 파일 업로드 성공:', req.file.filename);
    
    res.json({
      success: true,
      message: '파일이 업로드되었습니다.',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ 업로드 오류:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

// 파일 다운로드 엔드포인트 (모든 사용자용)
app.get('/api/data', (req, res) => {
  try {
    const filePath = path.join(uploadDir, 'latest.xlsx');
    
    // 파일이 없으면 404 반환 (초기 데이터 없음)
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ 업로드된 파일이 없습니다.');
      return res.status(404).json({ 
        error: '데이터 파일이 없습니다.', 
        message: '엑셀 파일을 업로드해주세요.' 
      });
    }
    
    console.log('📂 최신 파일 전송:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ 다운로드 오류:', error);
    res.status(500).json({ error: '파일을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

// 현재 파일 정보 조회
app.get('/api/info', (req, res) => {
  try {
    const filePath = path.join(uploadDir, 'latest.xlsx');
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        filename: 'latest.xlsx',
        size: stats.size,
        uploadDate: stats.mtime
      });
    } else {
      res.json({
        exists: false,
        message: '업로드된 파일이 없습니다. 엑셀 파일을 업로드해주세요.'
      });
    }
  } catch (error) {
    console.error('❌ 정보 조회 오류:', error);
    res.status(500).json({ error: '파일 정보 조회 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 서버가 시작되었습니다!');
  console.log(`📡 서버 주소: http://localhost:${PORT}`);
  console.log('');
  console.log('📌 API 엔드포인트:');
  console.log(`   - 파일 업로드: POST http://localhost:${PORT}/api/upload`);
  console.log(`   - 파일 조회:   GET  http://localhost:${PORT}/api/data`);
  console.log(`   - 서버 상태:   GET  http://localhost:${PORT}/api/health`);
  console.log(`   - 파일 정보:   GET  http://localhost:${PORT}/api/info`);
  console.log('');
});

