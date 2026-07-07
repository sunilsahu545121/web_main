import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // Role-based redirect after login
      setTimeout(() => {
        if (role === 'seller') navigate('/seller');
        else navigate('/admin');
      }, 200);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo without bouncing delay */}
        <div className="mb-8 flex justify-center">
          <img src="/logo.png" alt="Krixify Logo" className="h-24 object-contain drop-shadow-xl" />
        </div>
        
        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm">
          <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-center text-2xl font-extrabold text-gray-800">
              Welcome Back
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">Sign in to your Krixify account</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-5">
              
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="block w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="block w-full rounded-xl border border-gray-300 py-3 pl-11 pr-12 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-orange-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="pt-4 text-center text-sm text-gray-600">
                New seller? <a href="/onboard/seller" className="font-semibold text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-4">Register here</a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
