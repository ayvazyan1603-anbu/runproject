import { buildSteamLoginUrl } from "@/lib/steam-api";

function SteamIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.064 0 .127.003.19.008l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524 4.528 4.528 0 0 1 4.524 4.524 4.528 4.528 0 0 1-4.524 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396a3.404 3.404 0 0 1-3.362-2.898L.309 15.245C1.468 20.21 5.894 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61a2.54 2.54 0 0 0 4.867-.96 2.542 2.542 0 0 0-2.538-2.54 2.49 2.49 0 0 0-1.14.274l1.523.63a1.868 1.868 0 0 1-.712 3.593 1.864 1.864 0 0 1-.527-.078zm8.4-5.783a3.02 3.02 0 0 0 3.015-3.015 3.02 3.02 0 0 0-3.015-3.015 3.02 3.02 0 0 0-3.015 3.015 3.02 3.02 0 0 0 3.015 3.015zm-.004-5.276a2.264 2.264 0 1 1 0 4.528 2.264 2.264 0 0 1 0-4.528z" />
    </svg>
  );
}

export default function SteamLoginButton() {
  const handleLogin = () => {
    window.location.href = buildSteamLoginUrl();
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex items-center gap-2.5 rounded-lg border border-[#171a21]/60 bg-gradient-to-r from-[#171a21] to-[#1b2838] px-5 py-2.5 text-sm font-semibold text-[#c7d5e0] transition-all duration-300 hover:scale-105 hover:from-[#1b2838] hover:to-[#2a475e] hover:text-white hover:shadow-[0_0_20px_rgba(102,192,244,0.3)]"
    >
      <SteamIcon className="h-5 w-5" />
      Войти через Steam
    </button>
  );
}
