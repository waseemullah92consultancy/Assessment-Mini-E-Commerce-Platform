'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Navbar } from './Navbar';

export function NavbarConnected() {
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <Navbar
      user={user ? { name: user.name, email: user.email } : null}
      cartItemCount={itemCount}
      onLogout={handleLogout}
    />
  );
}
