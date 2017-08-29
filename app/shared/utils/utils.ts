declare var global : any

export class Utils
{
    private days = [global.L("sunday"),global.L("monday"),global.L("tuesday"),global.L("wednesday"),global.L("thursday"),
                    global.L("friday"),global.L("saturday")];

    private months = [global.L("january"),global.L("february"),global.L("march"),global.L("april"),global.L("may"),
                      global.L("june"),global.L("july"),global.L("august"),global.L("september"),global.L("october"),
                      global.L("november"),global.L("december")];

    /**
     * changes the number of the month to its name
     * 
     * @param {number} month number of the month
     * @returns {string} name of the month
     * 
     * @memberof Utils
     */
    public getMonthName(month : number) : string
    {
        return this.months[month];
    }

    /**
     * reformats the date, adds prefixes a 0 if the date is less than 10
     * 
     * @param {number} date date number
     * @returns {string} date number with new format
     * 
     * @memberof Utils
     */
    public getNumberFormat(date : number) : string
    {
        return date < 10 ? '0'+date : ''+date;
    }

    /**
     * Changes the number of the day to its text equivalent
     * 
     * @param {number} day 
     * @returns {string} name of the day 
     * 
     * @memberof Utils
     */
    public getDayName(day : number) : string
    {
        return this.days[day];
    }

    /**
     * Obtain the distance between two geographical points
     * 
     * @private
     * @param {any} lat1 latitude of point A
     * @param {any} lon1 longitude of point A
     * @param {any} lat2 latitude of point B
     * @param {any} lon2 longitude of point B
     * @returns distance in meters
     * 
     * @memberof ImproveCityComponent
     */
    public getDistanceFromCoordinates(lat1,lon1,lat2,lon2)
    {
        let R = 6371;
        let dLat = this.degToRad(lat2-lat1);
        let dLon = this.degToRad(lon2-lon1);
        let a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c;
        return d;
    }

    /**
     * Convert degress to radians
     * 
     * @private
     * @param {any} degrees 
     * @returns conversion of degress to radians
     * 
     * @memberof Utils
     */
    private degToRad(degrees)
    {
        return degrees * ( Math.PI/180);
    }
}