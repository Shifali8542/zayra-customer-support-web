import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ZayraLogo from '../../components/ui/ZayraLogo';
import { useAuth } from '../../hooks/useAuth';

const FIELD_CLS = `
  w-full px-3 py-[10px] text-[13px] font-sans
  border border-[var(--z-border)] rounded-[8px]
  bg-[var(--surface2)] text-[var(--text1)]
  placeholder-[var(--text3)] outline-none
  focus:border-[#9FE1CB] transition-colors
`;

const Login = () => {
  const { login, skipAuth, isAuthenticated, isLoading, error } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="
      min-h-screen bg-[var(--surface2)] flex items-center
      justify-center px-4 transition-colors duration-200
    ">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex justify-center mb-7"><ZayraLogo /></div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--z-border)] rounded-2xl p-8">
          <h1 className="text-[18px] font-semibold text-[var(--text1)] mb-1">Welcome back</h1>
          <p className="text-[13px] text-[var(--text2)] mb-6">Sign in to your support dashboard</p>

          {error && (
            <div className="mb-4 p-[10px_12px] bg-[#FCEBEB] border border-[rgba(226,75,74,.2)] rounded-[8px] text-[12px] text-[#E24B4A]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-[6px]">
                Email
              </label>
              <input
                type="email" placeholder="priya@zayra.health"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={FIELD_CLS} required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-[6px]">
                Password
              </label>
              <input
                type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={FIELD_CLS} required
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="
                w-full py-[10px] mt-1 bg-[#1D9E75] text-white border-none
                rounded-[8px] text-[13px] font-medium font-sans cursor-pointer
                hover:bg-[#0F6E56] transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Skip for now */}
          <button
            onClick={skipAuth}
            className="
              w-full mt-3 py-[10px] bg-transparent border-none text-[13px]
              text-[var(--text2)] font-sans cursor-pointer
              hover:text-[var(--text1)] transition-colors
            "
          >
            Skip for now →
          </button>

          <p className="text-center text-[12px] text-[var(--text3)] mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1D9E75] font-medium hover:text-[#0F6E56] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
