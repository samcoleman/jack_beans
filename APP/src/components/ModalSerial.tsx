import { useState } from "react";
import { useDev } from "./ProviderDev";
import { cm_serial_info } from "../utils/serial";
import { useSerial } from "./ProviderSerial";


export const ModalSerial : React.FC = () => {
    const dev = useDev();

    const { canUseSerial, retry, authConnect: connect } = useSerial();
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
                    {canUseSerial ? 
                        <p className="my-4 text-slate-500 text-lg leading-relaxed text-center px-10">
                            Check USB connection to machine <br/>
                            Connection is retried automatically
                        </p>
                      :
                        <p className="my-4 text-slate-500 text-lg leading-relaxed text-center px-10">
                            Browser does not support serial connections
                        </p>
                    }
                </div>
                { dev ?
                     <div className="flex flex-row-reverse items-center justify-start gap-4 p-6 border-t border-solid border-slate-200 rounded-b">
                         <button 
                             className="flex max-w-xs flex-col gap-4 rounded-xl bg-slate-600 p-4 text-white hover:bg-slate-600/50"
                             onClick={connect}>
                             <h1 className="text-sm ">Auth Connection</h1>
                         </button>
                         <button 
                             className="flex max-w-xs flex-col gap-4 rounded-xl bg-slate-600 p-4 text-white hover:bg-slate-600/50"
                             onClick={retry}>
                             <h1 className="text-sm ">Retry Connection</h1>
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