import time
import sys
import PySimpleGUI as sg
from const import cap, led
from env import dev

#This deals with mac and windows not having GPIO
if dev:
    import FakeRPi.GPIO as GPIO
else:
    import RPi.GPIO as GPIO

min_button = 0.3
timeout_button = 10

def pressButton(pin: int):
    print("Button Pressed: " + str(pin))
    GPIO.setup(pin, GPIO.OUTPUT)
    GPIO.output(pin, GPIO.LOW)
    return 0

def releaseButton(pin: int):
    print("Button Released: " + str(pin))
    GPIO.setup(pin, GPIO.OUTPUT)
    return 0

def update_buttons():
    for button in state.keys():
        if state[button][0] and not state[button][1]:
            pressButton(cap[button])
            state[button][1] = True
            state[button][2] = time.time()
        
        elapsed = time.time() - state[button][2]

        if elapsed > timeout_button:
            state[button][0] = False

        if not state[button][0] and state[button][1]:
            if elapsed < min_button:
                return

            releaseButton(cap[button])
            state[button][1] = False
    

def setup():
    GPIO.setmode(GPIO.BCM)

    for p in cap:
        GPIO.setup(p, GPIO.INPUT)

    for p in led:
        GPIO.setup(p, GPIO.INPUT)

    return 0

setup()

state = {
    "hot_chocolate":    [False, False, 0],
    "cappuccino":       [False, False, 0],
    "americano":        [False, False, 0],
    "white_coffee":     [False, False, 0],
    "latte":            [False, False, 0],
    "mocha":            [False, False, 0],
    "hot_water":        [False, False, 0],
    "power":            [False, False, 0],
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
        ]]


window = sg.Window("TEST", layout, auto_size_buttons=True, default_button_element_size=(50,5), use_default_focus=False, finalize=True)

for button in state.keys():
    window[button].bind('<ButtonPress-1>' , "-p")

recording = have_data = False
while True:
    event, values = window.read(timeout=100)
    if event == sg.WINDOW_CLOSED:
        break
    
    button = event.replace("-p", "")
    if button in cap.keys():
        if "-p" in event:
            state[event.replace("-p", "")][0] = True
        else:
            state[event.replace("-p", "")][0] = False

    update_buttons()
        

window.close()