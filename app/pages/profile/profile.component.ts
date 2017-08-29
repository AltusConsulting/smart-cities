import { Component, OnInit,ViewContainerRef, ChangeDetectorRef,ViewChild , ElementRef, DoCheck} from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import * as appSettings from "application-settings";
import { Config } from "../../shared/config";
import { LoginService } from "../../shared/login/login.service";
import { GeoReportService } from "../../shared/geo-report/geo-report.service";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { PasswordChangeComponent } from "../../components/password-change/password-change.component";
import{TextField} from "ui/text-field";
import{Label} from "ui/label";
import{Color} from "color";
import dialogs = require("ui/dialogs");
import * as Toast from "nativescript-toast";
import { takePicture, requestPermissions } from 'nativescript-camera';
import * as imageSourceModule from 'image-source';
import * as camera from "nativescript-camera";
import {WebImage} from "nativescript-web-image-cache";
import {Image} from "ui/image";
var validator = require("email-validator");
let imagepicker = require("nativescript-imagepicker");
import * as fs from "file-system";
declare var global : any
/**
 * Profile component class
 * 
 * @export
 * @class ProfileComponent
 * @implements {OnInit}
 * @implements {DoCheck}
 */
@Component({
    moduleId: module.id,
    selector: 'profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile-common.css','profile.css'],
    providers: [LoginService, GeoReportService]
    
})
export class ProfileComponent implements OnInit , DoCheck{
    public username: string;
    public email: string;
    private password: string;
    public config: Config;
    public isVisibleImage = false;
    public items = [];
    public image : any;
    public isLoading = false;
    public loading : boolean;
    public loadingPage = false;
    public loadingImage = false;
    public isSaving =false;
    public data ="";
    public imageTaken = false;
    private button : Label;
    /**
     * Creates an instance of ProfileComponent.
     * @param {LoginService} loginService 
     * @param {ModalDialogService} modalService 
     * @param {ChangeDetectorRef} _changeDetectionRef 
     * @param {ViewContainerRef} viewContainerRef 
     * @param {RouterExtensions} nav 
     * @param {GeoReportService} geoReportService 
     * 
     * @memberof ProfileComponent
     */
    constructor(private loginService: LoginService,private modalService: ModalDialogService,private _changeDetectionRef: ChangeDetectorRef, private viewContainerRef: ViewContainerRef,private nav : RouterExtensions,
    private geoReportService: GeoReportService) { }
    @ViewChild("imageReport") imageView: ElementRef;
    @ViewChild("save") accept: ElementRef;
    @ViewChild("container") container : any;
    ngOnInit() {
        this.config = new Config(); 
        
        this.username = this.config.user.Username;
        
        this.email = this.config.user.Email;
        this.password = appSettings.getString(this.config.USER_PASSWORD_KEY,"");
        this.loading = false;
        this.button = this.accept.nativeElement;
        console.info(this.config.user.Username+","+this.config.user.Email)
        
        this.getImageProfile();
        
    }
     ngDoCheck(){
         let x = <Image>this.container.nativeElement;
        // this.isLoading = this.container.nativeElement.isLoading;
         console.info("Loading: "+x.isLoading)
         if(x.isLoading){
             this.isLoading = true;
         }
         else{
             this.isLoading = false;
         }
     }
     /**
      * Change the save button color and disable it to prevent multiple request
      * when attempting to update the user data
      * @param {any} state 
      * 
      * @memberof ProfileComponent
      */
     changeStateButton(state){
         if(state){
            this.button.opacity = 1;
            this.button.isEnabled = true;
         }
         else{
            this.button.opacity = 0.5;
            this.button.isEnabled = false;
         }  
     }
     
