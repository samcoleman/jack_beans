import { type NextPage } from "next";
import Head from "next/head";
import { signIn } from "next-auth/react";


const Home: NextPage = () => {

    // Return to callback url if it exists
    const getCallback = () => {
        const url = new URL(window.location.href);
        const callbackUrl = url.searchParams.get("callbackUrl");

        if (callbackUrl) {
            return callbackUrl;
        }else{
            return "/admin";
        }
    }
    return (
        <>
        <Head>
            <title>Jacks Beans</title>
            <meta name="description" content="Generated by create-t3-app" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#232020]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                    Authorised Route
                </h1>
                <button 
                    className="flex flex-col items-center justify-center bg-white/20 py-4 px-8 rounded-full mt-20"
                    onClick={() => signIn("auth0", { callbackUrl: getCallback() })}
                >
                    <div
                    className="text-2xl font-semibold text-white no-underline">
                    Log in
                    </div>
                </button>
            </div>
            <div  className="flex flex-auto"/>
            <footer className="container flex justify-center flex-row-reverse m-10">   
            </footer>
        </main>

        </>
    );
};

export default Home;



