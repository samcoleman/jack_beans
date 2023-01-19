import time
import sys
import PySimpleGUI as sg
from const import caps, leds
from env import dev

#This deals with mac and windows not having GPIO
if dev:
    import FakeRPi.GPIO as GPIO
else:
    import RPi.GPIO as GPIO

min_button = 0.3
timeout_button = 5

def log(message: str):
    print(message)
    with open('log.csv', 'a') as f:
        f.write(f"{message}, {time.time()}\n")

def pressButton(pin: int):
    log("Button Pressed: " + str(pin))
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.LOW)
    return 0

def releaseButton(pin: int):
    log("Button Released: " + str(pin))
    GPIO.setup(pin, GPIO.IN)
    return 0

def update_buttons():
    for button in button_state.keys():
        if button_state[button][0] and not button_state[button][1]:
            pressButton(caps[button])
            button_state[button][1] = True
            button_state[button][2] = time.time()
        
        elapsed = time.time() - button_state[button][2]

        if elapsed > timeout_button:
            button_state[button][0] = False

        if not button_state[button][0] and button_state[button][1]:
            if elapsed < min_button:
                return

            releaseButton(caps[button])
            button_state[button][1] = False

def update_inputs():
    for led in led_state.keys():
        if led_state[led][0] and not led_state[led][1]:
            log(f"Led {led}: ON")
            led_state[led][1] = True
        

        if not led_state[led][0] and led_state[led][1]:
            log(f"Led {led}: OFF")
            led_state[led][1] = False
    

def setup():
    GPIO.setmode(GPIO.BCM)

    for p in caps.keys():
        GPIO.setup(caps[p], GPIO.IN)

    for p in leds.keys():
        GPIO.setup(leds[p], GPIO.IN)

    return 0

setup()

button_state = {
    "hot_chocolate":    [False, False, 0],
    "cappuccino":       [False, False, 0],
    "americano":        [False, False, 0],
    "white_coffee":     [False, False, 0],
    "latte":            [False, False, 0],
    "mocha":            [False, False, 0],
    "hot_water":        [False, False, 0],
    "power":            [False, False, 0],
}

led_state = {
    "7": [False, False],
    "6": [False, False],
    "5": [False, False],
    "4": [False, False],
    "3": [False, False],
    "2": [False, False],
    "1": [False, False],
    "0": [False, False],
}

layout = [[ sg.Button('Hot Chocolate', button_color=('white', 'black'), key='hot_chocolate', ),
            sg.Button('Cappuccino', button_color=('white', 'black'), key='cappuccino'),
            sg.Button('Americano', button_color=('white', 'black'), key='americano'),
            sg.Button('White Coffee', button_color=('white', 'black'), key='white_coffee')],
          [
            sg.Button('Latte', button_color=('white', 'black'), key='latte'),
            sg.Button('Mocha', button_color=('white', 'black'), key='mocha'),
            sg.Button('Hot Water', button_color=('white', 'black'), key='hot_water'),
            sg.Button('Power', button_color=('white', 'black'), key='power'),
            sg.Button('LOG_TIME', button_color=('white', 'black'), key='log'),
        ]]


window = sg.Window("TEST", layout, auto_size_buttons=True, default_button_element_size=(50,5), use_default_focus=False, finalize=True)
window.maximize()

for button in button_state.keys():
    window[button].bind('<ButtonPress-1>' , "-p")


recording = have_data = False

log("START")
while True:
    event, values = window.read(timeout=100)
    if event == sg.WINDOW_CLOSED:
        break

    if event == "log":
        log("LOG")
    
    button = event.replace("-p", "")
    if button in caps.keys():
        if "-p" in event:
            button_state[event.replace("-p", "")][0] = True
        else:
            button_state[event.replace("-p", "")][0] = False

    for led in led_state.keys():
        led_state[led][0] = GPIO.input(leds[led])

    update_buttons()     
    update_inputs() 

log("END")
window.close()
GPIO.cleanup()
