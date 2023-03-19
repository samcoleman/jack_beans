import { type NextPage } from "next";
import Head from "next/head";

import {AdminNavBar} from "../../components/NavBar";
import { useSerial } from "../../components/ProviderSerial";
import { useState } from "react";


const Serial: NextPage = () => {

    const { command } = useSerial()
    const [input, setInput ] = useState("");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
        const bytes = Uint8Array.from(Buffer.from(input, 'hex'));
        const res = await command(bytes)
    }

  return (
    <>
    <Head>
    <title>Jacks Beans</title>
    <meta name="description" content="Generated by create-t3-app" />
    <link rel="icon" href="/favicon.ico" />
    </Head>
    <AdminNavBar />
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#232020]">

            <div className="container flex justify-center gap-4">
                <input  className="flex max-w-xs gap-4 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 min-w-[50%]"  type="text" name="name" onChange={onChange}/>
                <input className="flex max-w-xs min-w-fit gap-4 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"  type="submit" value="Send" onClick={(e) => void onSubmit(e)}/>
            </div>

        <footer className="container flex justify-center flex-row-reverse">   
        </footer>
    </main>
    </>
  );
};





export default Serial;

