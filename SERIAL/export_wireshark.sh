#!/bin/sh

for file in ./SERIAL_CAPTURE/RAW_WIRESHARK/*
do
    FILENAME=$(basename $file .pcapng)
    tshark -r $file -Y "ftdi-ft&&(ftdi-ft.if_a_rx_payload||ftdi-ft.if_a_tx_payload)" -l -n -T json > "./SERIAL_CAPTURE/$FILENAME.json"
    echo "Exported: $FILENAME"
done