import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { cm_serial_info } from "../utils/const";
import { useContext, useEffect, useState } from "react";
import ModalSerial from "../components/ModalSerial";


const Home: NextPage = () => {
  //const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const [port, setPort] = useState<SerialPort>();


  useEffect(() => {
    if ("serial" in navigator){
        console.log("Serial port is supported in this browser.")



        void checkConnection();
        navigator.serial.addEventListener("connect", (event) => {
            // TODO: Automatically open event.target or warn user a port is available.
            console.log("Navigator serial connect event")
        });
        navigator.serial.addEventListener("disconnect", (event) => {
            // TODO: Automatically open event.target or warn user a port is available.
            console.log("Navigator serial disconnect event")
        });
    }else{
        console.log("The serial port is not supported in this browser.")
    }

    // eslint-disable-next-line 
  }, []);

  const deviceConnected = (data : any) => {
    console.log("Device connected")
  }

  const deviceDisconnected = (data : any) => {
    console.log("Device disconnected")
    setPort(undefined);
  }

  const requestSerial = async () => {
    try {
        const portRequest = await navigator.serial.requestPort({
            filters: [cm_serial_info]
        });
        portRequest.addEventListener("disconnect", deviceDisconnected);
        setPort(portRequest);
    }catch(error) {
        console.log(error);
    }
  };

  const openPort = async () => {
    try {
      const ports = await navigator.serial.getPorts();
      console.log(ports)
      if (ports.length > 0) {
        await ports[0]?.open({ baudRate: 9600 });
        ports[0]?.addEventListener("connect", deviceConnected);
        ports[0]?.addEventListener("disconnect", deviceDisconnected);
        setPort(ports[0])
      }else{
        console.log("No ports found")
      }
    } catch (error) {
      setPort(undefined);
      console.error("Could not open port");
    }
  };

  const checkConnection = async () => {
    console.log("Checking connection...")

    const ports = await navigator.serial.getPorts();

    ports.forEach( (port) => {
        port.addEventListener("connect", deviceConnected);
        /*
        const info = port.getInfo();
        if (info.usbProductId == cm_serial_info.usbProductId && info.usbVendorId == cm_serial_info.usbVendorId){
            console.log("Connection found")
            setPort(port)
            found = true;
        }
        */
    });
  }

  



  return (
    <>
      <Head>
        <title>Jacks Beans</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        
      
        <ModalSerial/>

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Jacks Beans
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-white"
            >
                {
                    port ?
                        <h3 className="text-2xl font-bold text-center"> Coffee Machine Connected</h3> 
                    :
                        <>
                        <h3 className="text-2xl font-bold text-center">Coffee Machine Connection Failed</h3>
                        <div className="text-lg text-center">
                                Check USB connection to machine, connection is retried automatically.
                        </div>    
                        </>
                }
            </div>
            {/*
            <div
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white"
            >
              <h3 className="text-2xl text-center font-bold">Authorisation Failed </h3>
              <h3 className="text-2xl text-center font-bold"/> 
              <div className="text-lg text-center">
                Unable to log into the app. Please sign in.
              </div>
              <AuthShowcase />
            </div>
            */}
          </div>
          {/*
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            
          </div>
          */}
        </div>
        <div  className="flex flex-auto"/>
        <footer className="container flex justify-start flex-row-reverse gap-4 p-4">    
        </footer>
      </main>

    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
