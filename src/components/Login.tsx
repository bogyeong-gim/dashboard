import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';

interface LoginProps {
  onLogin: (employeeId: string) => void;
  onAdminClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onAdminClick }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 입력 가능하도록 제한
    if (value === '' || /^\d+$/.test(value)) {
      setEmployeeId(value);
      setError(''); // 입력 시 에러 메시지 초기화
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = employeeId.trim();
    
    if (!trimmedId) {
      setError('사번 7자리를 모두 입력하세요.');
      return;
    }
    
    if (trimmedId.length !== 7) {
      setError('사번 7자리를 모두 입력하세요.');
      return;
    }
    
    setError('');
    onLogin(trimmedId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              리더보드
            </h1>
            <p className="text-gray-600">사번을 입력해주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                사번
              </label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={handleChange}
                placeholder="사번 7자리를 입력하세요"
                maxLength={7}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-800 placeholder-gray-400 ${
                  error 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-orange-400'
                }`}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              로그인
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onAdminClick}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              관리자 페이지
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>문제가 있으신가요? 관리자에게 문의하세요.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;




