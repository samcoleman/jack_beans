import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../utils/api";
import Link from "next/link";
import {AdminNavBar} from "../../components/NavBar";
import { useEffect, useState } from "react";
import { json } from "stream/consumers";
import { Kiosk } from "@prisma/client";


type KioskIdAssignment = {
    state: boolean;
    kiosk_id: string;
    error: string;
}

type KioskIdValid = {
    state: boolean;
    kiosk_data: Kiosk;
    error: string;
}

/*
    const { data: sessionData } = useSession();
  
    const { data: secretMessage } = api.example.getSecretMessage.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined },
    );
*/

const Kiosk: NextPage = () => {
    const [assigned, setAssigned] = useState<KioskIdAssignment>({state: false, kiosk_id: "", error: ""});
    const [valid, setValid]       = useState<KioskIdValid>({state: false, kiosk_data: {id: "", address: ""}, error: ""});

    const { data : session } = useSession();
    const { data : kiosks }  = api.kiosk.getAll.useQuery(
        undefined, 
        {enabled: session?.user !== undefined}
    );

    
    const validate = api.kiosk.checkValid.useMutation()


    const assignKioskId = (kiosk_id: string) => {
        localStorage.setItem("kiosk_id", kiosk_id);
        checkKioskId();  
    }

    const unassignKioskId = () => {
        localStorage.removeItem("kiosk_id");
        checkKioskId();  
    }

    async function checkKioskId(){
        const checkKioskIdAssignment = () => {
            const kiosk_id = localStorage.getItem("kiosk_id");
    
            if (kiosk_id) {
                return {state: true, kiosk_id: kiosk_id, error: ""} as KioskIdAssignment;
            }else{
                return {state: false, kiosk_id: "", error: "Kiosk ID not assigned"} as KioskIdAssignment;
            }
        }
    
        const checkKioskIdValid = async (kioskIdAssignment : KioskIdAssignment) => {  
            // Check if kiosk id is assigned
            if (!kioskIdAssignment.state){
                return {state: false, kiosk_data: {id: "", address: ""}, error: "Cannot check if Kiosk ID is valid if not assigned"} as KioskIdValid;
            }
            // Check if kiosk id is valid
            else{
                const kiosk = await validate.mutateAsync({id: kioskIdAssignment.kiosk_id});
                if (kiosk){
                    return {state: true, kiosk_data: kiosk, error: ""} as KioskIdValid;
                }else{
                    return {state: false, kiosk_data: {id: kioskIdAssignment.kiosk_id, address: ""}, error: "Kiosk ID not valid"} as KioskIdValid;
                }
            }
        }
        const kioskIdAssignment = checkKioskIdAssignment();
        setAssigned(kioskIdAssignment);
        const kioskIdValid = await checkKioskIdValid(kioskIdAssignment);
        setValid(kioskIdValid);
    } 

    


    useEffect(() => {
        checkKioskId();  
    }, []);

    return (
    <>
    <Head>
        <title>Admin Panel</title>
        <meta name="description" content="Jacks Beans - Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <AdminNavBar />
    <main className="flex min-h-screen justify-center bg-[#232020]">
        <div className="container flex flex-col items-center gap-12 py-12">
            <div className="flex flex-row justify-center min-w-full gap-12">
                <div className="flex flex-col flex-1 w-full gap-4 rounded-xl bg-white/20 p-6 text-white">
                    <div className="flex flex-row items-center font-extrabold gap-4">
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
                        assigned.state ? null : <p>{assigned.error}</p>
                    }
                </div>
                <div className="flex flex-col flex-1 gap-4 rounded-xl bg-white/20 p-6 text-white">
                    <div className="flex flex-row items-center font-extrabold gap-4">
                        {
                            validate.isSuccess ?
                                valid.state ? 
                                <div className="flex bg-green-500 aspect-square h-10 rounded-full items-center justify-center">
                                    ✓
                                </div>
                                :
                                <div className="flex bg-red-500 aspect-square h-10 rounded-full items-center justify-center">
                                    X
                                </div>
                            :
                            <div className="flex bg-gray-500 aspect-square h-10 rounded-full items-center justify-center">
                                    ?
                            </div>
                        }
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Kiosk ID Valid
                        </h1>
                    </div>
                    {
                        valid.state ||validate.isLoading ? null : <p>{valid.error}</p>
                    }
                </div>
                
            </div>
            <div className="flex justify-start flex-1 min-w-full flex-col rounded-xl bg-white/20 p-6 gap-4 text-white">
                <h3 className="text-2xl font-bold text-left">Kiosk Management</h3>
                {
                    assigned.state ? 
                    <>
                    <h1 className="text-xl font-bold">Current</h1>
                    <table className="table-fixed text-left w-full">
                    <thead>
                        <tr className="border-b-2">
                        <th>ID</th>
                        <th>Address</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b-2">
                        <td>{assigned.kiosk_id}</td>
                        <td>{valid.kiosk_data.address}</td>
                        <td className="flex justify-end items-end">
                            <button 
                                className="rounded-full bg-red-500 w-32 py-1 m-1 font-semibold text-white no-underline transition hover:bg-red-400"
                                onClick={() => unassignKioskId()}
                            >
                                Unassign
                            </button>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                    </>
                    :
                    null
                }
                

                <h1 className="text-xl font-bold">All</h1>
                <table className="table-fixed text-left w-full">
                <thead>
                    <tr className="border-b-2">
                    <th>ID</th>
                    <th>Address</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {kiosks?.map((kiosk, index) => {
                    return (
                        <tr key={index} className="border-b-2">
                        <td>{kiosk.id}</td>
                        <td>{kiosk.address}</td>
                        <td className="flex justify-end items-end">
                            {
                                assigned.kiosk_id === kiosk.id ?
                                <button 
                                    className="rounded-full bg-red-500 w-32 py-1 m-1 font-semibold text-white no-underline transition hover:bg-red-400"
                                    onClick={() => unassignKioskId()}
                                >
                                    Unassign
                                </button>
                                :
                                <button 
                                    className="rounded-full bg-green-500 w-32 py-1 m-1 font-semibold text-white no-underline transition hover:bg-green-400"
                                    onClick={() => assignKioskId(kiosk.id)}
                                >
                                    Assign
                                </button>
                            }
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
            <footer className="container flex justify-center flex-row-reverse">   
            </footer>
        </div>
        
    </main>
    </>
    );
};

export default Kiosk;


