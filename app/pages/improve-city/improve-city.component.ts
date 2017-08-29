// /app/map-example.componmpent.ts
import { Component, ElementRef, ViewChild, DoCheck, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterExtensions, PageRoute } from 'nativescript-angular/router';
import { registerElement } from "nativescript-angular/element-registry";
// Important - must register MapView plugin in order to use in Angular templates


import { MapView, Marker, Position } from "nativescript-google-maps-sdk";
import { Accuracy } from "ui/enums";

import { Place } from "../../shared/place/place.model";
import { PlaceService } from "../../shared/place/place.service";
import { Report } from "../../shared/report/report.model";
import { GeoReportService } from "../../shared/geo-report/geo-report.service";
import { ReportCategoriesService } from "../../shared/report/report-categories.service";
import { Utils } from "../../shared/utils/utils";
import { Config } from "../../shared/config";
import { User } from "../../shared/user/user.model";
import { LoginService } from "../../shared/login/login.service";


import { TextField } from "ui/text-field"
import { Image } from "ui/image";
import {Page} from "ui/page";

import * as imageSourceModule from 'image-source';
import * as geolocation from "nativescript-geolocation";
import * as Toast from "nativescript-toast";
import * as appSettings from "application-settings";
import application = require('application');
import { android, AndroidApplication, AndroidActivityBundleEventData, AndroidActivityEventData } from "application";
import { JwtHelper } from 'angular2-jwt';

declare var global : any

global.newReport;
global.created = false;

/**
 * Improve city component class
 * 
 * @export
 * @class ImproveCityComponent
 * @implements {OnInit}
 * @implements {DoCheck}
 */
@Component({
    selector: "improve-city",
    templateUrl: "./pages/improve-city/improve-city.component.html",
    styleUrls:[ "./pages/improve-city/improve-city-common.css","./pages/improve-city/improve-city.css"],
    providers: [PlaceService, GeoReportService, ReportCategoriesService, LoginService]
})

export class ImproveCityComponent implements OnInit, DoCheck , AfterViewInit, OnDestroy{
    
    public zoom:number;
    public latitude = 0;
    public longitude = 0;
    private currentLat = 0;
    private currentLong = 0;
    private markerList : Map<Marker,Report>;
    private reportList : Map<string,Report>;
    public areMarkersVisible= false;
    public loading : boolean = false;
    
    public placesSearch: Array<Place>=[];
    public selectedPlaceObject : Place;
    public isSearching = false;
    public isVisiblePin = false;
    public selectedPlace = false;
    public placeListLoaded = false;
    public isChangedOriginalPlace = false;
    public place:string = "";
    public oldPlace:string="";
    public lenghtSelectedTag = 0;
    
    public isCleared = true;

    private utils : Utils;
    public selectedReport : Report = new Report();
    public isSelectedReport = false;

    private ID :string;
   
    public config : Config;
    jwtHelper: JwtHelper;
    public isAnonymous : boolean;
   
    @ViewChild("MapView") mapView: ElementRef;
    @ViewChild("search") search: ElementRef;
    @ViewChild("searchBar") searchBar: ElementRef;
    @ViewChild("detail") detail: ElementRef;
    @ViewChild("map") map: ElementRef;
    @ViewChild("confirm") confirm: ElementRef;
    

    /**
     * Creates an instance of ImproveCityComponent.
     * @param {PlaceService} placeService 
     * @param {RouterExtensions} nav 
     * @param {GeoReportService} geoReportService 
     * @param {ReportCategoriesService} reportCategoriesService 
     * 
     * @memberof ImproveCityComponent
     */
    constructor(private placeService:PlaceService, private nav : RouterExtensions, private geoReportService : GeoReportService, 
                private reportCategoriesService: ReportCategoriesService, private pageRoute : PageRoute, private page: Page,
                private loginService: LoginService){
    }
    ngOnInit()
    {
        this.utils = new Utils();
        this.markerList = new Map<Marker,Report>();
        this.reportList = new Map<string,Report>();

        this.config = new Config();
        this.config.user = new User();
        this.jwtHelper  = new JwtHelper();
        this.isAnonymous = appSettings.getBoolean(this.config.ANONYMOUS_LOGIN_KEY,false);
        
        if(this.isAnonymous == false){
            this.setUserData();
        } 

        let detailReport = <TextField>this.detail.nativeElement;
        detailReport.translateY = -500; 

        this.pageRoute.activatedRoute
            .switchMap(activatedRoute => activatedRoute.params)
            .forEach((params) => {
                this.ID = params["id"];
            });
    }

