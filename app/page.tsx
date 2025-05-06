import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  const user = true;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div>
          {user ? (
            <LogoutButton></LogoutButton>
          ) : (
            <button>sign in kar lo frens</button>
          )}
        </div>
      </main>
     
    </div>
  );
}
