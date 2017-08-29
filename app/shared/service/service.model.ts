export class Service
{
    public ID : string;
    public jurisdictionID : string;
    public serviceName : string;
    public description : string;
    public metadata : boolean;
    public type : string;
    public keywords : string;
    public group : string;

    constructor()
    {
        this.ID = "";
        this.jurisdictionID = "";
        this.serviceName = "";
        this.description = "";
        this.metadata = false;
        this.type = "";
        this.keywords = "";
        this.group = "";
    }
}