import { Component, ChangeDetectorRef, OnInit, ViewChild, ElementRef, ViewContainerRef, DoCheck } from '@angular/core';
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import dialogs = require("ui/dialogs");
import {Page} from "ui/page";
import { Color } from "color";
import { TextField } from "ui/text-field";
import { Button } from "ui/button";
import { RouterExtensions } from "nativescript-angular/router"

import { User } from '../../shared/user/user.model';
import { SignUpService } from '../../shared/sign-up/sign-up.service';
import { GeoReportService } from '../../shared/geo-report/geo-report.service';

import { takePicture, requestPermissions } from 'nativescript-camera';
import * as imageSourceModule from 'image-source';
import * as camera from "nativescript-camera";
import * as Toast from "nativescript-toast";
import * as fs from "file-system";

let imagepicker = require("nativescript-imagepicker");
let validator = require("email-validator");

declare var global : any

/**
 * Sign up component class
 * 
 * @export
 * @class SignUpComponent
 * @implements {OnInit}
 */
@Component({
    moduleId: module.id,
    selector: 'sign-up',
    templateUrl: 'sign-up.component.html',
    styleUrls: ['sign-up-common.css','sign-up.css'],
    providers: [SignUpService,GeoReportService]
})

export class SignUpComponent implements OnInit {

    public user : User;
    public repeatPassword : string;

    public saveToGallery = false;
    public isVisibleImage = false;
    public isSaving = false;
    public imageTaken = false;
    public items = [];
    public image ="";

    private button : Button;

    @ViewChild("imageReport") imageView: ElementRef;
    @ViewChild("username") username: ElementRef;
    @ViewChild("email") email: ElementRef;
    @ViewChild("password") password: ElementRef;
    @ViewChild("repeat") repeat: ElementRef;
    @ViewChild("register") register: ElementRef;

    /**
     * Creates an instance of SignUpComponent.
     * @param {Page} page 
     * @param {ModalDialogService} modalService 
     * @param {ChangeDetectorRef} _changeDetectionRef 
     * @param {SignUpService} signUpService 
     * @param {RouterExtensions} nav 
     * @param {GeoReportService} geoReportService 
     * 
     * @memberof SignUpComponent
     */
    constructor(private page: Page,private modalService: ModalDialogService, private _changeDetectionRef: ChangeDetectorRef,
                private signUpService : SignUpService, private nav : RouterExtensions, private geoReportService: GeoReportService) { }

    ngOnInit() 
    {
        this.user =  new User();
        this.user.FirstName = "na";
        this.user.LastName = "na";
        this.repeatPassword = "";
        this.page.actionBarHidden = true;

        this.button = this.register.nativeElement;
        
    }

     /**
      * change the sign up button color and disables it to prevent multiple requests
      * when attempting to create a new user
      * @param {any} state boolean indicating the state of the sign up button. true: enable, false: disabled
      * 
      * @memberof SignUpComponent
      */
     changeStateButton(state){
        //change button color and setts its state to enable/disabled
         if(state){
            this.button.backgroundColor = new Color("#0B4486");
            this.button.borderColor = new Color("#0B4486");
            this.button.isEnabled = state;
         }
         else{
            this.button.backgroundColor = new Color("#A1CAFA");
            this.button.borderColor = new Color("#A1CAFA");
            this.button.isEnabled = state;
         }  
     }


