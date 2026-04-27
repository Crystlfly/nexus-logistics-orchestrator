import {useState} from 'react';
import { Globe, LineChart, ShieldCheck, ArrowRight, Eye, Lock } from 'lucide-react';
import { Chrome } from 'lucide-react';
import ForgotPassword from './forgotPassword.jsx';
import { useGoogleLogin } from '@react-oauth/google';


const LoginSplit = ({ onLogin, onSignupClick }) => {
  const showSignupLink = false;
  const [eyeToggele, setEyeToggle]= useState(false);
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleSubmit=async(e) => {
    e.preventDefault();
    try{
      const res=await fetch("http://localhost:3000/api/login",{
        method:"POST",
        headers:{'Content-Type': 'application/json'},
        credentials: 'include',
        body:JSON.stringify({
          email:formData.email,
          password:formData.password
        })
      });
      const data=await res.json();
        if(data.success){
          onLogin(data.userRole, data.expiresAt);
        }else{
          alert("Login failed: "+data.message);
        }
    }catch(err){
      console.error("Login Error:",err);
    }
  }
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("http://localhost:3000/api/google", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: tokenResponse.access_token })
        });
        const data = await res.json();
        if (data.success) {
          onLogin(data.userRole, data.expiresAt);
          window.location.reload(); // Quick way to refresh auth state
        }
      } catch (err) {
        console.error("Google Signup Error:", err);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  if(view==="forgotPassword"){
    return <ForgotPassword />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Left Panel: Value Proposition */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-24 z-10">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Trusted by 500+ enterprises</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">
            Command Your <br/> <span className="text-emerald-500">Supply Chain</span>
          </h1>
          <p className="text-zinc-400 mt-6 max-w-md text-lg leading-relaxed font-medium">
            Enterprise-grade logistics platform delivering real-time visibility, intelligent automation, and operational excellence.
          </p>
        </div>

        <div className="space-y-10">
          <FeatureItem icon={<Globe className="text-emerald-500" size={20}/>} title="Global Tracking" desc="Monitor shipments across 180+ countries" />
          <FeatureItem icon={<LineChart className="text-emerald-500" size={20}/>} title="Predictive Analytics" desc="AI-powered insights for optimization" />
          <FeatureItem icon={<ShieldCheck className="text-emerald-500" size={20}/>} title="Enterprise Security" desc="SOC 2 compliant infrastructure" />
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 z-10">
        <div className="w-full max-w-md bg-[#0F1219]/50 backdrop-blur-xl border border-zinc-800/50 p-10 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome back</h2>
          <p className="text-zinc-500 text-sm mb-10 font-medium">Sign in to access your command center</p>

            {showSignupLink &&
              <>
                <button 
                onClick={()=>googleLogin()}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold py-3.5 px-4 rounded-xl transition-all mb-6 active:scale-[0.98]"
                >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.48 10.92v3.28h4.74c-.2 1.06-.9 1.95-1.82 2.56l2.72 2.12c1.6-1.48 2.52-3.66 2.52-6.22 0-.44-.04-.88-.12-1.3l-8.04.56zM6.5 12c0-.62.11-1.22.32-1.78L4.05 7.82C3.39 9.08 3 10.5 3 12c0 1.5.39 2.92 1.05 4.18l2.77-2.4c-.21-.56-.32-1.16-.32-1.78zM12 7.3c1.33 0 2.53.46 3.47 1.37l2.6-2.6C16.5 4.53 14.4 3.5 12 3.5c-3.1 0-5.77 1.77-7.05 4.38l2.77 2.4c.67-1.89 2.47-3.28 4.28-3.28zM12 16.7c-1.81 0-3.61-1.39-4.28-3.28l-2.77 2.4C6.23 18.43 8.9 20.2 12 20.2c2.4 0 4.41-.8 6.04-2.18l-2.72-2.12c-.81.54-1.83.8-3.32.8z"/>
                </svg>
                Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[1px] flex-1 bg-zinc-800"></div>
                  <span className="text-[10px] text-zinc-600 font-black uppercase">OR</span>
                  <div className="h-[1px] flex-1 bg-zinc-800"></div>
                </div>
              </>
            }

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
              <input type="email" 
              placeholder="ops.manager@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#0B0E14] border border-zinc-800 
              rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none 
              focus:border-emerald-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
                <button 
                onClick={()=>{ setView('forgotPassword'); }}
                type="button" className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                  Forgot password?</button>
              </div>
              <div className="relative">
                <input type={eyeToggele?"text":"password"} autoComplete="current-password" placeholder="Enter your password" 
                value={formData.password}
                onChange={(e)=> setFormData({...formData, password:e.target.value})}
                className="w-full bg-[#0B0E14] border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all" />
                <Eye 
                onClick={()=>setEyeToggle(!eyeToggele)}
                size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500/20" />
              <label className="text-xs text-zinc-500 font-bold">Remember me</label>
            </div>

            <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Sign in to Dashboard <ArrowRight size={18} />
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex gap-4">
            <div className="text-emerald-500 shrink-0"><Lock size={20} /></div>
            <div>
              <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Demo Credentials</h4>
              <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                Email: <span className="text-zinc-300">demo@nexus.com</span><br/>
                Pass: <span className="text-zinc-300">nexus2026</span>
              </p>
            </div>
          </div>

          {showSignupLink && (
              <p className="text-center mt-10 text-xs text-zinc-500 font-medium">
                New to Nexus? 
                <button
                  onClick={onSignupClick}
                  className="text-emerald-500 font-black hover:underline ml-1"
                >
                  Create an account
                </button>
              </p>
          )}
        </div>
        
        <p className="mt-12 text-[10px] text-zinc-700 uppercase font-black tracking-[0.3em]">
          © 2026 Nexus Logistics • Enterprise Command Center
        </p>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex gap-5 group cursor-default">
    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-black text-sm uppercase tracking-wider">{title}</h4>
      <p className="text-zinc-500 text-xs mt-1 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default LoginSplit;