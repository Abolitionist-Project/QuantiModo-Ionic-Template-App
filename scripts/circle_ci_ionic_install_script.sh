#!/usr/bin/env bash
npm install -g ionic@1.7.16
npm install -g cordova@7.0.0
npm install -g bamlab/cordova-deploy
npm install && gulp configureApp
npm install -g karma-cli bower
bower install
ionic config build