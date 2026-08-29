import Link from 'next/link';
import { Home, FileText, WalletCards, User } from 'lucide-react';

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 flex justify-around border-t border-[#d8e5e0] bg-white py-2 shadow-t-lg md:hidden">
      <Link href="/dashboard" className="flex flex-col items-center text-xs text-[#152321] hover:text-[#167c74]">
        <Home size={20} />
        <span>Home</span>
      </Link>
      <Link href="/services" className="flex flex-col items-center text-xs text-[#152321] hover:text-[#167c74]">
        <FileText size={20} />
        <span>Services</span>
      </Link>
      <Link href="/wallet" className="flex flex-col items-center text-xs text-[#152321] hover:text-[#167c74]">
        <WalletCards size={20} />
        <span>Wallet</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center text-xs text-[#152321] hover:text-[#167c74]">
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
