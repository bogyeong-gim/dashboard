const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('guinness_test_data.xlsx', { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  console.log('시트 이름:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  if (data.length > 0) {
    console.log('\n컬럼명:', Object.keys(data[0]));
    console.log('\n첫 5개 데이터:');
    data.slice(0, 5).forEach((row, idx) => {
      console.log(`${idx + 1}:`, row);
    });
    console.log('\n총 데이터 수:', data.length);
  } else {
    console.log('데이터가 없습니다.');
  }
} catch (error) {
  console.error('오류:', error.message);
}

