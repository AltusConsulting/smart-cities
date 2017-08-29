import { Component, OnInit, ChangeDetectorRef , ViewChild, ElementRef} from "@angular/core";
import {RouterExtensions} from "nativescript-angular/router";

import { MessagingService } from "../../shared/messaging/messaging.service";
import { GeoReportService } from "../../shared/geo-report/geo-report.service";
import { PlaceService } from "../../shared/place/place.service";
import { Report } from "../../shared/report/report.model";
import { Service } from "../../shared/service/service.model";
import { Config } from "../../shared/config";
import { device } from "platform";
import * as appSettings from "application-settings";
import { ReportCategoriesService } from "../../shared/report/report-categories.service";

import { CheckBox } from "nativescript-checkbox";
import {Page} from "ui/page";
import {Button} from "ui/button"
import {Color} from "color";
import dialogs = require("ui/dialogs");

import * as Toast from "nativescript-toast";
import * as platform from "platform";
import * as fs from "file-system";
import * as imageSourceModule from 'image-source';

import { takePicture, requestPermissions } from 'nativescript-camera';

let imagepicker = require("nativescript-imagepicker");

declare var global : any


/**
 * Report component class
 * 
 * @export
 * @class ReportComponent
 * @implements {OnInit}
 */
@Component({
    selector: "report",
    templateUrl: "./pages/report/report.component.html",
    styleUrls: ["./pages/report/report-common.css","./pages/report/report.css"],
    providers: [GeoReportService, PlaceService, ReportCategoriesService, MessagingService]
})

export class ReportComponent implements OnInit {

    public report:Report;
    public reportTypes : Array<string> =[];
    public services : Array<Service> = [];
    public typeIndex : number;
    public isVisibleImage = false;
    public items = [];
    public description : string;
    public image : any;
    public isSaving = false;
    public imageTaken = false;

    public config: Config;
    public category:string;
    public imageCategory:string;

    private button : Button;
    private disableColor = "";


    @ViewChild("checkbox") checkBox: ElementRef;
    @ViewChild("cameraImage") cameraImageCircle: ElementRef;
    @ViewChild("accept") accept: ElementRef;
    @ViewChild("border") border: ElementRef;

    /**
     * Creates an instance of ReportComponent.
     * @param {Page} page 
     * @param {ChangeDetectorRef} _changeDetectionRef 
     * @param {RouterExtensions} nav 
     * @param {GeoReportService} geoReportService 
     * @param {PlaceService} placeService 
     * @param {ReportCategoriesService} reportCategoriesService 
     * 
     * @memberof ReportComponent
     */
    constructor(private page: Page,private _changeDetectionRef: ChangeDetectorRef, private nav: RouterExtensions, 
                private geoReportService: GeoReportService, private placeService: PlaceService,
                private reportCategoriesService: ReportCategoriesService, private messagingService: MessagingService) {

    }

    ngOnInit(){
        this.report = global.newReport;
        this.category = global.L(this.reportCategoriesService.getI18nTag(this.report.serviceName));
        this.imageCategory = this.report.imageCategory+"_gray";
        this.image = null;
        this.description = "";
        this.config = new Config();
        this.getServices();
        this.setCategoryColors();

        this.button = this.accept.nativeElement;
        
        this.page.actionBarHidden = true;

        if(platform.isIOS){
            this.typeIndex = 0;
        }
        
    }
    

    /**
     * return to the home component and clears the navigation stack
     * 
     * 
     * @memberof ReportComponent
     */
    goHome(){
        this.nav.navigate([''], {clearHistory: true});
    }

    /**
     * return to the previous component in the navegation stack and clears the navegation stack
     * 
     * 
     * @memberof ReportComponent
     */
    goBack(){
        this.nav.navigate(['report-categories'], {clearHistory: true});
    }

