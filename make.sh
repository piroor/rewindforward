#!/bin/sh

appname=rewindforward

cp buildscript/makexpi.sh ./
./makexpi.sh $appname version=0
rm ./makexpi.sh

