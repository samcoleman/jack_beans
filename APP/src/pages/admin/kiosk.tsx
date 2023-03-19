import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { api } from "../../utils/api";
import {AdminNavBar} from "../../components/NavBar";

import { useAppDispatch, useAppState } from "../../components/ProviderAppState";


const Kiosk: NextPage = () => {
    const { kiosk } = useAppState();
    const dispatch = useAppDispatch();

    const { data : session } = useSession();
    const { data : kiosks }  = api.kiosk.getAll.useQuery(
        undefined, 
        {enabled: session?.user !== undefined}
    );


    const assignKioskId = (kiosk_id: string) => {
        localStorage.setItem("kiosk_id", kiosk_id);
        dispatch({kiosk: {id: kiosk_id, valid: "UNKNOWN", obj: undefined}})
    }

    const unassignKioskId = () => {
        localStorage.removeItem("kiosk_id"); 
        dispatch({kiosk: {id: null, valid: "UNKNOWN", obj: undefined}})
    }

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
                    <div className="flex flex-row items-center gap-4">
                        {
                            kiosk.id ? 
                            <div className="flex font-extrabold bg-green-500 aspect-square h-10 rounded-full items-center justify-center">
                                ✓
                            </div>
                            :
                            <div className="flex font-extrabold bg-red-500 aspect-square h-10 rounded-full items-center justify-center">
                                X
                            </div>
                        }
                        <h1 className="text-2xl font-extrabold tracking-wide">
                            Kiosk ID Assigned
                        </h1>
                        <div className="flex-1"/>
                        <p className="text-ml  tracking-tight">
                            {kiosk.id ? kiosk.id : null}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-4 rounded-xl bg-white/20 p-6 text-white">
                    <div className="flex flex-row items-center font-extrabold gap-4">
                        {
                            kiosk.valid !== "UNKNOWN" ?
                                kiosk.valid ? 
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
                </div>
                
            </div>
            <div className="flex justify-start flex-1 min-w-full flex-col rounded-xl bg-white/20 p-6 gap-4 text-white">
                <h3 className="text-2xl font-bold text-left">Kiosk Management</h3>
                {
                    kiosk.obj ? 
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
                        <td>{kiosk.obj.id}</td>
                        <td>{kiosk.obj.address}</td>
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
                    {kiosks?.map((k, index) => {
                    return (
                        <tr key={index} className="border-b-2">
                        <td>{k.id}</td>
                        <td>{k.address}</td>
                        <td className="flex justify-end items-end">
                            {
                                k.id === kiosk.id ?
                                <button 
                                    className="rounded-full bg-red-500 w-32 py-1 m-1 font-semibold text-white no-underline transition hover:bg-red-400"
                                    onClick={() => unassignKioskId()}
                                >
                                    Unassign
                                </button>
                                :
                                <button 
                                    className="rounded-full bg-green-500 w-32 py-1 m-1 font-semibold text-white no-underline transition hover:bg-green-400"
                                    onClick={() => assignKioskId(k.id)}
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


