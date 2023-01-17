import time
import sys
import PySimpleGUI as sg
from const import cap, led
from dev import env

if dev:
    import FakeRPi.GPIO as GPIO
else:
    import RPi.GPIO as GPIO



def pressButton(pin: int):
    print("Button Pressed: " + str(pin))
    GPIO.setup(pin, GPIO.OUTPUT)
    GPIO.output(pin, GPIO.LOW)
    time.sleep(0.3)
    GPIO.setup(pin, GPIO.OUTPUT)
    return 0

def setup():
    GPIO.setmode(GPIO.BCM)

    for p in cap:
        GPIO.setup(p, GPIO.INPUT)

    for p in led:
        GPIO.setup(p, GPIO.INPUT)

    return 0


def main():
    return 0


setup()

layout = [[sg.Button('Pin0', button_color=('white', 'black'), key='Pin0'),
           sg.Button('Pin1', button_color=('white', 'black'), key='Pin1'),
           sg.Button('Pin2', button_color=('white', 'black'), key='Pin2'),
            sg.Button('Pin3', button_color=('white', 'black'), key='Pin3'),
            sg.Button('Pin4', button_color=('white', 'black'), key='Pin4')],
          [
            sg.Button('Pin5', button_color=('white', 'black'), key='Pin5'),
            sg.Button('Pin6', button_color=('white', 'black'), key='Pin6'),
            sg.Button('Pin7', button_color=('white', 'black'), key='Pin7'),
            sg.Button('Pin8', button_color=('white', 'black'), key='Pin8'),
            sg.Button('Pin9', button_color=('white', 'black'), key='Pin9'),
        ]]


window = sg.Window("TEST", layout, auto_size_buttons=True, default_button_element_size=(50,5), use_default_focus=False, finalize=True)

recording = have_data = False
while True:
    main()

    event, values = window.read(timeout=100)
    if event == sg.WINDOW_CLOSED:
        break

    #switch statement for buttons pressed tiggering the pressButton function
    if event == 'Pin0':
        pressButton(cap[0])
    elif event == 'Pin1':
        pressButton(cap[1])
    elif event == 'Pin2':
        pressButton(cap[2])
    elif event == 'Pin3':
        pressButton(cap[3])
    elif event == 'Pin4':
        pressButton(cap[4])
    elif event == 'Pin5':
        pressButton(cap[5])
    elif event == 'Pin6':
        pressButton(cap[6])
    elif event == 'Pin7':
        pressButton(cap[7])
    elif event == 'Pin8':
        pressButton(cap[8])
    elif event == 'Pin9':
        pressButton(cap[9])

window.close()