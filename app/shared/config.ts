import { User } from './user/user.model';
import * as appSettings from 'application-settings';

export class Config{
    public static googleApiUrl : string = "https://maps.googleapis.com/maps/api/";
    public static geocodeUrl = "geocode/json?address="
    public static geocodeInverseUrl = "geocode/json?latlng="
    public static autocompleteUrl = "queryautocomplete/json?input=";
    public static detailsUrl = "details/json?placeid=";

    // CHANGE HERE BY YOUR CREDENTIALS OF GOOGLE PLACES API WEB SERVICE AND GOOGLE MAPS GEOCODING API 
    public static API_KEY : string = "AIzaSyChesjAg5p0bYoFbz8BRqAG2-m7TLdykmw";
    public static API_KEY_GEOCODE : string = "AIzaSyByZZk_vusKwP_90wx_IAIA9INhAAjULR4";


    public static aaaApiUrl : string = "/api/aaa/v1";

    public readonly s3Bucket = "altus311-01.images.aws.als";

    public readonly facebookGraphApiUrl = "https://graph.facebook.com/v2.9/";

    public static loginToken : string;
    
    public static user : User;

    public static open311Url : string = "";
    public static aaaApiBase : string = "PUT HERE YOUR AAA-BACKEND URL";
    public static messagingApiUrl = "PUT HERE YOUR MESSAGING-BACKEND URL";

    //app settings keys
    public readonly OPEN311_DEFAULT = "PUT HERE YOUR OPEN311-BACKEND URL"
    public readonly FACEBOOK_TOKEN_KEY = "facebook_token";
    public readonly EMAIL_TOKEN_KEY = "email_token";
    public readonly ANONYMOUS_LOGIN_KEY = "anonymous_login";
    public readonly USER_ID_KEY = "user_id";
    public readonly USER_PASSWORD_KEY = "user_password";
    public readonly FIRST_LOGIN_KEY = "first_login";
    public readonly REPORT_NOTIFICATION_KEY = "reports";
    public readonly ALERT_NOTIFICATION_KEY = "alerts";
    public readonly OPEN311_BACKEND_KEY = "open311";
    
    
    

    //token variables
    public static facebookToken : string;
    public static emailToken : string;
    public readonly anonymousToken : string = "temp_token";

    constructor()
    {
        this.open311Url = appSettings.getString(this.OPEN311_BACKEND_KEY, this.OPEN311_DEFAULT); 
    }

    public get user() {
        return Config.user;
    }

    public set user(user : User) {
        Config.user = user;
    }
    
    public get aaaApiBase() {
        return Config.aaaApiBase;
    }

    public get aaaApiUrl() {
        return Config.aaaApiUrl;
    }

    public get googleApiUrl() {
        return Config.googleApiUrl;
    }

    public get geocodeUrl() {
        return Config.geocodeUrl;
    }
     public get geocodeInverseUrl() {
        return Config.geocodeInverseUrl;
    }

    public get autocompleteUrl() {
        return Config.autocompleteUrl;
    }

    public get detailsUrl() {
        return Config.detailsUrl;
    }

    public get open311Url()
    {
        return Config.open311Url;
    }

    public set open311Url(url : string)
    {
        Config.open311Url = url;
    }

    public get facebook_token()
    {
        return Config.facebookToken;
    }

    public set facebook_token(facebook_token: string)
    {
        Config.facebookToken = facebook_token;
    }

    public get email_token()
    {
        return Config.emailToken;
    }

    public set email_token(email_token : string)
    {
        Config.emailToken = email_token;
    }

    public get loginToken()
    {
        return Config.loginToken;
    }

    public set loginToken(login_token : string)
    {
        Config.loginToken = login_token;
    }

    public get gmPlacesApikey()
    {
        return Config.API_KEY;
    }

    public set gmPlacesApikey(key : string)
    {
        Config.API_KEY = key;
    }

    public get gmGeolocationApikey()
    {
        return Config.API_KEY_GEOCODE;
    }

    public set gmGeolocationApikey(key : string)
    {
        Config.API_KEY_GEOCODE = key;
    }

     public get messagingApiUrl()
    {
        return Config.messagingApiUrl;
    }

}