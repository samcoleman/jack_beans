
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
    const res = await command(serial_buttons[button])

    let handshake = new Uint8Array([...res, 0])
    handshake[handshake.length-1] = res[res.length-1]!
    handshake[handshake.length-2] = 0

    const res_hand = await command(handshake)

    if (res_hand === res) {
        console.log("Handshake success")
    }else{
        console.log("Handshake failed")
    }
}

type error = {
    number: number,
    fault:  number,
    flag: number,
    datetime: number,
    count: number
}



export const get_errors = async (command: (bytes: Uint8Array) => Promise<Uint8Array>, limit: number = 100) => {
    function convert_littleendian(bytes: Uint8Array) {
        let res = 0;
        for (let i = 0; i < bytes.length; i++) {
            res += bytes[i]! * Math.pow(256, i)
        }
        return res
    }
    
    function get_error(res: Uint8Array) {
        return { number: 0, fault:  0, flag: 0, datetime: Date.now(), count: 0} as error
    }

    const res_len = await command(new Uint8Array([3, 0, 1, 0, 0, 0, 1, 0, 134, 82, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 222]))
    
    let len = convert_littleendian(res_len.slice(26, 28))
    if (len > limit) {
        len = limit
    }

    const errors: error[] = []
    for (let i = 0; i < len; i++) {
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 1,   0, 0, 0, 11, 0, 0, 0, 96]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 2,   0, 0, 0, 11, 0, 0, 0, 97]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 161, 0, 0, 0, 11, 0, 0, 0, 0]
        // [3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, 199, 0, 0, 0, 11, 0, 0, 0, 38]
        const res = await command(new Uint8Array([3, 0, 1, 0, 0, 0, 1, 0, 1, 77, 0, 0, 1, 0, i%256, i/256, 0, 0, 11, 0, 0, 0, (96+i)%256 ]))
        errors.push(get_error(res))
    }

}

export const get_config = async (command: (bytes: Uint8Array) => Promise<Uint8Array>) => {
    
}