import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
import { AuthGuard } from "./shared/auth-guard/auth-guard.service";

import { LoginComponent } from "./pages/login/login.component";
import {ImproveCityComponent} from "./pages/improve-city/improve-city.component";
import {ReportComponent} from "./pages/report/report.component";
import {ReportCategoriesComponent} from "./pages/report-categories/report-categories.component";
import {ReportDetailComponent} from "./pages/report-detail/report-detail.component";
import { SignUpComponent } from "./pages/sign-up/sign-up.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { SettingsComponent } from "./pages/settings/settings.component";

import { AlertComponent } from "./components/alert/alert.component";

export const routes: Routes = [
    { path: "", redirectTo: "/improve-city", pathMatch: "full" },
    { path: "login", component: LoginComponent},
    { path: "improve-city", component: ImproveCityComponent, canActivate: [AuthGuard] },
    { path: "improve-city/:id", component: ImproveCityComponent,canActivate: [AuthGuard] },
    { path: "report", component: ReportComponent },
    { path: "report-categories", component: ReportCategoriesComponent },
    { path: "report-detail/:id", component: ReportDetailComponent},
    { path: "sign-up", component: SignUpComponent},
    { path: "profile", component: ProfileComponent},
    { path: "settings", component: SettingsComponent},
    { path: "alert", component: AlertComponent}
];

export const navigatableComponents = [
  LoginComponent,
  ImproveCityComponent,
  ReportComponent,
  ReportCategoriesComponent,
  ReportDetailComponent,
  SignUpComponent,
  ProfileComponent,
  SettingsComponent,
  AlertComponent
];