    /**
     * logs out the current user
     * 
     * @memberof ImproveCityComponent
     */
    logout(){
        //remove all tokens of the user from the application settings
        appSettings.setBoolean(this.config.ANONYMOUS_LOGIN_KEY, false);
        appSettings.remove(this.config.EMAIL_TOKEN_KEY);
        appSettings.remove(this.config.FACEBOOK_TOKEN_KEY);
        appSettings.remove(this.config.USER_ID_KEY);
        appSettings.remove(this.config.USER_PASSWORD_KEY);

        //return to login page
        this.nav.navigate(['/login'],{clearHistory : true});
    }

    /**
     * set the user data in the application settings
     * 
     * 
     * @memberof ImproveCityComponent
     */
    public setUserData(){
        
        let token = appSettings.getString(this.config.EMAIL_TOKEN_KEY,"");
        // Set id user
        if(token!=""){
            let userData = this.jwtHelper.decodeToken(token);
            console.info(JSON.stringify(userData,null,4));
            appSettings.setString(this.config.USER_ID_KEY,userData.username);
            this.config.user.Username = userData.username;
            this.config.user.Email = userData.email;
        }
    }

    ngDoCheck(){
       
        this.checkPlaceTextfield();
        this.checkZoom();

            
    }

    ngAfterViewInit()
    {
        if(application.android)
        {
            application.android.on(application.AndroidApplication.activityBackPressedEvent,this.backEvent.bind(this));
        }
        
    }
    
    ngOnDestroy()
    {
        if(application.android)
        {
            application.android.off(application.AndroidApplication.activityBackPressedEvent,this.backEvent.bind(this));
        }
    }

    /**
     * checks if report detail page is visible and close if the user press back button on device
     * 
     * 
     * @memberof ImproveCityComponent
     */
    backEvent(args){
        if(this.isSelectedReport){
            args.cancel = true;
            this.showHideDetail(-500, false);
            return;
        }
    }

    /**
     * checks if the zoom level is appropiate to show the markers on the map
     * 
     * 
     * @memberof ImproveCityComponent
     */
    checkZoom(){
        if(this.zoom >=5 && this.areMarkersVisible == false){
            this.setMarkersVisibility(true);
        }
        else if(this.zoom <5 && this.areMarkersVisible){
            this.setMarkersVisibility(false);
        }
    }

    /**
     * Searches for a place in the google maps api
     * 
     * 
     * @memberof ImproveCityComponent
     */
    public checkPlaceTextfield(){
            //check if the search term is different than the previous search
            if(this.place != this.oldPlace){
                if(this.place.length >0){
                    // Makes the request when input size is equal/greater than 3
                    if(this.selectedPlace==false){ // This attribute tells if the user has selected some outbound
                            this.getPlaces();
                            this.isChangedOriginalPlace = true;
                            
                            this.getPlacesList(false);
                    }
                    else{
                        // When the user input something diferent to the selected item, the search is made again
                        if(this.place.length != this.lenghtSelectedTag){
                            this.selectedPlace=false;
                        }
                    }
                }
                else {
                    //Hide the listView when the user delete input
                    if(this.place.length==0 && this.oldPlace.length==1){
                        //this.isVisiblePlaces=false;
                        this.isSearching=false
                        this.placeListLoaded=false;
                    }
                    this.selectedPlace=false;
                }  
                this.oldPlace = this.place; 
            }
    }

     /**
      * makes the list of the google maps api search result visible or invisble
      * 
      * @param {boolean} pressed 
      * 
      * @memberof ImproveCityComponent
      */
     public getPlacesList(pressed:boolean){
        // This condition makes listView don't dissappear when user is typing
        if(pressed==false && this.isSearching){
            this.isSearching = !this.isSearching;
        }
        this.isSearching = !this.isSearching;
     }

