import { Component, ViewContainerRef, OnInit } from "@angular/core";
import {initializeOnAngular} from "nativescript-web-image-cache";
import firebase = require("nativescript-plugin-firebase");
import { RouterExtensions } from "nativescript-angular/router";
import {Router, NavigationExtras} from "@angular/router";
import dialogs = require("ui/dialogs");
import * as appSettings from "application-settings";
import { AlertComponent } from "./components/alert/alert.component";
import { vibration } from "nativescript-vibrate";
import { on as applicationOn, launchEvent, suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, uncaughtErrorEvent, ApplicationEventData, start as applicationStart } from "application";
declare var global : any
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Config } from "./shared/config";
@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})
        
export class AppComponent { 
    private config : Config;
    constructor(private nav : RouterExtensions, private router: Router){
        this.config = new Config();
        initializeOnAngular();
    }
    ngOnInit(){
        firebase.addOnMessageReceivedCallback(
            (message:  firebase.Message) => {  
                console.info(JSON.stringify(message, null, 4));
                
                if(message["alert"]=="true"){
                    vibration(5000);
                    let navigationExtras: NavigationExtras = {
                        queryParams: {
                            "id": message["id"],
                            "path": message["page"],
                            "description": message.body
                        }
                    };
                    this.router.navigate(['/alert'], navigationExtras);
                    
                }
                else{
                    var options = {
                        title: message.title,
                        message: message.body,
                        okButtonText: global.L('check_it'),
                        cancelButtonText: global.L('not_now')
                    };
                    
                    dialogs.confirm(options).then((result: boolean) => {
                        if(result){
                            console.info("page: "+message["page"]);
                            this.nav.navigate([message["page"], message]);
                        }
                    });
                }
            }
        
        ).then(
        (instance) => {
            console.info("onMessageReceivedCallback done");
            if(appSettings.getBoolean(this.config.REPORT_NOTIFICATION_KEY,true))
            {
                firebase.subscribeToTopic(this.config.REPORT_NOTIFICATION_KEY);
            }
            else
            {
                firebase.unsubscribeFromTopic(this.config.REPORT_NOTIFICATION_KEY);
            }
        },
        (error) => {
            console.info("onMessageReceivedCallback error: " + error);
        }
        );
    }
}