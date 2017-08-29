import { Component, OnInit, ViewChild, ElementRef, Input, DoCheck } from '@angular/core';
import{ RouterExtensions, PageRoute } from 'nativescript-angular/router';
import "rxjs/add/operator/switchMap"

import { Report } from '../../shared/report/report.model';
import { GeoReportService } from '../../shared/geo-report/geo-report.service';
import { Utils } from '../../shared/utils/utils';
import { ReportCategoriesService } from '../../shared/report/report-categories.service';

import * as Toast from 'nativescript-toast';

import {Label} from "ui/label";
import {Color} from "color";
import {Page} from "ui/page";

declare var global : any

@Component({
    moduleId: module.id,
    selector: 'report-detail',
    templateUrl: 'report-detail.component.html',
    styleUrls:['report-detail-common.css'],
    providers: [GeoReportService, ReportCategoriesService]
})
export class ReportDetailComponent implements OnInit, DoCheck {

    @Input() report : Report;
    private actualReportID : string = "";
    private previousReportID : string = "";

    private utils : Utils;
    private formattedDate : string;
    public serviceName : string = "";
    public imageCategory : string = "";
    public isEmptyDescription : boolean = true;

    public image : any;
    public isVisibleImage = false;

    @ViewChild("categoryName") categoryName : ElementRef;

    constructor(private geoReportService : GeoReportService,
                private reportCategoriesService : ReportCategoriesService, private page: Page) { }

    ngOnInit() 
    {
        this.utils = new Utils();
        
    }

    ngDoCheck(){
        
        // Switch report's ID for showing its information
        this.previousReportID = this.actualReportID;
        this.actualReportID = this.report.ID;
     /*   
         console.info("visibility: "+this.visibility);
         console.info("actual: "+this.actualReportID);
         console.info("previous: "+this.previousReportID);*/
        // If user touch a marker on map, the information is setted
        if(this.actualReportID != this.previousReportID)
        {
            this.formattedDate = "";
            this.actualReportID = this.report.ID;
            // If the report's description is empty, it's setted invisible on html
            this.isEmptyDescription = this.report.description == "" ? true : false;
            // Change category name to the language setted on device
            this.setCategoryStyle();
            this.setDateTime();
            this.getReportImage();  
                  
        }
    }

    // 

    /**
     * Sets date time format : DayName MonthName DD YYYY - HH:MM
     * DD: Date with two digits
     * YYYY: Year with four digits
     * HH: Hour with two digits
     * MM: Minutes with two digits
     * 
     * 
     * @memberof ReportDetailComponent
     */
    setDateTime(){
        // Add a '0' when minutes are less than 10
        let minutes = this.report.requestedDateTime.getMinutes() >9 ? this.report.requestedDateTime.getMinutes() : +"0"+this.report.requestedDateTime.getMinutes();
        // Join date and time
        this.formattedDate = this.utils.getDayName(this.report.requestedDateTime.getDay())+" "+
                                        this.utils.getMonthName(this.report.requestedDateTime.getMonth())+" "+
                                        this.report.requestedDateTime.getDate()+", "+
                                        this.report.requestedDateTime.getFullYear() + " - "+
                                        this.report.requestedDateTime.getHours()+ ":"+minutes;
    }

    /**
     * Set category icon and category label color
     * 
     * 
     * @memberof ReportDetailComponent
     */
    setCategoryStyle(){

        let category = <Label>this.categoryName.nativeElement;
        // Initialize the label for updating label width
        category.initNativeView();
        // Sets the report category with the respective language
        this.serviceName = global.L(this.reportCategoriesService.getI18nTag(this.report.serviceName));

        // If category equals to Trash , icon and label are setted to white 
        if(this.report.serviceName == "Basura")
        {
            category.color = new Color("white");
            this.imageCategory = this.reportCategoriesService.getCategoryResource(this.report.serviceName)
            
        }
        // Icon and label are setted to the respective color category
        else
        {
            let color = this.reportCategoriesService.getImageColor(this.report.serviceName);
            category.color = new Color(color);
            this.imageCategory = this.reportCategoriesService.getCategoryResource(this.report.serviceName) + '_detail';
        }
    }

     /**
      * Gets report's image
      * 
      * 
      * @memberof ReportDetailComponent
      */
     getReportImage(){

        let imageName = this.report.ID+".jpg";
        this.geoReportService.getRequestImage(imageName)
            .subscribe(
                    (data) => {
                        this.image= data;
                        this.isVisibleImage = true;
                        
                        console.info(JSON.stringify(data,null,4));
                    },
                    (error) => {
                        this.isVisibleImage = false;

                        console.info(JSON.stringify(error,null,4));
                        if(error.status == 404){
                            Toast.makeText(global.L("no_image")).show();
                        }
                        else{
                            Toast.makeText(global.L("cant_load_image")).show();
                        }
                        
                    }
                )
    }
}