import Image from "next/image";
import Link from "next/link";
import { WalletButton } from "@/features/wallet";
import { NavMenu } from "./NavMenu";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/Assets/Images/Logo-Brands/zStellar-logo.png"
          alt="zStellar"
          width={32}
          height={32}
          priority
          className="h-8 w-8 rounded-lg object-contain"
        />
        <span className="text-xl font-semibold tracking-tight text-fg">
          zStellar
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <WalletButton />
        <NavMenu />
      </div>
    </header>
  );
}
