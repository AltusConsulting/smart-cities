import { Injectable } from '@angular/core';
import { Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { Config } from '../config';

@Injectable()
export class MessagingService {
    private config : Config;

    constructor(private http : Http) 
    {
        this.config = new Config();
    }

    pushNotification(alert:boolean, id:string, page:string, priority:string, body:string, title:string, topic:string){
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        
        return this.http.post(
            this.config.messagingApiUrl +"/api/messaging/v1/notifications",
            JSON.stringify({
                to: "/topics/"+topic,
                delay_while_idle : true,
                priority : priority,
                data: {
                    alert: alert,
                    id : id,
                    page : page
                },
                notification : {
                body : body,
                title : title,
                sound : "enable"
                
                }
            }),
            {headers : headers} 
        )
        .map(response => response.json())
    }
}