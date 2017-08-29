import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Config } from '../config';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { User } from '../user/user.model';

@Injectable()
export class SignUpService {
    private config : Config;

    constructor(private http : Http) {
        this.config = new Config();
     }

     public register(user : User) {
       let headers = new Headers();
        headers.append("Content-Type", "application/json");

        return this.http.post(
            this.config.aaaApiBase+"/sign-up",
            {
                username: user.Username,
                first_name: user.FirstName,
                last_name: user.LastName,
                email: user.Email,
                password: user.Password
            },
            {headers : headers}
        )
     }

     private handleError(error: Response)
    {
        console.error(error);
        return Observable.throw(error);
    }
}