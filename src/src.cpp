
#include <Arduino.h>

bool flip = false;
String a;

int button = 16;

void pressButton(){
    Serial.println("Button Pressed");
    pinMode(button, OUTPUT);
    digitalWrite(button, LOW);
    delay(300);
    pinMode(button, INPUT);
}

void setup(){
	Serial.begin(115200);
	Serial.printf("/// INITIALISING MODULES ///\n\n");
    pinMode(button, INPUT);
}



void loop(){
    while(Serial.available()) {
        a = Serial.readString();// read the incoming data as string
        if (a == "2") {
            pressButton();
        }
    }
}