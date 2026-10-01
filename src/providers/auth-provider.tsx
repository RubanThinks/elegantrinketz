"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  getUserProfile,
  createUserProfile,
  syncGoogleUserProfile,
} from "@/services/users";
import type { UserProfile } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Backwards-compatibility alias
  userProfile: UserProfile | null;
  profile: UserProfile | null; // Backwards-compatibility alias
  loading: boolean;
  isLoading: boolean; // Backwards-compatibility alias
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to fetch or refresh user profile from Firestore
  const fetchAndSetProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }

    try {
      let profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        // Fallback: create default customer profile if missing
        profile = await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Valued Shopper",
          photoURL: firebaseUser.photoURL || null,
        });
      }
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error("[AuthProvider] Error loading user profile:", err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (currentUser) {
      await fetchAndSetProfile(currentUser);
    }
  }, [currentUser, fetchAndSetProfile]);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    let isMounted = true;
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        await fetchAndSetProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchAndSetProfile]);

  // Email + Password Sign-In
  const handleSignInWithEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await fetchAndSetProfile(cred.user);
    return profile;
  };

  // Email + Password Registration
  const handleSignUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

    // Update display name on Firebase Auth identity
    if (name) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }

    // Create Firestore customer document (forcing role="customer")
    const newProfile = await createUserProfile(cred.user.uid, {
      email: cred.user.email || email,
      displayName: name.trim(),
      phone: phone?.trim(),
      photoURL: cred.user.photoURL || null,
    });

    setUserProfile(newProfile);
    return newProfile;
  };

  // Google Sign-In
  const handleSignInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const cred = await signInWithPopup(auth, provider);
    const profile = await syncGoogleUserProfile(cred.user);
    setUserProfile(profile);
    return profile;
  };

  // Password Reset
  const handleSendPasswordReset = async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Logout
  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const isAuthenticated = Boolean(currentUser);
  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";
  const isSuperAdmin = userProfile?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        userProfile,
        profile: userProfile,
        loading,
        isLoading: loading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        sendPasswordReset: handleSendPasswordReset,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
