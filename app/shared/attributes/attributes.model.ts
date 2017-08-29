/**
 * Attributes model class
 * 
 * @export
 * @class Attributes
 */
export class Attributes 
{
    public code : string;
    public value : string;

    constructor(code : string, value : string)
    {
        this.code = code;
        this.value = value;
    }
}