import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '../firebase-config';

export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const signOutUser = () => signOut(auth);

  return { user, signOutUser };
}
