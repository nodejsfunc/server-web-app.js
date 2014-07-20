#!/bin/bash

# create an RPM using the SWA dist folder


vagrant ssh-config | ssh -F /dev/stdin default '/vagrant/server-web-app/rpm/rpm-build-swa.sh '

