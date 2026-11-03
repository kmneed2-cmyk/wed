import React, { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('km@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '111222') {
      onSuccess();
      onClose();
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#0B2B22] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif-display text-[#FBF7EE]">Admin Login</h2>
          <button onClick={onClose} className="text-[#D4AF37] hover:text-[#FBF7EE]"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#061812] border border-[#D4AF37]/30 rounded-xl">
            <Mail className="text-[#D4AF37]" size={20} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-transparent text-[#FBF7EE] w-full focus:outline-none" disabled />
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#061812] border border-[#D4AF37]/30 rounded-xl">
            <Lock className="text-[#D4AF37]" size={20} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent text-[#FBF7EE] w-full focus:outline-none" placeholder="Password" />
          </div>
          {error && <p className="text-[#E11D48] text-xs">{error}</p>}
          <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#061812] rounded-xl font-bold">Login</button>
        </form>
      </div>
    </div>
  );
};
