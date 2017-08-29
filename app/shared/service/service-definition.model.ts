export class ServiceDefinition
{
    public jurisdictionID : string;
    public serviceCode : string;
    public variable : boolean;
    public dataType : string;
    public required : boolean;
    public dataTypeDescription : string;
    public order : number;
    public attributeDescription : string;
    public value : Map<string,string>;

    constructor()
    {
        this.jurisdictionID = "";
        this.serviceCode = "";
        this.variable = false;
        this.dataType = "";
        this.required = false;
        this.dataTypeDescription = "";
        this.order = 0;
        this.attributeDescription = "";
        this.value = new Map<string,string>();
    }
}