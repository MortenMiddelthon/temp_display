#!/bin/sh
PROG=read_dht11
gcc -o ${PROG} ${PROG}.c -lwiringPi -lwiringPiDev 