    /**
     * Change the create button color and disables it to prevent multiple requests 
     * when creating a new report
     * @param {any} state boolean indicating the state of the create button. true: enable, false: disabled
     * 
     * @memberof ReportComponent
     */
    changeStateButton(state){

         if(state){
            this.button.backgroundColor = new Color(this.disableColor);
            this.button.borderColor = new Color(this.disableColor);
            this.button.isEnabled = true;
         }
         else{
            this.button.backgroundColor = new Color(this.disableColor);
            this.button.borderColor = new Color(this.disableColor);
            this.button.isEnabled = false;
         }  
     }

    
    /**
     * Changes camera, border, and accept button colors depending on the report category
     * 
     * 
     * @memberof ReportComponent
     */
    setCategoryColors(){
        let categoryColor = this.reportCategoriesService.getImageColor(this.report.serviceName);
        this.accept.nativeElement.backgroundColor = new Color(categoryColor);
        this.accept.nativeElement.borderColor = new Color(categoryColor);

        this.cameraImageCircle.nativeElement.backgroundColor = new Color(categoryColor);
        this.cameraImageCircle.nativeElement.borderColor = new Color(categoryColor);

        this.border.nativeElement.backgroundColor = new Color(categoryColor);
        this.border.nativeElement.borderColor = new Color(categoryColor);

        this.disableColor = this.reportCategoriesService.getDisableColor(this.report.serviceName);

    }

    
    /**
     * Sets if the username is anonymous or not
     * 
     * 
     * @memberof ReportComponent
     */
    setUsername(){
        let checkbox = <CheckBox> this.checkBox.nativeElement;
        if(checkbox.checked || appSettings.getBoolean(this.config.ANONYMOUS_LOGIN_KEY,false)){
            this.report.accountID=global.L("anonymous");
        }
        else if(appSettings.getBoolean(this.config.ANONYMOUS_LOGIN_KEY,false) == false){
            this.report.accountID=global.L("anonymous");
        }
        else{
            this.report.email = this.config.user.Email;
            this.report.accountID = this.config.user.Username;
        }
        
    }

    
    /**
     * Gets and sets the report categories
     * 
     * 
     * @memberof ReportComponent
     */
    getServices(){
        this.reportTypes = [];
        this.geoReportService.getServiceList()
                .subscribe( (serviceList) => {
                    this.services = serviceList;
                    serviceList.forEach( service =>{
                        this.reportTypes.push(service.serviceName);
                    })
                    this.typeIndex = this.reportTypes.indexOf(this.report.serviceName);
                    console.info("servicios cargados");
                },       
                (error) => {
                    Toast.makeText(error).show();
                });
    }

    
    /**
     * Load image taking it with the device camera
     * 
     * 
     * @memberof ReportComponent
     */
    onTakePicture() {

        requestPermissions();
        takePicture({width: 180, height: 180, keepAspectRatio: false, saveToGallery: true}).then((imageAsset) => {
            console.info("File Uri: "+imageAsset.android);
            this.image = imageAsset.android;
            
            this.isVisibleImage = true;
            this.imageTaken = true;
            
        });
    }

    /**
     * sets the options to open the gallery on single mode to select a single image
     * 
     * 
     * @memberof ReportComponent
     */
    onSelectSingleTap() {
        requestPermissions();
        let context = imagepicker.create({
            mode: "single"
        });
        this.startSelection(context);
    }

    
    /**
     * open the device gallery to select an image
     * 
     * @param {any} context 
     * 
     * @memberof ReportComponent
     */
    startSelection(context) {
        context
            .authorize()
            .then(() => {
                this.items = [];
                return context.present();
            })
            .then((selection) => {
                selection.forEach((selected) => {
                    console.info("FileUri: " + selected.fileUri);
                    this.image = selected.fileUri;
                });
                this.items = selection;
                this._changeDetectionRef.detectChanges();

                this.isVisibleImage = true;
                this.imageTaken = true;

            }).catch(function (e) {
                console.log(e);
            });
    }

