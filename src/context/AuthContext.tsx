
'use client';

import type { User as FirebaseUser, IdTokenResult } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Client-side log for API key
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    console.log(
      "AuthContext (Client-side): NEXT_PUBLIC_FIREBASE_API_KEY is ",
      apiKey ? `"${apiKey.substring(0,5)}..." (present)` : "MISSING or UNDEFINED"
    );
    if (!apiKey) {
      console.error(
        "CRITICAL AuthContext (Client-side) ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is MISSING or UNDEFINED in the browser. " +
        "This means Firebase cannot be initialized correctly. " +
        "Please ensure:\n" +
        "1. Your API key is in your .env (or .env.local) file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY=yourActualKey).\n" +
        "2. You have restarted your Next.js development server after adding/changing it.\n" +
        "3. The variable name starts with NEXT_PUBLIC_."
      );
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/');
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: 'Login Failed', description: error.message || 'Could not log in.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        // Create a user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: serverTimestamp(),
        });
      }
      toast({ title: 'Signup Successful', description: 'Welcome! Your account has been created.' });
      router.push('/');
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ title: 'Signup Failed', description: error.message || 'Could not create account.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: 'Logout Failed', description: error.message || 'Could not log out.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
