import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
  } from "react";

import { cm_serial_info } from "../utils/serial";
  
// RESOURCES:
// https://web.dev/serial/
// https://reillyeon.github.io/serial/#onconnect-attribute-0
// https://codelabs.developers.google.com/codelabs/web-serial
  
export type PortState = "CLOSED" | "CLOSING" | "OPEN" | "OPENING";
export interface SerialContextValue {
    connected:                  boolean;
    authConnect():              Promise<boolean>;
    disconnect():               void;
    command(bytes: Uint8Array): Promise<Uint8Array>;
}
export const SerialContext = createContext<SerialContextValue>({
    authConnect:    () => Promise.resolve(false),
    disconnect:     () => {},
    command:        () => Promise.resolve(new Uint8Array()),
    // Assume already connected
    connected: true,
});

export const useSerial = () => useContext(SerialContext);

interface SerialProviderProps {}
const ProviderSerial = ({ children }: { children: React.ReactNode }) => {

    const [canUseSerial, setCanUseSerial] = useState(false);
    const [connected, setConnected] = useState<boolean>(true);
    const [hasTriedAutoconnect, setHasTriedAutoconnect] = useState(false);
    const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

    const portRef   = useRef<SerialPort | null>(null);
    const portState = useRef<PortState>("CLOSED");


    const tx = async (bytes: Uint8Array) => {
        const LSB = (bytes.length - 1) % 256
        const MSB = (bytes.length - 1 - LSB) / 256

        // Add start byte and length
        const data = new Uint8Array([0xf0, LSB, MSB, ...bytes])


        const port = portRef.current
        if (port && port.writable) {
            const writer = port.writable.getWriter();  
            await writer.write(data);
            writer.releaseLock();
        }
        
    }

    const rx = async (timeout: number = 5000) => {
        function check_readbuffer_complete(readBuffer : Uint8Array) {
            // Message must be at least 3 bytes long
            if (readBuffer.length < 3){
                return false
            }
            // LSB + MSB + 3 Bytes (Start bye + length) + 1 byte for array non 0 index
            const length = (readBuffer[1]! + 256 * readBuffer[2]!) + 4
            if (readBuffer.length == length){
                return true
            }
            return false
        }

        let readBuffer = new Uint8Array()
        if (!portRef.current || !portRef.current.readable){ return readBuffer }

        const reader = portRef.current.readable.getReader();
        try {
            // Loop until we get a complete message or timeout
            const start = +new Date;
            while (!check_readbuffer_complete(readBuffer)) {
                const { value, done } = await reader.read();
                
                if (done || (+new Date - start) > timeout) {
                    console.log("RX Timout")
                    break;
                }
                // Timestamp of last byte received (simpler)
                readBuffer = new Uint8Array([...readBuffer, ...value])
            }  
            reader.releaseLock();
        } catch (error) {
            console.error(error);
        } finally {
            reader.releaseLock();
        }
        
        // Return the received data without start bit and length
        return readBuffer.slice(3, readBuffer.length)
    }

    const command = async (bytes: Uint8Array, timeout: number = 5000) => {
        // Wait until port is open or timeout
        const start = +new Date;
        while (!portRef.current || portState.current !== "OPEN") {
            if ((+new Date - start) > timeout) {
                console.log("TX Timout")
                return new Uint8Array()
            } 
        }
        
        await tx(bytes);
        const res = await rx(timeout);
        console.log(`TX:\n${bytes.toString()} \nRX:\n${res?.toString()}`);
        return res;
    }



    /**
     * Attempts to open the given port.
     */
    const openPort = async (port: SerialPort) => {
        try {
            await port.open({ baudRate: 9600, bufferSize: 4096 });
            portRef.current = port;
            portState.current = "OPEN";
            console.log(`Opened port: ${JSON.stringify(port.getInfo())}`);
            setHasManuallyDisconnected(false);
        } catch (error) {
            portState.current = "CLOSED";
            console.error("Could not open port");
        }
    };

    const authConnect = async () => {
        if (canUseSerial && portState.current === "CLOSED") {
        portState.current = "OPENING";
        const filters = [cm_serial_info];
        try {
            const port = await navigator.serial.requestPort({ filters });
            await openPort(port);
            return true;
        } catch (error) {
            portState.current = "CLOSED";
            console.error("User did not select port");
        }
        }
        return false;
    };

    const autoConnect = async () => {
        if (canUseSerial && portState.current === "CLOSED") {
        portState.current = "OPENING";
        const availablePorts = await navigator.serial.getPorts();
        if (availablePorts.length) {
            const port = availablePorts[0];

            if (port){
                await openPort(port);
                return true;
            }else{
                portState.current = "CLOSED";
            }
        } else {
            portState.current = "CLOSED";
        }
        setHasTriedAutoconnect(true);
        }
        return false;
    };

    const closePort = async () => {
        if (canUseSerial && portState.current === "OPEN") {
        const port = portRef.current;
        if (port) {
            portState.current = "CLOSING";

            // Close and nullify the port
            await port.close();
            portRef.current = null;

            // Update port state
            setHasManuallyDisconnected(true);
            setHasTriedAutoconnect(false);
            portState.current = "CLOSED";
        }
        }
    };

    /**
     * Event handler for when the port is connected & disconnected unexpectedly.
     */
    const onPortConnect = async () => {
        setHasTriedAutoconnect(false);
    }

    const onPortDisconnect = async () => {
        portRef.current = null;
        setHasTriedAutoconnect(false);
        portState.current = "CLOSED";
    };

    

    // Handles attaching the reader and disconnect listener when the port is open
    useEffect(() => {
        // Attach a listener for when the device is disconnected
        navigator.serial.addEventListener("connect", onPortConnect);
        navigator.serial.addEventListener("disconnect", onPortDisconnect);

        return () => {
            //aborted.current = true;
            navigator.serial.removeEventListener("connect", onPortConnect);
            navigator.serial.removeEventListener("disconnect", onPortDisconnect);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portState]);

    // Tries to auto-connect to a port, if possible
    useEffect(() => {
        setCanUseSerial("serial" in navigator)
        if (
        canUseSerial &&
        !hasManuallyDisconnected &&
        !hasTriedAutoconnect &&
        portState.current === "CLOSED"
        ) {
        console.log("Trying to autoconnect to port")
        autoConnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canUseSerial, hasManuallyDisconnected, hasTriedAutoconnect, portState]);

    useEffect(() => {
        async function checkPortState(lastPortState: PortState, depth: number) {
            if (portState.current === "OPEN") {
                
                setConnected(true)
                return
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            if (portState.current === "CLOSED" && lastPortState !== "CLOSED"){
                setConnected(false)
                return
            }

            if (depth > 2) {
                // Just incase but should be impossible
                setConnected(false)
                return
            }

            if (portState.current === "CLOSED"){
                checkPortState(portState.current, depth + 1)
            }
        }

        checkPortState(portState.current, 0)
    }, [portState])

    return (
        <SerialContext.Provider
        value={{
            command,
            connected,
            authConnect,
            disconnect: closePort,
        }}
        >
            {children}
        </SerialContext.Provider>
    );
};

export default ProviderSerial;