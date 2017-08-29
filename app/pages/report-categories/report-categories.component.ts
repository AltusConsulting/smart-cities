import { Component, OnInit} from "@angular/core";
import { RouterExtensions } from 'nativescript-angular/router';

declare var global : any

/**
 * Report categories component class
 * 
 * @export
 * @class ReportCategoriesComponent
 * @implements {OnInit}
 */
@Component({
    selector: "report-categories",
    templateUrl: "./pages/report-categories/report-categories.component.html",
    styleUrls: ["./pages/report-categories/report-categories.component.css"]
})
export class ReportCategoriesComponent implements OnInit { 

    
    /**
     * Creates an instance of ReportCategoriesComponent.
     * @param {RouterExtensions} nav 
     * 
     * @memberof ReportCategoriesComponent
     */
    constructor(private nav : RouterExtensions){

    }

    ngOnInit(){
    }

    /**
     * assigns a category and its icon color to a new report
     * 
     * @param {any} category 
     * @param {any} image 
     * 
     * @memberof ReportCategoriesComponent
     */
    tapped(category, image){
        global.newReport.serviceName = category;
        global.newReport.imageCategory = image;
        this.nav.navigate(['/report'],);
    }

    /**
     * return to the home component and clears the navigation stack
     * 
     * 
     * @memberof ReportCategoriesComponent
     */
    goHome(){
        this.nav.navigate([''], {clearHistory: true});
    }

    /**
     * return to the previous component in the navegation stack and clears the navegation stack
     * 
     * 
     * @memberof ReportCategoriesComponent
     */
    goBack(){
        this.nav.navigate(['/improve-city'], {clearHistory: true});
    }
}