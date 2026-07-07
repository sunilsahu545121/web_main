import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function LoginPage() {
  const { signIn, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        {/* Animated Logo */}
        <div className="mb-8 flex justify-center animate-bounce">
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
              <div className="space-y-1">
                <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="space-y-1">
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <Button type="submit" loading={loading} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 text-lg mt-2">
                Sign In
              </Button>
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
