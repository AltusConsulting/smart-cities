import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';


import { Config } from '../../shared/config';
import { ValueList, ValueItem, SelectedIndexChangedEventData } from 'nativescript-drop-down';

import firebase = require('nativescript-plugin-firebase');

import { Switch } from 'ui/switch';
import { TextField} from 'ui/text-field';
import * as dialogs from 'ui/dialogs';
import * as appSettings from 'application-settings';
import * as app from 'application';

declare var global: any;
var Toast = require('nativescript-toast');

@Component({
    moduleId: module.id,
    selector: 'settings',
    templateUrl: 'settings.component.html',
    styleUrls: ["settings-common.css"]
})

export class SettingsComponent implements OnInit {

    private config : Config;
    private reportCheck : boolean;
    private alertCheck : boolean;

    private selectedReportIndex : number = 0;
    private selectedLoginIndex : number = 0;
    public reportServerList : ValueList<string>;
    public loginServerList : ValueList<string>;

    public selectedIndex = 1;
    public items: Array<string>;

    public current311Server: string;
    public open311Server: string;
    private changed311Api : boolean;

    @ViewChild('open311Textfield') open311Textfield : ElementRef;
    
    constructor(private nav : RouterExtensions) {}

    ngOnInit(){
        this.config = new Config();

        this.reportCheck = appSettings.getBoolean(this.config.REPORT_NOTIFICATION_KEY, true);
        this.alertCheck = appSettings.getBoolean(this.config.ALERT_NOTIFICATION_KEY,true);

        this.current311Server = this.config.open311Url;
        this.open311Server = this.config.open311Url;
        this.changed311Api = false;
    }


    /**
     * Function called when the switch for reports notifications triggers an event when its check value is changed
     * 
     * @param {any} args 
     * 
     * @memberof SettingsComponent
     */
    public reportsChecked(args)
    {
        let reportSwitch = <Switch>args.object;
        if(reportSwitch.checked)
        {
            firebase.subscribeToTopic(this.config.REPORT_NOTIFICATION_KEY);
            this.reportCheck = true;
            appSettings.setBoolean(this.config.REPORT_NOTIFICATION_KEY,this.reportCheck);
        }
        else
        {
            firebase.unsubscribeFromTopic(this.config.REPORT_NOTIFICATION_KEY);
            this.reportCheck = false;
            appSettings.setBoolean(this.config.REPORT_NOTIFICATION_KEY, this.reportCheck);
        }
    }

    /**
     * Function called when the switch for events notifications triggers an event when its check value is changed
     * 
     * @param {any} args 
     * 
     * @memberof SettingsComponent
     */
    public alertChecked(args)
    {
        let alertSwitch = <Switch>args.object;
        if(alertSwitch.checked)
        {
            firebase.subscribeToTopic(this.config.ALERT_NOTIFICATION_KEY);
            this.alertCheck = true;
            appSettings.setBoolean(this.config.ALERT_NOTIFICATION_KEY, this.alertCheck);
        }
        else
        {
            firebase.unsubscribeFromTopic(this.config.ALERT_NOTIFICATION_KEY);
            this.alertCheck = false;
            appSettings.setBoolean(this.config.ALERT_NOTIFICATION_KEY, this.alertCheck);
        }
    }

    /**
     * Function called when user press Save Changes button
     * 
     * 
     * @memberof SettingsComponent
     */
    public saveChanges()
    {
        this.check311ApiChanges();
        if(this.changed311Api)
        {
            this.showDialog();
            Toast.makeText(global.L('api_updates')).show()
        }
        else{
             Toast.makeText(global.L("no_changes_detected")).show();
        }
    }

    /**
     * Check if URL was changed
     * 
     * 
     * @memberof SettingsComponent
     */
    check311ApiChanges(){
        if(this.open311Server !== this.current311Server)
            this.changed311Api = true;
        else
            this.changed311Api = false;
    }


    /**
     * Show confirm dialog for making changes
     * 
     * 
     * @memberof SettingsComponent
     */
    private showDialog()
    {
        dialogs.confirm({
                title: global.L('confirm_title'),
                message: global.L('confirm_message')+this.current311Server,
                okButtonText: global.L('accept'),
                cancelButtonText: global.L('cancel')
            }).then((result) => {
                if(result)
                {
                    if(this.changed311Api){
                        this.open311Server = this.current311Server;
                        appSettings.setString(this.config.OPEN311_BACKEND_KEY, this.current311Server);
                        this.changed311Api = false;
                    }       
                }
                else
                {
                    this.nav.back()
                }
            });
    }

    /**
     * returns to the previous page in the stack navigation
     * 
     * 
     * @memberof SettingsComponent
     */
    public goBack()
    {
        this.nav.navigate([''],{clearHistory: true});
    }

}