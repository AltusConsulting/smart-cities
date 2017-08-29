var validator = require("email-validator");

export class User
{
    private ID : number;
    public Username : string;
    public FirstName : string;
    public LastName : string;
    public Email : string;
    public AuthBackend : number;
    public Password : string;
    public Module : Array<string>;
    public ProfileImage : string;

    constructor()
    {
        this.ID = 0;
        this.Username = "";
        this.FirstName = "";
        this.LastName = "";
        this.Email = "";
        this.AuthBackend = 1;
        this.Password = "";
        this.Module = new Array<string>();
        this.ProfileImage = "";
    }

    isValidEmail(){
        return validator.validate(this.Email);
    }

}