    /**
     * when the google map is ready all the markers are loaded to the map
     * 
     * 
     * @memberof ImproveCityComponent
     */
    onMapReady = (event) => {
        this.loading = true;
        // request for the markers in the map
        this.geoReportService.getServiceRequests()
            .subscribe(
                (data : Report[]) => {
                    
                    this.loading = false;
                    console.info("Cantidad de reportes: "+data.length);
                    let map = <MapView>this.mapView.nativeElement;

                    data.forEach(report =>{
                        let newMarker = new Marker();
                        let imageMarker = this.reportCategoriesService.getCategoryResource(report.serviceName)+"_icon";
                        // Set marker color depending on the report type
                        if(imageMarker != undefined){
                            let icon = new Image();
                            icon.imageSource = imageSourceModule.fromFileOrResource(imageMarker);
                            newMarker.icon = icon;
                        }
                        //add markers to map
                        newMarker.position = Position.positionFromLatLng(report.location.lat, report.location.lon);
                        newMarker.userData = report;
                        newMarker.visible = false
                        map.addMarker(newMarker);
                        this.markerList.set(newMarker, report);
                        this.reportList.set(report.ID, report);
                    });
                     this.changeVisibility();
                },
                (error) => {
                    console.info(error);
                    this.loading = false;
                }
            );
        
        
        //on a new report created the map centers the location on the new report
        if(global.created){
            global.created = false;
            this.zoom = 15;
            this.latitude = global.newReport.location.lat;
            this.longitude = global.newReport.location.lon;
        }
         // When there is a report notification, its details are shown to user, and the map is centered on report coordinates
        else if(this.ID){
            this.viewReportNotification();
        }
        // When there's no event, it's setted the user's current location
        else{
            this.getCurrentLocation();
        }
        
    };

    viewReportNotification(){
        this.loading = true;
        this.geoReportService.getServiceRequest(this.ID)
            .subscribe(
                (data) => {
                    this.selectedReport.copyInfo(data);
                    this.selectedReport.ID = this.ID;
                    this.zoom = 15;
                    this.latitude = this.selectedReport.location.lat;
                    this.longitude = this.selectedReport.location.lon;
                    this.showHideDetail(0,true);

                    this.loading = false;
                },
                (error) => {
                    console.info("error: "+error);
                    
                    if(error.status == 404){
                        alert({
                            title: "",
                            message: global.L('not_found_report'),
                            okButtonText: "Ok"
                        });
                    }
                    else{
                        Toast.makeText(error).show();
                    }
                    this.ID=undefined;
                    this.loading = false;
                    this.getCurrentLocation();
                }
            );
        
    }

    /**
     * If report detail is visible, it's hidden when user taps any coordinate on map excepting markers
     * 
     * @param {any} args 
     * 
     * @memberof ImproveCityComponent
     */
    onCoordinateTapped(args){
       
       if(this.isSelectedReport){
            this.showHideDetail(-500, false);
       }
    }
    
