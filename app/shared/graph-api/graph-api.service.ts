import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as appSettings from 'application-settings';

import { Config } from '../config';

@Injectable()
export class GraphAPIService {
    private config : Config;

    constructor(private http: Http) 
    {
        this.config = new Config();
    }

    public getUserInfo()
    {
        this.http.get(
            this.config.facebookGraphApiUrl+"me?fields=email,first_name,last_name&access_token="
            +appSettings.getString(this.config.FACEBOOK_TOKEN_KEY,"")
        )
        .map(res => res.json());
    }

    public getUserPicture(facebookUserId : string)
    {
        this.http.get(
            this.config.facebookGraphApiUrl+facebookUserId+"/picture?type=large&access_token="
            +appSettings.getString(this.config.FACEBOOK_TOKEN_KEY,"")
        )
        .map(res => res.json())
    }
    
}