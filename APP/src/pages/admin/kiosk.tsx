import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../utils/api";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import { useEffect, useState } from "react";


type KioskIdAssignment = {
    state: boolean;
    kiosk_id: string;
    error: string;
}

type KioskIdValid = {
    state: boolean;
    kiosk_data: string;
    error: string;
}

const Kiosk: NextPage = () => {
    const [assigned, setAssigned] = useState<KioskIdAssignment>({state: false, kiosk_id: "", error: ""});
    const [valid, setValid]       = useState<KioskIdValid>({state: false, kiosk_data: "", error: ""});

    const checkKioskIdAssignment = () => {
        const kiosk_id = localStorage.getItem("kiosk_id");

        if (kiosk_id) {
            return {state: true, kiosk_id: kiosk_id, error: ""} as KioskIdAssignment;
        }else{
            return {state: false, kiosk_id: "", error: "Kiosk ID not assigned"} as KioskIdAssignment;
        }
    }

    const checkKioskIdValid = async (kioskIdAssignment : KioskIdAssignment) => {    
        if (!kioskIdAssignment.state){
            return {state: false, kiosk_data: "", error: "Cannot check if Kiosk ID is valid if not assigned"} as KioskIdValid;
        }
        else{
            return {state: true, kiosk_data: "Kiosk Data", error: ""} as KioskIdValid;
        }
    }


    useEffect(() => {
        async function checkKioskId(){
            const kioskIdAssignment = checkKioskIdAssignment();
            setAssigned(kioskIdAssignment);
            const kioskIdValid = await checkKioskIdValid(kioskIdAssignment);
            setValid(kioskIdValid);
        }
        checkKioskId();  
    }, []);

    return (
    <>
    <Head>
        <title>Admin Panel</title>
        <meta name="description" content="Jacks Beans - Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <NavBar />
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-row justify-center gap-12 px-4 py-16 ">
            <div className="flex flex-col flex-1 gap-4 rounded-xl bg-white/20 p-6 text-white">
                <div className="flex flex-row items-center gap-4">
                    {
                        assigned.state ? 
                        <div className="flex bg-green-500 aspect-square h-10 rounded-full items-center justify-center">
                            ✓
                        </div>
                        :
                        <div className="flex bg-red-500 aspect-square h-10 rounded-full items-center justify-center">
                            X
                        </div>
                    }
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Kiosk ID Assigned
                    </h1>
                </div>
                {
                    assigned.state ?
                    <p>Kiosk ID: {assigned.kiosk_id}</p>
                    :
                    <p>{assigned.error}</p>
                }
            </div>
            <div className="flex flex-col flex-1 gap-4 rounded-xl bg-white/20 p-6 text-white">
                <div className="flex flex-row items-center gap-4">
                    {
                        valid.state ? 
                        <div className="flex bg-green-500 aspect-square h-10 rounded-full items-center justify-center">
                            ✓
                        </div>
                        :
                        <div className="flex bg-red-500 aspect-square h-10 rounded-full items-center justify-center">
                            X
                        </div>
                    }
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Kiosk ID Valid
                    </h1>
                </div>
                {
                    valid.state ?
                    <p>Kiosk Data: {valid.kiosk_data}</p>
                    :
                    <p>{valid.error}</p>
                }
            </div>
            
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20">
                    <h3 className="text-2xl font-bold text-center">Kiosk Management</h3>
                </div>
        </div>
        
        <footer className="container flex justify-center flex-row-reverse m-10">   
        </footer>
    </main>
    </>
    );
};

export default Kiosk;