    /**
     * Shows and hides the reports' detail with slide animation
     * 
     * @param {number} translateY 
     * @param {boolean} isSelectedReport 
     * 
     * @memberof ImproveCityComponent
     */
    showHideDetail(translateY: number, isSelectedReport:boolean){
        let confirmButton = this.confirm.nativeElement;
        let detailReport =  this.detail.nativeElement;
        let search = this.searchBar.nativeElement;

        detailReport.animate({
            translate: { x: 0, y: translateY},    
            duration: 250
        })
        //Hides the confirm button, search bar and action bar when report detail is visible
        confirmButton.visibility = isSelectedReport ? 'collapse' : 'visible';
        search.visibility = isSelectedReport ? 'collapse' : 'visible';  
        this.page.actionBar.visibility = isSelectedReport ? 'collapse' : 'visible';

        this.isSelectedReport = isSelectedReport;
    }

/**
 * set the markers visibility when the map camera is changed
 * 
 * @param {any} args 
 * 
 * @memberof ImproveCityComponent
 */
onCameraChanged(args){
    //get current latitude and longitude
    
    let map = <MapView>this.mapView.nativeElement;

    this.latitude = args.camera.latitude;
    this.longitude = args.camera.longitude;
    this.zoom = args.camera.zoom;
    
    this.changeVisibility();
}


/**
 *  //change the visibility of the current markers in view
 * 
 * 
 * @memberof ImproveCityComponent
 */
changeVisibility(){
    
    let revealMarkerList : Marker[] = [];
    this.markerList.forEach((value: Report, key: Marker) => {
        if(key.position.latitude !== this.currentLat && key.position.longitude !== this.currentLong)
        {
            //obtains the distance between the markers and the central point of the map 
            let distance = this.utils.getDistanceFromCoordinates(this.latitude,this.longitude,key.position.latitude,key.position.longitude);
            if(10 >= distance)
            {
                revealMarkerList.push(key);
            }
            else
            {
                key.visible = false;
            }
        }
    });
    revealMarkerList.forEach(marker =>{
        marker.visible = true;
        this.markerList.delete(marker);
        this.markerList.set(marker,marker.userData);
    });
}

/**
 * Change the markers visibility
 * 
 * @param {boolean} visibility set to true to enable visibility and false to hide the markers
 * 
 * @memberof ImproveCityComponent
 */
setMarkersVisibility(visibility: boolean){
        let map = <MapView> this.mapView.nativeElement;
        
        this.markerList.forEach((value: Report, key: Marker) => {
            
            let markerFound = map.findMarker(mapMarker => {
                    return (mapMarker.position.latitude === key.position.latitude && mapMarker.position.longitude === key.position.longitude);
                });
            markerFound.visible = visibility;
        });

        this.areMarkersVisible = visibility;
}

/**
 * Catches the event of the google maps marker info window tap
 * Navigates to the tapped report detail
 * @param {any} args 
 * 
 * @memberof ImproveCityComponent
 */

onMarkerEvent(args) {
    this.selectedReport = args.marker.userData;
    this.showHideDetail(0, true);
}

/**
 * clear the search text
 * 
 * 
 * @memberof ImproveCityComponent
 */
clearText(){
    this.place = "";
    this.isSearching = false;
}

/**
 * selects a search result and centers the map on said point
 * 
 * @param {string} name full name of the searched place
 * @param {number} index index number in the list of result
 * 
 * @memberof ImproveCityComponent
 */
onItemTap(name: string, index:number){
    this.place = name;
    this.isSearching = false;
    this.selectedPlace = true;
    this.lenghtSelectedTag = this.place.length;
    this.selectedPlaceObject = this.placesSearch[index];

    this.getPlaceCoodenates(this.selectedPlaceObject.id, this.selectedPlaceObject.isCountry);

    //Hide keyboard
    let searchTF = <TextField>this.search.nativeElement;
    searchTF.dismissSoftInput();
}

/**
 * request the information of the searched place with the google maps api
 * 
 * 
 * @memberof ImproveCityComponent
 */
getPlaces(){
    
    let placeName = this.place.replace(" ","+");
    this.isSearching = true;
    this.placeService.getPlaces(placeName)
                .subscribe((placeObject) => {
                    this.placesSearch = placeObject;
                },       
                (error) => {
                    Toast.makeText(error).show();
                });
}


/**
 * create a new report
 * 
 * 
 * @memberof ImproveCityComponent
 */
setPin(){
        
    //create the marker with the current location
    this.isVisiblePin = false;
    global.newReport = new Report();
    global.newReport.location.lat = this.latitude;
    global.newReport.location.lon = this.longitude;

    //navigate to the report categories component
    this.nav.navigate(['/report-categories']);
    
}

/**
 * Get the coordinates of a location by its id provided by the google maps api
 * 
 * @param {string} id location id
 * @param {boolean} isCountry set to true if the location is a country, false otherwise
 * 
 * @memberof ImproveCityComponent
 */
getPlaceCoodenates(id:string, isCountry: boolean){
    
    this.placeService.getDetails(id)
        .subscribe((locationObject) => {
                this.latitude = locationObject[0];
                this.longitude = locationObject[1];
                this.zoom = isCountry ? 7 : 16;
        },       
        (error) => {
            Toast.makeText(error).show();
        });
}

    /**
     * obtain the device's current location with the GPS
     * 
     * 
     * @memberof ImproveCityComponent
     */
    getCurrentLocation(){
        let map = <MapView>this.mapView.nativeElement;
        

        var location = geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, updateDistance: 0.1, timeout: 5000 }).
        then( (loc) =>{
            if (loc) {
                this.zoom = 15;
                this.latitude = loc.latitude;
                this.longitude = loc.longitude;
                this.currentLat = loc.latitude;
                this.currentLong = loc.longitude;
               
            }
        }, (e) => {
            console.info("Error: " + e.message);
            Toast.makeText(global.L("gps_disabled")).show();
           
        });
            
            
        
    }

    /**
     * return to the home component and clear the navigation stack
     * 
     * 
     * @memberof ImproveCityComponent
     */
    goBack(){
        if(this.isSearching){
            this.isSearching = false;
            this.place = "";
        }
        else{
            this.nav.navigate([''], {clearHistory : true});
        }
        
    }
}