
export const cm_serial_info = { usbVendorId: 1027, usbProductId: 24577 };

export const serial = {
    button_commands : {
        cappuccino:     new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 6, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 88]),
        americano:      new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 5, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 87]),
        hot_chocolate:  new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 89]),
        latte:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 85]),
        white_coffee:   new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 7, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 86]),
        mocha:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 9, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 91]),
        steam:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 2, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 84]),
        other:          new Uint8Array([5, 0, 1, 0, 0, 0, 1, 0, 1, 73, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 83]),
    }
}