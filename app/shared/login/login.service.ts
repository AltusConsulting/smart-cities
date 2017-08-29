import { Injectable } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { Config } from '../config';
import { User } from '../user/user.model';
import * as appSettings from "application-settings";

declare var global : any

@Injectable()
export class LoginService {
    private config : Config;

    constructor(private http : Http) 
    {
        this.config = new Config();
    }

    login(user : User){
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        
        return this.http.post(
            this.config.aaaApiBase+"/authenticate",
            JSON.stringify({
                username: user.Username,
                password: user.Password
            }),
            {headers : headers} 
        )
        .timeout(20000)
        .map(response => response.json())
        .catch(this.handleError);
    }

    changePassword(password: string){
        let username = appSettings.getString(this.config.USER_ID_KEY,"");

        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        
        return this.http.post(
            this.config.aaaApiBase+"/recovery/change-password",
            JSON.stringify({
                username : username,
                password: password,
            }),
            {headers : headers} 
        )
        .map(response => response.json())
        .catch(this.handleError);
    }

    updateUser(username:string, password:string, email:string){

        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer "+ appSettings.getString(this.config.EMAIL_TOKEN_KEY, ""));
        
        return this.http.put(
            this.config.aaaApiBase+"/api/aaa/v1/users/"+username,

            JSON.stringify({
                username: username,
                first_name: "na",
                last_name: "na",
                email: email,
                password: password
            }),
            {headers : headers} 
        )
        .map(response => response.json())
    }

    public resetPassword(user : User)
    {
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization","Bearer "+appSettings.getString(this.config.EMAIL_TOKEN_KEY, ""));

        return this.http.post(
            this.config.aaaApiBase+"/recovery/password",
            JSON.stringify({
                username: user.Username,
                first_name: user.FirstName,
                last_name: user.LastName,
                email: user.Email,
                auth_backend: user.AuthBackend,
                module: [""]
            }),
            {headers : headers}
        )
        .map(response => response.json())
        .catch(this.handleError);

    }

    private handleError(error: Response)
    {
        
        if(!error.hasOwnProperty("status"))
        {
            console.error("timeout error!!!")
            return Observable.throw(global.L("timeout_error"));
        }
        switch(error.status)
        {
            case 401:
            {
                return Observable.throw(global.L("unauthorized_user"));
            }
            default:
            {
                return Observable.throw(global.L("connection_error"));
            }
        }
    }

}