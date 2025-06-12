import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.className} dark`} suppressHydrationWarning>
      <body className="bg-background text-white">
        <div className="noise" />
        <main className="min-h-screen flex flex-col ">
          <div className="flex-1 w-full flex flex-col ">
            {/* <nav className="w-full flex justify-center border-b border-white/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"}>Nuclear</Link>
                </div>
                {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
              </div>
            </nav> */}
            <div className="flex flex-col w-full p-5 ">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

// import DeployButton from "@/components/deploy-button";
// import { EnvVarWarning } from "@/components/env-var-warning";
// import HeaderAuth from "@/components/header-auth";
// import { hasEnvVars } from "@/utils/supabase/check-env-vars";
// import { Geist } from "next/font/google";
// import Link from "next/link";
// import "./globals.css";

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000";

// export const metadata = {
//   metadataBase: new URL(defaultUrl),
//   title: "Next.js and Supabase Starter Kit",
//   description: "The fastest way to build apps with Next.js and Supabase",
// };

// const geistSans = Geist({
//   display: "swap",
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={`${geistSans.className} dark`} suppressHydrationWarning>
//       <body className="bg-background text-white">
//         <div className="noise" />
//         <main className="min-h-screen flex flex-col items-center justify-center">
//           <div className="w-full flex flex-col items-center justify-center">
//             {/* <nav className="w-full flex justify-center border-b border-white/10 h-16">
//               <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
//                 <div className="flex gap-5 items-center font-semibold">
//                   <Link href={"/"}>Nuclear</Link>
//                 </div>
//                 {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
//               </div>
//             </nav> */}
//             <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto p-5">
//               {children}
//             </div>
//           </div>
//         </main>
//       </body>
//     </html>
//   );
// }
