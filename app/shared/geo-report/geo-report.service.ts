import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Config } from "../config";
import { Service } from "../service/service.model";
import { Report } from "../report/report.model";
import { Location } from "../location/location.model";
import { Utils } from "../utils/utils";

@Injectable()
export class GeoReportService {

    private config : Config;
    private utils : Utils;
    constructor(private http : Http) {
        this.config = new Config();
        this.utils = new Utils();
     }

    public getServiceList(jurisdiction_id? : string)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");

        return this.http.get(
            this.config.open311Url+"/services",
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            let servicesArray = [];
            //console.info(JSON.stringify(data));
            data.forEach(service => {
                let element = new Service();
                element.ID = service.id;
                element.jurisdictionID = service.jurisdiction_id;
                element.serviceName = service.service_name;
                element.description = service.description;
                element.metadata = service.metadata;
                element.type = service.type;
                element.keywords = service.keywords;
                element.group = service.group;
                servicesArray.push(element);
            });
            return servicesArray;
        });
    }

    public getServiceDefinition(serviceCode : string, jurisdiction_id? : string)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");

        return this.http.get(
            this.config.open311Url+"/services/"+serviceCode+"?jurisdiction_id="+jurisdiction_id,
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            return data;
        });
    }

    public postServiceRequest(reportRequest : Report, jurisdiction_id? : string)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");

        let year = reportRequest.requestedDateTime.getFullYear();
        let month = this.utils.getNumberFormat(reportRequest.requestedDateTime.getMonth());
        let date = this.utils.getNumberFormat(reportRequest.requestedDateTime.getDate());

        return this.http.post(
            this.config.open311Url+"/requests"+"?jurisdiction_id",
            {
                service_code: reportRequest.serviceCode,
                location: {
                    lat: reportRequest.location.lat,
    	            lon: reportRequest.location.lon
                },
                email: reportRequest.email,
                device_id: reportRequest.deviceID,//reportRequest.deviceID,
                account_id: reportRequest.accountID,
                first_name: reportRequest.firstName,
                last_name: reportRequest.lastName,
                service_name: reportRequest.serviceName,
              //phone: reportRequest.phone,
                description: reportRequest.description,
                media_url: reportRequest.mediaURL,
                address_string: reportRequest.addressString,
                requested_datetime: reportRequest.requestedDateTime
            },
            {headers : headers}
        )
    }
    
    public getServiceRequests(jurisdiction_id? : string, )
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");

        return this.http.get(
            this.config.open311Url+"/requests?jurisdiction_id"+jurisdiction_id,
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            let requestsArray = [];
            //console.info(JSON.stringify(data));
            data.forEach(report => {
                let element = new Report();
                element.ID = report.id
                element.jurisdictionID = report.jurisdiction_id;
                element.serviceCode = report.service_code;
                element.location = new Location(report.location.lat, report.location.lon);
                element.addressString = report.address_string;
                element.email = report.email;
                element.deviceID = report.device_id;
                element.accountID = report.account_id;
                element.firstName = report.first_name;
                element.lastName = report.last_name;
                element.description = report.description;
                element.mediaURL = report.media_url;
                element.serviceName = report.service_name;
                element.requestedDateTime = new Date(report.requested_datetime);
                requestsArray.push(element);
            });
            return requestsArray;
        });
    }

    public getServiceRequest(service_request_id : string, jurisdiction_id? : string)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json; charset=utf-8");

        return this.http.get(
            this.config.open311Url+"/requests/"+service_request_id+"?jurisdiction_id="+jurisdiction_id,
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            return data
        });
    }

    public putRequestImage(encodedImage,nameImage:string)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");
        headers.append("Content-Type", "application/octet-stream");

        return this.http.put(
            this.config.open311Url+"/images",
            {
                bucket_name : this.config.s3Bucket,
                object_name: nameImage,
                image: encodedImage

            },
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            return data
        });
    }

    public getRequestImage(imageName)
    {
        let headers : Headers = new Headers();
        headers.append("Content-Type","application/json");

        return this.http.get(
            this.config.open311Url+"/images?bucketName="+this.config.s3Bucket+"&objectName="+imageName,
            {headers : headers}
        )
        .map(response => response.json())
        .map(data => {
            return data.url;
        });
    }
}