import { useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut, UserCheck } from 'lucide-react';

export default function AuthBadge() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Login Failed', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout Failed', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3.5 py-1 border border-white/5 bg-white/[0.02] rounded-full text-[9px] uppercase font-mono text-zinc-500 animate-pulse">
        Initializing Auth...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 rounded-full">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-3.5 h-3.5 rounded-full border border-emerald-500/30"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCheck size={10} className="text-emerald-400" />
          )}
          <span className="text-[9px] font-mono tracking-widest text-emerald-300 font-bold">
            {user.displayName?.split(' ')[0].toUpperCase() || 'CONNECTED'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          title="Disconnect Web Identity"
          className="flex items-center gap-1 px-2.5 py-1 border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-950/10 rounded-full text-[9px] uppercase tracking-wider text-zinc-400 hover:text-rose-400 transition-all cursor-pointer font-mono duration-150"
        >
          <LogOut size={10} />
          <span>Exit</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-1.5 px-3 py-1 border border-[#3b82f6]/30 bg-[#3b82f6]/10 rounded-full text-[9px] uppercase tracking-widest text-blue-400 hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer font-bold duration-150"
    >
      <LogIn size={10} />
      <span>Google Auth</span>
    </button>
  );
}
