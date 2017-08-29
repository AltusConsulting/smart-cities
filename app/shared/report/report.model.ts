import { Location } from "../location/location.model"
import { Attributes } from "../attributes/attributes.model"
export class Report
{
    //POST service required info
    public ID : string;
    public jurisdictionID : string;
    public serviceCode : string;
    public location : Location;
    public attributes : Array<Attributes>;
    public addressString : string;
    public addressID : string;
    public email : string;
    public deviceID : string;
    public accountID : string;
    public firstName : string;
    public lastName : string;
    public phone : string;
    public description : string;
    
    public mediaURL : string

    //GET service returned extra info
    public status : string;
    public statusNotes : string;
    public serviceName : string;
    public agencyResponsible : string;
    public serviceNotice : string;
    public requestedDateTime : Date
    public updatedDateTime : Date;
    public expectedDateTime : Date;
    public zipCode : string;

    //Extra images
    public imageCategory : string;


    constructor()
    {
        this.ID = "";
        this.jurisdictionID = "";
        this.serviceCode = "";
        this.location = new Location(0,0);
        this.attributes = new Array<Attributes>();
        this.addressString = "";
        this.addressID = "";
        this.email = "";
        this.deviceID = "";
        this.accountID = "";
        this.firstName = "";
        this.lastName = "";
        this.phone = "";
        this.description = "";
        this.imageCategory = "";
        this.mediaURL = "";

        this.status = "";
        this.statusNotes = "";
        this.serviceName = "";
        this.agencyResponsible = "";
        this.serviceNotice = "";
        this.requestedDateTime = new Date();
        this.updatedDateTime = new Date();
        this.expectedDateTime = new Date();
        this.zipCode = "";
        
    }

    public copyInfo(data : any)
    {
        this.jurisdictionID = data.jurisdiction_id;
        this.serviceCode = data.service_code;
        this.location = data.location;
        this.attributes = data.attributes;
        this.addressString = data.address_string;
        this.addressID = data.address_id;
        this.email = data.email;
        this.deviceID = data.device_id;
        this.accountID = data.account_id;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.phone = data.phone;
        this.description = data.description;
        this.mediaURL = data.media_url;
        this.status = data.status;
        this.statusNotes = data.status_notes;
        this.serviceName = data.service_name;
        this.agencyResponsible = data.agency_responsible;
        this.serviceNotice = data.service_notice;
        this.requestedDateTime = new Date(data.requested_datetime);
        this.updatedDateTime = new Date(data.updated_datetime);
        this.expectedDateTime = new Date(data.expected_datetime);
        this.zipCode = data.zipcode;
    }
}