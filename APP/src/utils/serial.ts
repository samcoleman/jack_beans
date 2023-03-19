
export const cm_serial_info = { usbVendorId: 1027, usbProductId: 24577 };


const serial_buttons = {
    cappuccino:     new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 6, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 88]),
    americano:      new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 5, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 87]),
    hot_chocolate:  new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 89]),
    latte:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 85]),
    white_coffee:   new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 86]),
    mocha:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 9, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 91]),
    steam:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 2, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 84]),
    other:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 1, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 83]),

}

type button = keyof typeof serial_buttons
export const press_button = async (command: (bytes: Uint8Array) => Promise<Uint8Array>,  button: button) => {
    console.log("Press button: ", button)
    const res = await command(serial_buttons[button])

    if (res.length === 0) {
        return
    }

    const handshake = new Uint8Array([...res, 0])
    handshake[handshake.length-1] = res[res.length-1]!
    handshake[handshake.length-2] = 0

    const res_hand = await command(handshake)

    if (res_hand.toString() === res.toString() && res_hand.toString() !== "") {
        console.log("Handshake success")
    }else{
        console.log("Handshake fail")
    }
}

export type mach_error = {
    number: number,
    fault:  number,
    desc: string,
    flag: number,
    datetime: Date,
    count: number
}

const error_lookup : { [key: number]: string } = {
    1:   'F26 Current error',
    61:  '9061 Standby event',
    62:  '9062 Reset event!',
    68:  'Grouts container withdrawn',
    72:  'Manual input open',
    76:	 'No water pressure',
    241: 'F161 Error flowmeter occurs during brewing cycle',
    243: 'F163 Error flowmeter occurs during check of flow rate',
    245: 'F165 Error flowmeter occurs during mixer dosing',
    246: 'F166 Error flowmeter occurs during steam boiler supply',
    248: 'F9248 error electrode detection',
    268: '9268 power supply  notifies to cpu mains voltage too low',
    271: 'F9271 oscillation pump swiches to coast down operation mode',
}


export const get_errors = async (command: (bytes: Uint8Array) => Promise<Uint8Array>, limit = 100) => {
    function convert_littleendian(bytes: Uint8Array) {
        let res = 0;
        for (let i = 0; i < bytes.length; i++) {
            res += bytes[i]! * Math.pow(256, i)
        }
        return res
    }
    
    function get_error(res: Uint8Array) {
        // What a dumb schema
        const year   = new Date().getFullYear()
        const month  = convert_littleendian(res.slice(34, 36))
        const day    = convert_littleendian(res.slice(32, 34))
        const hour   = convert_littleendian(res.slice(30, 32))
        const minute = convert_littleendian(res.slice(28, 30))
        const second = convert_littleendian(res.slice(26, 28))

        const number = convert_littleendian(res.slice(14, 16))
        const fault  = convert_littleendian(res.slice(22, 24))
        const flag   = convert_littleendian(res.slice(24, 26))
        const count  = convert_littleendian(res.slice(36, 38))

        const e : mach_error = { 
            number, fault, flag, count, 
            desc: fault in error_lookup ? error_lookup[fault]! : "Unknown Error Code",
            datetime: new Date(year, month, day, hour, minute, second),  
        } 
        
        return e
    }

    const errors: mach_error[] = []
    for (let i = 0; i < limit; i++) {
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 1,   0, 0, 0, 11, 0, 0, 0, 96]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 2,   0, 0, 0, 11, 0, 0, 0, 97]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 161, 0, 0, 0, 11, 0, 0, 0, 0]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 199, 0, 0, 0, 11, 0, 0, 0, 38]
        const res = await command(new Uint8Array([3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, (1+i)%256, 0, 0, 0, 11, 0, 0, 0, (96+i)%256]))
        const error = get_error(res)

        // This signals the end of the error list
        if (error.fault === 118) {
            break
        }

        errors.push(get_error(res))
    }
    return errors
}