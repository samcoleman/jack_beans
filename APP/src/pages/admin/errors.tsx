import { type NextPage } from "next";
import Head from "next/head";

import {AdminNavBar} from "../../components/NavBar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { get_errors, mach_error } from "../../utils/serial";
import { useSerial } from "../../components/ProviderSerial";


const Errors: NextPage = () => {

    const { data : session } = useSession();

    const [errors, setErrors] = useState<mach_error[]>([]);

    const { portState, command } = useSerial();

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
                        <button 
                            className="text-2xl font-extrabold tracking-tight hover:text-white/70"
                            onClick={async () => {setErrors(await get_errors(command, 14))}}
                        >
                            Read Errors
                        </button>
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-4 rounded-xl bg-white/20 p-6 text-white">
                    <div className="flex flex-row items-center font-extrabold gap-4">
                    
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Kiosk ID Valid
                        </h1>
                    </div>
            
                </div>
                
            </div>
            <div className="flex justify-start flex-1 min-w-full flex-col rounded-xl bg-white/20 p-6 gap-4 text-white">
                <h3 className="text-2xl font-bold text-left">Errors</h3>

                <table className="table-auto text-left w-full">
                <thead>
                    <tr className="border-b-2">
                    <th>Number</th>
                    <th>Datetime</th>
                    <th>Fault</th>
                    <th>Desc</th>
                    <th>Count</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {errors?.map((error, index) => {
                    return (
                        <tr key={index} className="border-b-2">
                        <td>{error.number}</td>
                        <td>{error.datetime.getDate()}</td>
                        <td>{error.fault}</td>
                        <td>{error.desc}</td>
                        <td>{error.count}</td>
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




export default Errors;

