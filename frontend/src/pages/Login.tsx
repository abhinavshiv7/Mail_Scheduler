import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await api.post('/api/auth/google', {
        token: credentialResponse.credential
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
  };

  const handleGoogleError = () => {
    toast.error('Google Login Failed');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    if (!isLogin && !name) return toast.error('Please enter your name');

    try {
      const endpoint = isLogin ? '/api/auth/login-email' : '/api/auth/register-email';
      const payload = isLogin ? { email, password } : { email, password, name };
      
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
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-md bg-white rounded-[16px] shadow-sm p-8 text-center border border-[#E5E7EB]">
        <h1 className="text-3xl font-bold text-[#111827] mb-8">{isLogin ? 'Login' : 'Create an Account'}</h1>
        
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="rectangular"
            theme="outline"
            text={isLogin ? 'signin_with' : 'signup_with'}
            size="large"
          />
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex-1 border-t border-[#E5E7EB]"></div>
          <span className="text-[#6B7280] text-sm font-medium px-2 bg-white">or {isLogin ? 'login' : 'sign up'} through email</span>
          <div className="flex-1 border-t border-[#E5E7EB]"></div>
        </div>

        <form className="space-y-4" onSubmit={handleEmailSubmit}>
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-transparent rounded-[12px] text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
              />
            </div>
          )}
          <div>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-transparent rounded-[12px] text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-transparent rounded-[12px] text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#16A34A] hover:bg-green-700 text-white font-medium py-3 px-4 rounded-[12px] transition-colors duration-200 mt-4 shadow-sm"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#6B7280]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="text-[#16A34A] hover:underline font-semibold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
