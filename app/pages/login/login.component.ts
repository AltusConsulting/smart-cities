import { Component, OnInit, ViewChild, ElementRef, DoCheck } from '@angular/core';

import * as tnsOAuthModule from "nativescript-oauth";
import * as appSettings from "application-settings";
import { RouterExtensions } from "nativescript-angular/router";

import { Config } from "../../shared/config";
import { LoginService } from "../../shared/login/login.service";
import { User } from "../../shared/user/user.model";

import {Page} from "ui/page";
import { Color } from "color";
import { TextField } from "ui/text-field";
import { CheckBox } from "nativescript-checkbox";
import * as Toast from "nativescript-toast";

import * as app from 'application';
import * as platform from "platform";
declare var android: any; //bypass the TS warnings

declare var global : any

import { JwtHelper } from 'angular2-jwt';

/**
 * Login component class
 * 
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 */
@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: ['../../pages/login/login-common.css','../../pages/login/login.css'],
    providers: [LoginService]
})
export class LoginComponent implements OnInit {

    private config : Config;
    private user : User;
    public loading;

    jwtHelper: JwtHelper;
    
    @ViewChild("checkbox") checkBox: ElementRef;
    @ViewChild("username") username: ElementRef;
    @ViewChild("password") password: ElementRef;

    /**
     * Creates an instance of LoginComponent.
     * @param {Page} page 
     * @param {RouterExtensions} nav 
     * @param {LoginService} loginService 
     * 
     * @memberof LoginComponent
     */
    constructor(private page: Page, private nav : RouterExtensions, private loginService: LoginService) { }

    ngOnInit() 
    {
        this.config = new Config();
        this.user = new User();
        this.config.user = new User();
        // Hide the default application actionBar
        this.page.actionBarHidden = true; 
        this.loading = false;  

        this.hideKeyboard();

        this.jwtHelper  = new JwtHelper();
        
        
    }

    /**
     * prevent the soft keyboard from showing initially when textfields are present
     * 
     * 
     * @memberof LoginComponent
     */
    hideKeyboard(){
        if (platform.isAndroid) {
            app.android.startActivity.getWindow().setSoftInputMode(
            android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
        }
    }

    /**
     * attemtpts to authenticate the user
     * 
     * 
     * @memberof LoginComponent
     */
    public login()
    {
        let checkbox = <CheckBox> this.checkBox.nativeElement;
        if(checkbox.checked)
        {
            //sign in as anonymous
            this.config.email_token = this.config.anonymousToken;

            // set the email token key and anonymous login key
            appSettings.setString(this.config.EMAIL_TOKEN_KEY,this.config.email_token);
            appSettings.setBoolean(this.config.ANONYMOUS_LOGIN_KEY, true);

            //navigate to home component
            Toast.makeText(global.L("anonymous_login")).show();
            this.nav.navigate(['/home'],{clearHistory: true});   
        }
        else
        {
            //check if any textfield is empty
            if(this.user.Username ==="" && this.user.Password ==="" ){
                Toast.makeText(global.L("username_password")).show();
            }
            else if(this.user.Username ===""){
                Toast.makeText(global.L("username_missing")).show();
            }
            else if(this.user.Password ===""){
                Toast.makeText(global.L("password_missing")).show();
            }
            else{
                this.loading = true;
                //sign in with email and password
                this.loginService.login(this.user)
                    .subscribe(
                        (data) => {
                            //set the login token and navigate the main menu
                            this.config.email_token = data.token;
                            //set username to config file
                            this.config.user = this.user;
                            console.info("token: "+data.token);
                            
                            appSettings.setBoolean(this.config.ANONYMOUS_LOGIN_KEY, false);
                            appSettings.setString(this.config.EMAIL_TOKEN_KEY, this.config.email_token);
                            appSettings.setString(this.config.USER_PASSWORD_KEY,this.user.Password);
                            this.loading = false;
                            this.nav.navigate([''],{ clearHistory : true});
                           
                        },
                        (error) => {
                            this.loading = false;
                            console.info("response error "+JSON.stringify(error,null,4));
                            Toast.makeText(error).show();
                        }
                    )
            }  
        }
        
    }

    /**
     * attempt to authenticate with Facebook
     * 
     * 
     * @memberof LoginComponent
     */
    public facebookLogin()
    {
        //use oauth to authenticate
        tnsOAuthModule.ensureValidToken()
            .then((token : string) => {
                let userData = this.jwtHelper.decodeToken(token);
                console.info("DECODE TOKEN: "+JSON.stringify(token));
                console.info("token: "+token);
                appSettings.setString(this.config.FACEBOOK_TOKEN_KEY,token);
                appSettings.setBoolean(this.config.ANONYMOUS_LOGIN_KEY, false);
                this.nav.navigate(['/home'], {clearHistory: true});
                
            })
            .catch((er) => {
                console.info("Error: "+er);
                Toast.makeText(global.L('facebook_error')).show();
            })
    }

    /**
     * Generate a new password and sends it to the user's email
     * 
     * 
     * @memberof LoginComponent
     */
    public resetPassword()
    {
        //check if username textfield isn't empty
        if(this.user.Username === "")
        {
            Toast.makeText(global.L("username_missing")).show();
        }
        else
        {
            //generate new password and send it to the user's email
            this.loginService.resetPassword(this.user)
                .subscribe(
                    (data) => {
                        Toast.makeText(data).show();
                    },
                    (error) => {
                        Toast.makeText(error).show();
                    }
                );
        }
    }

    /**
     * navigates to a new component
     * 
     * @private
     * @param {string} component name of the component to navigate to
     * @param {boolean} [clearHistory] boolean that indicates if the navigation stack should be cleared
     * 
     * @memberof LoginComponent
     */
    private navigate(component : string, clearHistory? : boolean)
    {
        if(clearHistory)
        {
            this.nav.navigate(['/'+component], {clearHistory:clearHistory});
        }
        else
        {
            this.nav.navigate(['/'+component]);
        }
    }
}