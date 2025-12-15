const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('guinness_test_data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const output = {
  시트이름: sheetName,
  총데이터수: data.length,
  컬럼명: data.length > 0 ? Object.keys(data[0]) : [],
  샘플데이터: data.slice(0, 3)
};

fs.writeFileSync('excel-info.json', JSON.stringify(output, null, 2), 'utf8');
console.log('excel-info.json 파일에 저장되었습니다.');

