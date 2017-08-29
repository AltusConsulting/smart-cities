import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import * as appSettings from 'application-settings';

import { Config } from "../config";

/**
 * Angular AuthGuard class
 * 
 * @export
 * @class AuthGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AuthGuard implements CanActivate
{
    private config : Config;

    constructor(private nav : RouterExtensions) 
    { 
        this.config = new Config();
    }

    /**
     * Function called when navigating to main page, checks if user is authenticated
     * 
     * @returns boolean
     * 
     * @memberof AuthGuard
     */
    canActivate()
    {
        this.config.email_token = appSettings.getString(this.config.EMAIL_TOKEN_KEY,"");
        this.config.facebook_token = appSettings.getString(this.config.FACEBOOK_TOKEN_KEY,"");

        if(this.config.email_token !== "" || this.config.facebook_token !== "")
        {
            return true;
        }
        else
        {
            this.nav.navigate(['/login']);
            return false;
        }
    }
}