    /**
     * shows dialog with the options to take a photo with the device camera
     * or select one from the device gallery
     * 
     * @memberof SignUpComponent
     */
    uploadImage(){
        //set dialog options text
        let options = {
            cancelButtonText: global.L("cancel"),
            actions: [global.L("take_photo"), global.L("see_gallery")]
        };
        //retrieve the dialog's user action result
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
     * open the device camera to take a photo
     * 
     * 
     * @memberof SignUpComponent
     */
    onTakePicture() {
        //request user permission to use the camera
        requestPermissions();
        takePicture({width: 180, height: 180, keepAspectRatio: false, saveToGallery: this.saveToGallery}).then((imageAsset) => {
            console.info("File uri: "+imageAsset.android);
            this.image = imageAsset.android;
            this.isVisibleImage = true;
            this.imageTaken = true;
        });
    }

    /**
     * sets the options to open the gallery on single mode to select a single image
     * 
     * 
     * @memberof SignUpComponent
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
     * @memberof SignUpComponent
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
                    console.info("fileUri: " + selected.fileUri);
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
     * Attemtpts to save the selected image
     * 
     * 
     * @memberof SignUpComponent
     */
    savePicture(){
        this.isSaving = true;
        //create folder in the device's system file to save the image
        console.info("image path: "+this.image);
        let image2 = imageSourceModule.fromFileOrResource(this.image);
        let folder = fs.knownFolders.documents();
        let path = fs.path.join(folder.path, this.user.Username+".jpg");
        let saved = image2.saveToFile(path, "jpg");
        console.info("Saved? "+saved);
        let data = image2.toBase64String("jpg");
        
        //send the image for saving in the backend
        this.geoReportService.putRequestImage(data, this.user.Username+"-profile.jpg")
            .subscribe(
                (data) => {
                    this.nav.navigate([''], {clearHistory : true});
                    Toast.makeText(global.L("user_created")).show();

                    this.isSaving = false;
                    this.changeStateButton(false);
                    
                    //Clears folder where is saved the image
                    folder.clear()
                        .then(() =>{
                            console.info("Folder cleared");
                        }, (error) => {
                            console.info(JSON.stringify(error,null,4));
                        });
                },
                (error) => {
                    
                    this.nav.navigate([''], {clearHistory : true});
                    Toast.makeText("Ocurrió error al guardar imagen").show();
                    this.isSaving = false;
                    this.changeStateButton(false);

                    //Clears folder where is saved the image
                    folder.clear()
                        .then(() =>{
                            console.info("Folder cleared");
                        }, (error) => {
                            console.info(JSON.stringify(error,null,4));
                        });
                    console.info(error);
                }
            );

            
        }

    /**
     * Attemtps to create a new User
     * 
     * 
     * @memberof SignUpComponent
     */
    public signUp()
    {
        //check if the username and email text fields aren't empty
        if(this.user.Username === "" || this.user.Email === "" || this.user.Password === "")
        {
            Toast.makeText(global.L("sign_up_missing")).show();
        }
        else if(this.user.isValidEmail() == false)
        {
            Toast.makeText("Ingrese un correo válido").show();
        }
        else
        {   
            //check if the password and confirm password textfields are different
            if(this.user.Password === this.repeatPassword){

                this.changeStateButton(false);
                this.isSaving = true;
                console.info("calling service");

                this.signUpService.register(this.user)
                    .subscribe(
                        (data) => {
                            // Save the picture if it is taken
                            if(this.imageTaken){
                                this.savePicture();
                            }
                            //If no image, just create the user
                            else{  
                                this.nav.navigate([''], {clearHistory : true})
                                Toast.makeText(global.L("user_created")).show();

                                this.changeStateButton(false);
                                this.isSaving = false;
                            } 
                        },
                        (error) => {
                            switch(error.status)
                            {
                                case 201:
                                {
                                    // Save the picture if it is taken
                                    if(this.imageTaken){
                                        this.savePicture();
                                    }
                                    //If no image, just create the user
                                    else{
                                        this.nav.navigate([''], {clearHistory : true});
                                        Toast.makeText(global.L("user_created")).show();

                                        this.changeStateButton(false);
                                        this.isSaving = false;
                                    }
                                    break;
                                }
                                default:
                                {
                                    Toast.makeText(error).show();
                                    this.isSaving = false;
                                }
                            }
                            console.info(JSON.stringify(error,null,4));
                        }
                    );  
            }
            else{
                Toast.makeText(global.L("different_password")).show();
            }
            
        }
            
    }
}