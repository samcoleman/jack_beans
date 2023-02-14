import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
  } from "react";

import { cm_serial_info } from "../utils/const";
  
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
    connect(): Promise<boolean>;
    retry(): void;
    disconnect(): void;
    tx(bytes: Uint8Array): void;
    rx(): Promise<Uint8Array>;
    subscribe(callback: SerialMessageCallback): () => void;
}
export const SerialContext = createContext<SerialContextValue>({
    canUseSerial: false,
    hasTriedAutoconnect: false,
    connect: () => Promise.resolve(false),
    retry:() => {},
    disconnect: () => {},
    portState: "closed",
    tx: () => {},
    rx: () => Promise.resolve(new Uint8Array()),
    subscribe: () => () => {},
});

export const useSerial = () => useContext(SerialContext);

interface SerialProviderProps {}
const ProviderSerial = ({ children }: { children: React.ReactNode }) => {

    const readBuffer = useRef<SerialMessage>({value: new Uint8Array(), done: false, timestamp: 0});

    const [canUseSerial, setCanUseSerial] = useState(false);

    const [portState, setPortState] = useState<PortState>("closed");
    const [hasTriedAutoconnect, setHasTriedAutoconnect] = useState(false);
    const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

    const portRef = useRef<SerialPort | null>(null);
    const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
    const readerClosedPromiseRef = useRef<Promise<void>>(Promise.resolve());

    const currentSubscriberIdRef = useRef<number>(0);
    const subscribersRef = useRef<Map<number, SerialMessageCallback>>(new Map());


    
    /**
     * Subscribes a callback function to the message event.
     *
     * @param callback the callback function to subscribe
     * @returns an unsubscribe function
     */
    const subscribe = (callback: SerialMessageCallback) => {
        const id = currentSubscriberIdRef.current;
        subscribersRef.current.set(id, callback);
        currentSubscriberIdRef.current++;
    
        return () => {
          subscribersRef.current.delete(id);
        };
    };

    const tx = async (bytes: Uint8Array) => {
        //Clear Read Line
        readBuffer.current = {value: new Uint8Array(), done: false, timestamp: 0}

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

    const rx = async () => {
        // Wait until packet has been received
        // FIXME: This souhld have a max timeout and throw an error
        // Feels a bit hacky anyway, better method?
        while(!readBuffer.current.done){
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log(`RX: ${readBuffer.current.value.toString()}`);

        // Return the received data without start bit and length
        return readBuffer.current.value.slice(3, readBuffer.current.value.length)
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
            readBuffer.current = {value: new Uint8Array([...readBuffer.current.value, ...value]), done: false, timestamp: Date.now()}
           
            // Message must be at least 3 bytes long
            if (readBuffer.current.value.length > 2){
                // LSB + MSB + 1 byte (start bit) + 2 bytes for length + ( 1 byte for array non 0 index ) 
                const length = (readBuffer.current.value[1]! + 256 * readBuffer.current.value[2]!) + 4
                if (readBuffer.current.value.length == length){
                    readBuffer.current.done = true
                    //console.log(readBuffer.current)
                }
            }
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

    const manualConnectToPort = async () => {
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

    const autoConnectToPort = async () => {
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

    const manualDisconnectFromPort = async () => {
        if (canUseSerial && portState === "open") {
        const port = portRef.current;
        if (port) {
            setPortState("closing");

            // Cancel any reading from port
            readerRef.current?.cancel();
            await readerClosedPromiseRef.current;
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
     * Event handler for when the port is disconnected unexpectedly.
     */
    const onPortDisconnect = async () => {
        // Wait for the reader to finish it's current loop
        await readerClosedPromiseRef.current;
        // Update state
        readerRef.current = null;
        readerClosedPromiseRef.current = Promise.resolve();
        portRef.current = null;
        setHasTriedAutoconnect(false);
        setPortState("closed");
    };

    const onPortConnect = async () => {
        retry();
    }

    // Handles attaching the reader and disconnect listener when the port is open
    useEffect(() => {
        const port = portRef.current;
        
        if (portState === "open" && port) {
            // When the port is open, read until closed
            
            const aborted = { current: false };
            readerRef.current?.cancel();
            readerClosedPromiseRef.current.then(() => {
                if (!aborted.current) {
                readerRef.current = null;
                readerClosedPromiseRef.current = readUntilClosed(port);
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

    const retry = () => {
        setHasTriedAutoconnect(false);
    }

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
        autoConnectToPort();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canUseSerial, hasManuallyDisconnected, hasTriedAutoconnect, portState]);

    return (
        <SerialContext.Provider
        value={{
            canUseSerial,
            hasTriedAutoconnect,
            tx,
            rx,
            subscribe,
            portState,
            connect: manualConnectToPort,
            retry,
            disconnect: manualDisconnectFromPort,
        }}
        >
            {children}
        </SerialContext.Provider>
    );
};

export default ProviderSerial;