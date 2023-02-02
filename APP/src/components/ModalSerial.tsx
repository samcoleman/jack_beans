import { useState } from "react";
import { useDev } from "./ProviderDev";
import { cm_serial_info } from "../utils/const";


export const ModalSerial : React.FC = () => {
    const dev = useDev();


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
            console.log("No ports found");
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



    return(
        <>
        <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-center p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    USB Connection Error 
                  </h3>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-slate-500 text-lg leading-relaxed text-center px-10">
                    Check USB connection to machine <br/>
                    Connection is retried automatically
                  </p>
                </div>
                { dev ?
                     <div className="flex flex-row-reverse items-center justify-start gap-4 p-6 border-t border-solid border-slate-200 rounded-b">
                         <button 
                             className="flex max-w-xs flex-col gap-4 rounded-xl bg-slate-600 p-4 text-white hover:bg-slate-600/50"
                             onClick={requestSerial}>
                             <h1 className="text-sm ">Authorise Serial</h1>
                         </button>
                         <button 
                             className="flex max-w-xs flex-col gap-4 rounded-xl bg-slate-600 p-4 text-white hover:bg-slate-600/50"
                             onClick={openPort}>
                             <h1 className="text-sm">Reconnect Serial</h1>
                         </button>
                     </div>
            
                 : null }
              </div>
            </div>
          </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )

}

export default ModalSerial;