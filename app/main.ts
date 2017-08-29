// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import * as app from 'application';
import { on as applicationOn, launchEvent, suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, uncaughtErrorEvent, ApplicationEventData, start as applicationStart } from "application";


import { AppModule } from "./app.module";
import { registerElement } from "nativescript-angular/element-registry";
import * as tnsOAuthModule from 'nativescript-oauth';

import firebase = require("nativescript-plugin-firebase");

import * as platform from "platform";
declare var GMSServices: any;

require('globals');
require('nativescript-i18n');

registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);
registerElement("CheckBox", () => require("nativescript-checkbox").CheckBox);
registerElement("Ripple", () => require("nativescript-ripple").Ripple);
registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);


if (platform.isIOS) { 
  GMSServices.provideAPIKey("AIzaSyChesjAg5p0bYoFbz8BRqAG2-m7TLdykmw");
}

if (app.ios) {
    var fontModule = require("ui/styling/font");
    fontModule.ios.registerFont("Raleway-Regular.ttf");
}

var facebookInitOptions : tnsOAuthModule.ITnsOAuthOptionsFacebook = {
    clientId: '188189337878390',
    clientSecret: '1f461d277f3241243782f31e30e1991b',
    scope: ['email','public_profile'] //whatever other scopes you need
};


tnsOAuthModule.initFacebook(facebookInitOptions);

firebase.init({
        onMessageReceivedCallback: (message: firebase.Message) =>{
            
        }
        }).then(
        (instance) => {
            console.info("firebase.init done");
            firebase.subscribeToTopic("events");
            firebase.subscribeToTopic("reports");
            firebase.subscribeToTopic("tests");
        },
        (error) => {
            console.info("firebase.init error: " + error);
        }
        );


platformNativeScriptDynamic().bootstrapModule(AppModule);
