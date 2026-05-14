import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ZayraLogo from '../../components/ui/ZayraLogo';
import { useAuth } from '../../hooks/useAuth';

const FIELD_CLS = `
  w-full px-3 py-[10px] text-[13px] font-sans
  border border-[var(--z-border)] rounded-[8px]
  bg-[var(--surface2)] text-[var(--text1)]
  placeholder-[var(--text3)] outline-none
  focus:border-[#9FE1CB] transition-colors
`;

const FIELDS = [
  { name: 'name',            label: 'Full name',        type: 'text',     placeholder: 'Priya Sharma'         },
  { name: 'email',           label: 'Email',            type: 'email',    placeholder: 'priya@zayra.health'   },
  { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••'             },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••'             },
] as const;

type FormState = Record<typeof FIELDS[number]['name'], string>;

const Signup = () => {
  const { signup, skipAuth, isLoading, error } = useAuth();
  const [form, setForm] = useState<FormState>({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signup(form);
  };

  return (
    <div className="
      min-h-screen bg-[var(--surface2)] flex items-center
      justify-center px-4 transition-colors duration-200
    ">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-7"><ZayraLogo /></div>

        <div className="bg-[var(--surface)] border border-[var(--z-border)] rounded-2xl p-8">
          <h1 className="text-[18px] font-semibold text-[var(--text1)] mb-1">Create account</h1>
          <p className="text-[13px] text-[var(--text2)] mb-6">Join the Zayra support team</p>

          {error && (
            <div className="mb-4 p-[10px_12px] bg-[#FCEBEB] border border-[rgba(226,75,74,.2)] rounded-[8px] text-[12px] text-[#E24B4A]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {FIELDS.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-[6px]">
                  {label}
                </label>
                <input
                  type={type} placeholder={placeholder}
                  value={form[name]} onChange={set(name)}
                  className={FIELD_CLS} required
                />
              </div>
            ))}

            <button
              type="submit" disabled={isLoading}
              className="
                w-full py-[10px] mt-1 bg-[#1D9E75] text-white border-none
                rounded-[8px] text-[13px] font-medium font-sans cursor-pointer
                hover:bg-[#0F6E56] transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

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
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9E75] font-medium hover:text-[#0F6E56] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
