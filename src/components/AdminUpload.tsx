import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelData {
  지역단: string;
  사번: string;
  이름: string;
  성적: number;
  차월: number;
}

interface AdminUploadProps {
  onDataUpload: (data: ExcelData[]) => void;
  onBack: () => void;
}

const AdminUpload: React.FC<AdminUploadProps> = ({ onDataUpload, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<ExcelData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
      setPreviewData([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setUploadStatus('idle');
      setErrorMessage('');
      setPreviewData([]);
    }
  };

  const parseExcelFile = (file: File): Promise<ExcelData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          
          if (!data) {
            throw new Error('파일 데이터를 읽을 수 없습니다.');
          }
          
          let jsonData: any[] = [];
          
          // CSV 파일 처리
          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              throw new Error('CSV 파일에 데이터가 없습니다.');
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            
            jsonData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim());
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index];
              });
              return row;
            });
          } 
          // Excel 파일 처리
          else {
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('엑셀 파일에 시트가 없습니다. 파일이 손상되었거나 올바른 형식이 아닙니다.');
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            if (!worksheet) {
              throw new Error('엑셀 시트를 읽을 수 없습니다.');
            }
            
            jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
          }

          if (!jsonData || jsonData.length === 0) {
            throw new Error('파일에 데이터가 없습니다.');
          }

          // 첫 번째 행의 컬럼 확인
          const firstRow = jsonData[0];
          const columns = Object.keys(firstRow);
          console.log('파일의 컬럼:', columns);
          console.log('첫 번째 데이터:', firstRow);

          // 데이터 검증 및 변환
          const parsedData: ExcelData[] = jsonData.map((row, index) => {
            // 필수 필드 확인
            const missing = [];
            if (!row['지역단']) missing.push('지역단');
            if (!row['사번']) missing.push('사번');
            if (!row['이름']) missing.push('이름');
            if (row['성적'] === undefined || row['성적'] === '') missing.push('성적');
            if (row['차월'] === undefined || row['차월'] === '') missing.push('차월');
            
            if (missing.length > 0) {
              throw new Error(`${index + 2}번째 행에 [${missing.join(', ')}] 데이터가 누락되었습니다.`);
            }

            return {
              지역단: String(row['지역단']).trim(),
              사번: String(row['사번']).trim(),
              이름: String(row['이름']).trim(),
              성적: Number(row['성적']),
              차월: Number(row['차월'])
            };
          });

          resolve(parsedData);
        } catch (error) {
          console.error('파일 파싱 에러:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      };

      // CSV는 텍스트로, Excel은 ArrayBuffer로 읽기
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrorMessage('');

    try {
      const data = await parseExcelFile(file);
      
      if (data.length === 0) {
        throw new Error('엑셀 파일에 데이터가 없습니다.');
      }

      setPreviewData(data.slice(0, 5)); // 처음 5개만 미리보기
      setUploadStatus('success');
      
      // 데이터 저장
      setTimeout(() => {
        onDataUpload(data);
      }, 1500);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-orange-100">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">뒤로가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">관리자 - 데이터 업로드</h1>
            <div className="w-20"></div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 엑셀 파일 형식 안내</h3>
            <p className="text-sm text-blue-800">
              엑셀 파일에는 다음 열이 포함되어야 합니다:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
              <li>• <strong>지역단</strong>: 지역단 이름</li>
              <li>• <strong>사번</strong>: 직원 사번</li>
              <li>• <strong>이름</strong>: 직원 이름</li>
              <li>• <strong>성적</strong>: 점수 (숫자)</li>
              <li>• <strong>차월</strong>: 재직 개월 수 (숫자)</li>
            </ul>
          </div>

          {/* 파일 업로드 영역 */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              file ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
            }`}
          >
            {!file ? (
              <div>
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 font-medium mb-2">
                  엑셀 파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  지원 형식: .xlsx, .xls, .csv
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 cursor-pointer transition-all shadow-md"
                >
                  파일 선택
                </label>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FileSpreadsheet className="w-12 h-12 text-orange-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="ml-4 p-2 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 업로드 버튼 */}
          {file && uploadStatus === 'idle' && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  업로드 시작
                </>
              )}
            </button>
          )}

          {/* 성공 메시지 */}
          {uploadStatus === 'success' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="font-semibold text-green-900">
                  업로드 성공! ({previewData.length}개 이상의 데이터가 업로드되었습니다)
                </p>
              </div>
              {previewData.length > 0 && (
                <div className="bg-white rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">데이터 미리보기:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    {previewData.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="font-medium">{item.이름}</span>
                        <span className="text-gray-500">|</span>
                        <span>{item.지역단}</span>
                        <span className="text-gray-500">|</span>
                        <span>{item.성적.toLocaleString()}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 오류 메시지 */}
          {uploadStatus === 'error' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">업로드 실패</p>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;




