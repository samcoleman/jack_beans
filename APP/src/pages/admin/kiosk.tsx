import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../utils/api";
import Link from "next/link";
import NavBar from "../../components/NavBar";





const Kiosk: NextPage = () => {
    //const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
    <Head>
    <title>Jacks Beans</title>
    <meta name="description" content="Jacks Beans" />
    <link rel="icon" href="/favicon.ico" />
    
    </Head>
    <NavBar />
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Kiosk Panel
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20">
                <h3 className="text-2xl font-bold text-center">Kiosk Management</h3>
            </div>
        </div>
        </div>
        <div  className="flex flex-auto"/>
        <footer className="container flex justify-center flex-row-reverse m-10">   
        </footer>
    </main>
    </>
  );
};

export default Kiosk;


