import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { routes,navigatableComponents } from "./app.routing";
import { AppComponent } from "./app.component";
import { NativeScriptI18nModule } from "nativescript-i18n/angular";
import { DropDownModule } from "nativescript-drop-down/angular"

import { AuthGuard } from "./shared/auth-guard/auth-guard.service";
import { ReportComponent } from "./pages/report/report.component";
import { PasswordChangeComponent } from "./components/password-change/password-change.component";

import { Http, RequestOptions } from '@angular/http';

import { AuthHttp, AuthConfig } from 'angular2-jwt';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        DropDownModule,
        NativeScriptHttpModule,
        NativeScriptFormsModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forRoot(routes),
        NativeScriptI18nModule
    ],
    declarations: [
        AppComponent,
        ReportComponent,
        PasswordChangeComponent,
        ...navigatableComponents
    ],
    entryComponents: [
        ReportComponent,
        PasswordChangeComponent,
    ],
    providers: [
        AuthGuard,
        AuthHttp
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
