import { Component , OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router"
import { Page } from "ui/page";

declare var global : any

@Component({
    moduleId: module.id,
    selector: 'alert',
    templateUrl: 'alert.component.html',
    styleUrls: ['alert-common.css']
})
export class AlertComponent implements OnInit{

    public description: string;
    public path : string;
    public id : string;

    constructor(private page: Page, private route: ActivatedRoute, private nav: RouterExtensions) {}
    
    ngOnInit(){

        this.page.actionBarHidden = true;

        this.route.queryParams.subscribe(params => 
        {
            this.description = params["description"];
            this.path = params["path"];
            this.id = params["id"];
        });
    }

    public viewAlert()
    { 
        console.info(this.description);
        console.info(this.path);
        console.info(this.id)
        this.nav.navigate([this.path, this.id], { clearHistory : true });
    }

    public close()
    {
        this.nav.backToPreviousPage();
        console.info("description: "+this.description);
    }
}