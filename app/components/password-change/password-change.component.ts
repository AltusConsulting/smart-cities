import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import * as Toast from "nativescript-toast";
import { Config } from "../../shared/config";

import { LoginService } from "../../shared/login/login.service";
import * as appSettings from "application-settings";

declare var global : any

@Component({
    moduleId: module.id,
    selector: 'pass-change',
    templateUrl: 'password-change.component.html',
    styleUrls: ["password-change-common.css"],
    providers:[LoginService]
})
export class PasswordChangeComponent implements OnInit {
    
    public config: Config;
    public actualPassword : string = "";
    public newPassword : string = "";
    private confirmPassword : string = "";

    constructor(private params: ModalDialogParams, private loginService:LoginService) { }

    ngOnInit() 
    {
        this.config = new Config();
        //this.actualPassword, this.newPassword, this.confirmPassword = "";
    }

    public save()
    {
        if(this.areEmptyFields()==false && this.verifyPasswordTextfields()){

            this.loginService.changePassword(this.newPassword)
                .subscribe(
                    (data) => {
                        console.info(JSON.stringify(data));
                        Toast.makeText(global.L("password_changed")).show();
                        appSettings.setString(this.config.USER_PASSWORD_KEY,this.newPassword);
                        this.params.closeCallback(this.newPassword);
                    },
                    (error) => {
                        Toast.makeText(error).show();
                    }
                )
        }
    }

    public verifyPasswordTextfields(){
        if(this.actualPassword === this.params.context.actualPassword){
            if(this.newPassword === this.confirmPassword){
                return true;
            }
            else{
                Toast.makeText(global.L("different_password")).show();
                return false;
            }
        }
        else{
            Toast.makeText(global.L("current_password_incorrect")).show();
            return false;
        }
    }

    public areEmptyFields(){
        if(this.actualPassword==="" || this.newPassword ==="" || this.confirmPassword===""){
            Toast.makeText(global.L("fields_required")).show();
            return true;
        }
        else{
            return false;
        }
    }

    public close()
    {
        this.params.closeCallback("");

    }
}