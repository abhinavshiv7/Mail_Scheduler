import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/api/auth/google', {
          token: tokenResponse.access_token
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Google Login Successful!');
        setTimeout(() => {
          navigate('/dashboard/scheduled');
        }, 500);
      } catch (error: any) {
        console.error('Google login error:', error);
        toast.error(error.response?.data?.error || 'Login failed');
      }
    },
    onError: () => {
      toast.error('Google Login Failed');
    }
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');

    try {
      const endpoint = isLogin ? '/api/auth/login-email' : '/api/auth/register-email';
      const payload = { email, password };
      
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`${isLogin ? 'Login' : 'Registration'} Successful!`);
      setTimeout(() => navigate('/dashboard/scheduled'), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || `${isLogin ? 'Login' : 'Registration'} failed`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-[440px] bg-white rounded-lg p-10 text-center border border-[#F3F4F6] shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
        
        <h1 className="text-[32px] font-bold text-[#111827] mb-8">Login</h1>
        
        <button 
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center space-x-3 bg-[#EAF5ED] text-[#374151] hover:bg-[#DDF0E2] transition-colors font-medium py-3 rounded-md mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <title>Google Logo</title>
            <clipPath id="g">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            </clipPath>
            <g class="colors" clip-path="url(#g)">
              <path fill="#FBBC05" d="M0 37V11l17 13z"/>
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
            </g>
          </svg>
          <span className="text-[15px]">Login with Google</span>
        </button>

        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
          <span className="text-[#9CA3AF] text-[13px] bg-white">or sign up through email</span>
          <div className="flex-1 h-px bg-[#F3F4F6]"></div>
        </div>

        <form className="space-y-4" onSubmit={handleEmailSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-transparent rounded-md text-[#111827] placeholder-[#9CA3AF] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#16A34A] transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-transparent rounded-md text-[#111827] placeholder-[#9CA3AF] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#16A34A] transition-all"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#00A84D] hover:bg-[#009643] text-white font-medium py-3 rounded-md transition-colors duration-200 mt-2 text-[15px]"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}
