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
  
export type PortState = "closed" | "closing" | "open" | "opening";

export type SerialMessage = {
    value: Uint8Array;
    done: boolean;
    timestamp: number;
};

type SerialMessageCallback = (message: SerialMessage) => void;
export interface SerialContextValue {
    canUseSerial: boolean;
    hasTriedAutoconnect: boolean;
    portState: PortState;
    authConnect(): Promise<boolean>;
    disconnect(): void;
    command(bytes: Uint8Array): Promise<Uint8Array>;
}
export const SerialContext = createContext<SerialContextValue>({
    canUseSerial: false,
    hasTriedAutoconnect: false,
    authConnect: () => Promise.resolve(false),
    disconnect: () => {},
    command: () => Promise.resolve(new Uint8Array()),
    portState: "closed",
});

export const useSerial = () => useContext(SerialContext);

interface SerialProviderProps {}
const ProviderSerial = ({ children }: { children: React.ReactNode }) => {

    const readBuffer = useRef<Uint8Array>(new Uint8Array());

    const [canUseSerial, setCanUseSerial] = useState(false);
    const [portState, setPortState] = useState<PortState>("closed");
    const [hasTriedAutoconnect, setHasTriedAutoconnect] = useState(false);
    const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

    const portRef      = useRef<SerialPort | null>(null);
    const readerRef    = useRef<ReadableStreamDefaultReader | null>(null);
    const readerClosed = useRef<Promise<void>>(Promise.resolve());

    const tx = async (bytes: Uint8Array) => {
        const LSB = (bytes.length - 1) % 256
        const MSB = (bytes.length - 1 - LSB) / 256

        // Add start byte and length
        const data = new Uint8Array([0xf0, LSB, MSB, ...bytes])

        console.log(`TX: ${data.toString()}`);
        const port = portRef.current
        if (port && port.writable) {
            const writer = port.writable.getWriter();  
            await writer.write(data);
            writer.releaseLock();
        }
        
    }

    const rx = async (timeout: number = 5000) => {
        function check_readbuffer_complete() {
            // Message must be at least 3 bytes long
            if (readBuffer.current.length < 3){
                return false
            }
            // LSB + MSB + 3 Bytes (Start bye + length) + 1 byte for array non 0 index
            const length = (readBuffer.current[1]! + 256 * readBuffer.current[2]!) + 4
            if (readBuffer.current.length == length){
                return true
            }
            return false
        }

        // Wait until all packets have been received or timeout
        const retry = 100 //ms
        let   count = 0
        while(!check_readbuffer_complete()){
            await new Promise(resolve => setTimeout(resolve, retry));

            count++;
            if (count === timeout/retry) {
                console.log("RX Timeout")
                return new Uint8Array()
            }
        }

        // Return the received data without start bit and length
        return readBuffer.current.slice(3, readBuffer.current.length)
    }

    const command = async (bytes: Uint8Array) => {

        // Wait until port is open or timeout
        const retry   = 100 //ms
        const timeout = 5000 //ms
        let   count   = 0
        while (!portRef.current || portState !== "open") {
            await new Promise(resolve => setTimeout(resolve, retry));

            count++
            if (count === timeout/retry) {
                console.log("TX Timeout")
                return new Uint8Array()
            }   
        }
        
        //Clear Read Line - annoying you cant clear original
        readBuffer.current = new Uint8Array()
        tx(bytes);
        const res = await rx();
        console.log(`TX:\n${bytes.toString()} \nRX:\n${res?.toString()}`);
        return res;
    }

    /**
     * Reads from the given port until it's been closed.
     *
     * @param port the port to read from
     */
    const readUntilClosed = async (port: SerialPort) => {
        if (port.readable) {
        readerRef.current = port.readable.getReader();

        try {
            while (true) {
            const { value, done } = await readerRef.current.read();
            
            if (done) {
                break;
            }

            // Timestamp of last byte received (simpler)
            readBuffer.current = new Uint8Array([...readBuffer.current, ...value])
           
        }  
        } catch (error) {
            console.error(error);
        } finally {
            readerRef.current.releaseLock();
        }
        }
    };

    /**
     * Attempts to open the given port.
     */
    const openPort = async (port: SerialPort) => {
        try {
            await port.open({ baudRate: 9600, bufferSize: 4096 });
            portRef.current = port;

            console.log(`Opened port: ${port.getInfo().toString()}`);
            setPortState("open");
            setHasManuallyDisconnected(false);
        } catch (error) {
            setPortState("closed");
            console.error("Could not open port");
        }
    };

    const authConnect = async () => {
        if (canUseSerial && portState === "closed") {
        setPortState("opening");
        const filters = [cm_serial_info];
        try {
            const port = await navigator.serial.requestPort({ filters });
            await openPort(port);
            return true;
        } catch (error) {
            setPortState("closed");
            console.error("User did not select port");
        }
        }
        return false;
    };

    const autoConnect = async () => {
        if (canUseSerial && portState === "closed") {
        setPortState("opening");
        const availablePorts = await navigator.serial.getPorts();
        if (availablePorts.length) {
            const port = availablePorts[0];

            if (port){
                await openPort(port);
                return true;
            }else{
                setPortState("closed");
            }
        } else {
            setPortState("closed");
        }
        setHasTriedAutoconnect(true);
        }
        return false;
    };

    const closePort = async () => {
        if (canUseSerial && portState === "open") {
        const port = portRef.current;
        if (port) {
            setPortState("closing");

            // Cancel any reading from port
            readerRef.current?.cancel();
            await readerClosed.current;
            readerRef.current = null;

            // Close and nullify the port
            await port.close();
            portRef.current = null;

            // Update port state
            setHasManuallyDisconnected(true);
            setHasTriedAutoconnect(false);
            setPortState("closed");
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
        // Wait for the reader to finish it's current loop
        await readerClosed.current;
        // Update state
        readerRef.current = null;
        readerClosed.current = Promise.resolve();
        portRef.current = null;
        setHasTriedAutoconnect(false);
        setPortState("closed");
    };

    

    // Handles attaching the reader and disconnect listener when the port is open
    useEffect(() => {
        const port = portRef.current;
        
        if (portState === "open" && port) {
            // When the port is open, read until closed
            
            const aborted = { current: false };
            readerRef.current?.cancel();
            readerClosed.current.then(() => {
                if (!aborted.current) {
                readerRef.current = null;
                readerClosed.current = readUntilClosed(port);
                }
            });
        }
   
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
        portState === "closed"
        ) {
        console.log("Trying to autoconnect to port")
        autoConnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canUseSerial, hasManuallyDisconnected, hasTriedAutoconnect, portState]);

    return (
        <SerialContext.Provider
        value={{
            canUseSerial,
            hasTriedAutoconnect,
            command,
            portState,
            authConnect: authConnect,
            disconnect: closePort,
        }}
        >
            {children}
        </SerialContext.Provider>
    );
};

export default ProviderSerial;