    /**
     * attempts to save the report image
     * 
     * @param {any} imageID 
     * 
     * @memberof ReportComponent
     */
    savePicture(imageID){
        //create a folder in the device system file to save the image
        this.isSaving = true;
        console.info("image path: "+this.image);
        let image2 = imageSourceModule.fromFileOrResource(this.image);
        let folder = fs.knownFolders.documents();
        let path = fs.path.join(folder.path, imageID+".jpg");
        let saved = image2.saveToFile(path, "jpg");
        console.info("Saved? "+saved);
        let data = image2.toBase64String("jpg");

        //send the image to the backend to be saved
        this.geoReportService.putRequestImage(data, imageID+".jpg")
            .subscribe(
                (data) => {
                    this.nav.navigate(['/improve-city'],{clearHistory: true});

                     alert({
                        title: "",
                        message: global.L("report_created"),
                        okButtonText: "Ok"
                    })

                    global.location = this.report.location;
                    global.created = true;

                    this.isSaving = false;
                    this.changeStateButton(true);

                    this.messagingService.pushNotification(false, this.report.ID, "/improve-city","normal",global.L('report_body'), global.L('report_body'), "reports")
                    .subscribe(
                        (data) => {
                            console.info(JSON.stringify(data));
                        },
                        (error) => {
                            console.info("response error "+JSON.stringify(error,null,4));
                        }
                    )
                    
                    //Clears folder where is saved the image
                    folder.clear()
                        .then(() =>{
                            console.info("Folder cleared");
                        }, (error) => {
                            console.info(JSON.stringify(error,null,4));
                        });
                },
                (error) => {

                    alert({
                        title: "",
                        message: global.L("report_created_no_image"),
                        okButtonText: "Ok"
                    })
                    this.nav.navigate(['/improve-city'],{clearHistory: true});

                    global.location = this.report.location;
                    global.created = true;

                    this.isSaving = false;
                    this.changeStateButton(true);
                    
                    //Clears folder where is saved the image
                    folder.clear()
                        .then(() =>{
                            console.info("Folder cleared");
                        }, (error) => {
                            console.info(JSON.stringify(error,null,4));
                        });
                    console.info("failed "+error);
                }
            );

            
        }
    
    /**
     * shows dialog with the options to take a photo with the device camera
     * or select one from the device gallery 
     * 
     * @memberof ReportComponent
     */
    uploadImage(){
        let options = {
            cancelButtonText: global.L("cancel"),
            actions: [global.L("take_photo"), global.L("see_gallery")]
        };
        dialogs.action(options).then((result) => {
            if(result==global.L("take_photo")){
                this.onTakePicture();
            }
            else if(result==global.L("see_gallery")){
                this.onSelectSingleTap();
            }
        });
    }

    /**
     * create a new report
     * 
     * 
     * @memberof ReportComponent
     */
    public createReport()
    {
        console.info("creating..");
        this.changeStateButton(false);
        this.setUsername();
        this.isSaving = true;
        this.report.serviceCode = this.services[this.typeIndex].ID;
        this.report.firstName = "";
        this.report.lastName = "";
        this.report.deviceID = device.uuid; // install plugin for iOS nativescript-ios-uuid
        this.report.description = this.description;
        this.report.mediaURL = "";
        this.report.requestedDateTime = new Date(Date.now());

        
        console.info("service name - report: "+this.report.serviceName)
        // Gets address name
        this.placeService.getPlaceName(this.report.location.lat+","+this.report.location.lon)
            .subscribe( address => {
                    if(address == undefined){
                        this.report.addressString = "";
                    }
                    else{
                        this.report.addressString = address;
                    }
                    this.saveReport();
                },       
                (error) => {
                    // Creates the report without address name
                    this.saveReport();
                    console.info(JSON.stringify(error));
                });
                
        
    }

    
    /**
     * Calls post service for saving the report
     * 
     * 
     * @memberof ReportComponent
     */
    private saveReport(){
        this.geoReportService.postServiceRequest(this.report)
            .subscribe( (res) => {
                let location = res.headers.get("Location").split("/");
                this.report.ID = location[location.length-1]

                // Save the picture if it is taken
                if(this.imageTaken){
                    this.savePicture(this.report.ID);}

                //If no image, just create the report
                else{
                    this.nav.navigate(['/improve-city'],{clearHistory: true});
                    alert({
                        title: "",
                        message: global.L("report_created"),
                        okButtonText: "Ok"
                    })
                    this.messagingService.pushNotification(false, this.report.ID, "/improve-city","normal",global.L('report_body'), global.L('report_body'), "reports")
                    .subscribe(
                        (data) => {
                            console.info(JSON.stringify(data));
                        },
                        (error) => {
                            console.info("response error "+JSON.stringify(error,null,4));
                        }
                    )

                    global.location = this.report.location;
                    global.created = true;

                    this.isSaving = false;
                    this.changeStateButton(true);
                }
                
            },       
            (error) => {
                Toast.makeText(error).show();
                this.isSaving = false;
                this.changeStateButton(true);
            });    
    }
 }