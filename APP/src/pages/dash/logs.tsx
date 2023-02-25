import { type NextPage } from "next";
import Head from "next/head";

import {DashNavBar} from "../../components/NavBar";
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

const Logs: NextPage = () => {
    const [assigned, setAssigned] = useState<KioskIdAssignment>({state: false, kiosk_id: "", error: ""});
    const [valid, setValid]       = useState<KioskIdValid>({state: false, kiosk_data: {id: "", address: "", scopeId: null}, error: ""});

    const { data : session } = useSession();
    const { data : logs }  = api.serial.getLogs.useQuery(
        undefined, 
        {enabled: session?.user !== undefined}
    );


 

    return (
    <>
    <Head>
        <title>Admin Panel</title>
        <meta name="description" content="Jacks Beans - Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <DashNavBar />
    <main className="flex min-h-screen justify-center bg-[#232020]">
        <div className="container flex flex-col items-center gap-12 py-12">
            <div className="flex justify-start flex-1 min-w-full flex-col rounded-xl bg-white/20 p-6 gap-4 text-white">
                <h3 className="text-2xl font-bold text-left">Logs</h3>
                <h1 className="text-xl font-bold">All</h1>
                <table className="table-fixed text-left w-full">
                <thead>
                    <tr className="border-b-2">
                    <th>Date</th>
                    <th>fn</th>
                    <th>kiosk</th>
                    <th>tx</th>
                    <th>rx</th>
                    </tr>
                </thead>
                <tbody>
                    {logs?.map((log, index) => {
                    return (
                        <tr key={index} className="border-b-2">
                        <td>{log.createdAt.toDateString()}</td>
                        <td>{log.fn}</td>
                        <td>{log.kioskId}</td>
                        <td>{log.tx}</td>
                        <td>{log.rx}</td>
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

export default Logs;