    /**
     * retrieve the profile image
     * 
     * 
     * @memberof ProfileComponent
     */
    getImageProfile(){
        this.loadingImage = true;
        let imageName = this.config.user.Username+"-profile.jpg";
        this.geoReportService.getRequestImage(imageName)
            .subscribe(
                    (data) => {
                        this.image= data;
                        this.isVisibleImage = true;
                    },
                    (error) => {
                        this.isVisibleImage = false;
                        this.loadingImage = false;
                        if(error.status == 404){
                            Toast.makeText(global.L("no_user_profile")).show();
                        }
                        else{
                            Toast.makeText(global.L("cant_load_image")).show();
                        }
                    }
                )
    }
    /**
     * opens a dialog to change the user password
     * 
     * 
     * @memberof ProfileComponent
     */
    change(){
        let options : ModalDialogOptions = {
        viewContainerRef: this.viewContainerRef,
        context: {actualPassword: this.password},
        fullscreen: false,
    };
    this.modalService.showModal(PasswordChangeComponent, options)
        .then((dialogResult => {
            if(dialogResult != ""){
                this.password = dialogResult;
            }
        }));
    }
    /**
     * Check if any changes were made to the user information
     * 
     * 
     * @memberof ProfileComponent
     */
    verifyChanges(){
        console.info(this.config.user.Username+","+this.config.user.Email);
        console.info(this.username+","+this.email);
        
        //check if any changes were made
        if(!this.imageTaken && this.username == this.config.user.Username && this.email == this.config.user.Email){
            Toast.makeText(global.L("no_changes_detected")).show();
        }
        else{
            this.loading = true;
            //check if the user information textfields aren't empty
            if(this.username != this.config.user.Username || this.email != this.config.user.Email)
            {    
                //if email has the right format updates user information
                if(validator.validate(this.email) && this.button.isEnabled)
                {
                    this.changeStateButton(false);
                    this.updateUserInformation();
                }
                else{
                    Toast.makeText(global.L("valid_email")).show();
                }   
            }
            else if(this.imageTaken && this.button.isEnabled)
            {
                //updates user profile image
                this.changeStateButton(false);
                this.savePicture(this.username);
            }
        }
    }
    
    /**
     * attempts to update the user information
     * 
     * 
     * @memberof ProfileComponent
     */
    updateUserInformation(){
        
        this.loginService.updateUser(this.username,this.password,this.email)
            .subscribe(
                (data) => {
                    this.config.user.Username = this.username;
                    this.config.user.Email = this.email;
                    // Save the picture if it is taken
                    if(this.imageTaken)
                    {
                        this.savePicture(this.username);
                    }
                    //If no image, just update user's information
                    else{
                        Toast.makeText(global.L("info_updated")).show();
                        this.changeStateButton(true);
                        this.loading = false;
                    }
                    
                },
                (error) => {
                    if(error.status === 204)
                    {
                        this.config.user.Username = this.username;
                        this.config.user.Email = this.email;
                        
                        // Save the picture if it is taken
                        if(this.imageTaken)
                        {
                            this.savePicture(this.username);
                        }
                        //If no image, just update user's information
                        else{
                            Toast.makeText(global.L("info_updated")).show();
                            this.changeStateButton(true);
                            this.loading = false;
                        }
                    }
                    else
                    {
                        Toast.makeText(global.L("update_user_error")).show();
                        this.changeStateButton(true);
                    }
                }
            )
    }
    /**
     * attempts to save the user profile image
     * 
     * @param {any} imageID the user profile image id
     * 
     * @memberof ProfileComponent
     */
    savePicture(imageID){
        //create a folder in the device's file system to save the image
        console.info("image path: "+this.image);
        let image2 = imageSourceModule.fromFileOrResource(this.image);
        let folder = fs.knownFolders.documents();
        let path = fs.path.join(folder.path, imageID+".jpg");
        let saved = image2.saveToFile(path, "jpg");
        console.info("Saved? "+saved);
        let data = image2.toBase64String("jpg");
        console.info(imageID);
        //send the image to the backend for storage
        this.geoReportService.putRequestImage(data, imageID+"-profile.jpg")
            .subscribe(
                (data) => {
                    Toast.makeText(global.L("info_updated")).show();
                    this.imageTaken = false;
                    this.loading = false;
                    this.changeStateButton(true);
                    
                    //Clears folder where the image is saved
                    folder.clear()
                        .then(() =>{
                            console.info("Folder cleared");
                        }, (error) => {
                            console.info(JSON.stringify(error,null,4));
                        });
                },
                (error) => {// 504 timeout
                    Toast.makeText(global.L("image_error")).show();
                    this.loading = false;
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
     * opens the device's camera to take a photo
     * 
     * 
     * @memberof ProfileComponent
     */
    onTakePicture() {
        //request the permissions to use the camera
        requestPermissions();
        takePicture({width: 180, height: 180, keepAspectRatio: false, saveToGallery: true}).then((imageAsset) => {
            console.info("File Uri: "+imageAsset.android);
            this.image = imageAsset.android;
            
            this.isVisibleImage = true;
            this.imageTaken = true;
            
        });
    }
    /**
     * sets the mode to select a single image from the device gallery
     * 
     * 
     * @memberof ProfileComponent
     */
    onSelectSingleTap() {
        requestPermissions();
        let context = imagepicker.create({
            mode: "single"
        });
        this.startSelection(context);
    }
    /**
     * opens the device gallery to select an image
     * 
     * @param {any} context 
     * 
     * @memberof ProfileComponent
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
     * opens a dialog with the options for taking an image for the user profile
     * 
     * 
     * @memberof ProfileComponent
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
     * returns to the previous component in the navigation stack
     * 
     * 
     * @memberof ProfileComponent
     */
    goBack(){
        this.nav.backToPreviousPage();
    }
}