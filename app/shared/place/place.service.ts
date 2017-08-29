import { Injectable,Component, Input, OnInit } from '@angular/core';
import { Http,  Response } from '@angular/http';
import {Place} from "./place.model"
import { Config } from '../config';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import * as Toast from 'nativescript-toast';


@Injectable()
export class PlaceService {
    private config: Config;

    constructor(private http : Http) {
        this.config = new Config();
     }

    getGeolocation(name:string){
        return this.http.get(
            this.config.googleApiUrl + "place/"+this.config.geocodeUrl + name + "&key="+this.config.gmPlacesApikey
         )
        .map(response => response.json())
        .map(data => {
            let placesArray =[];
            if(data.status=="OK"){
                
                //console.log(JSON.stringify(data))
               data.predictions.forEach(place => {
                    placesArray.push(new Place (place.description,place.place_id, false));
                    console.info(place.description+","+place.place_id);    
                })
                 console.log(JSON.stringify(data,null,4));
            }
            else{
                alert(data.status)
                 console.log(JSON.stringify(data,null,4));
            }
            
            return placesArray;
        })
    }

    getPlaces(name:string){
        
        return this.http.get(
            this.config.googleApiUrl + "place/"+this.config.autocompleteUrl + name + "&key="+ this.config.gmPlacesApikey
         )
        .map(response => response.json())
        .map(data => {
            let placesArray =[];

            switch(data.status)
            {
                case "ZERO_RESULTS":{
                    Toast.makeText("No se encontraron resultados.").show();
                }
                case "OVER_QUERY_LIMIT": {
                    Toast.makeText("Ha excedido el límite de su cuota").show();
                }
                case "REQUEST_DENIED": {
                    Toast.makeText("Solicitud denegada. Consulte con el administrador.").show();
                }
                case "INVALID_REQUEST": {
                    Toast.makeText("Solicitud inválida. Consulte con el administrador.").show();
                }
                case "OK": {
                    data.predictions.forEach(place => {
                        let types = place.types;
                        let isCountry = types.indexOf("country") != -1 ? true : false;
                        
                        placesArray.push(new Place (place.description, place.place_id, isCountry));
                        console.info(isCountry +" ,"+place.description+","+place.place_id);    
                    })
                    console.info(JSON.stringify(data,null,4));
                }
            }   
            return placesArray;
        })
    }

    getDetails(placeID:string){
        return this.http.get(
            this.config.googleApiUrl + "place/"+this.config.detailsUrl + placeID + "&key="+ this.config.gmPlacesApikey
        )
        .map(response => response.json())
        .map(data => {
            let locationArray = [];

            locationArray.push (data.result.geometry.location.lat); 
            locationArray.push (data.result.geometry.location.lng);
            console.info(JSON.stringify(data,null,4));
            return locationArray;
        })
    }

    getPlaceName(coordenates:string){
        return this.http.get(
            this.config.googleApiUrl +this.config.geocodeInverseUrl + coordenates + "&key="+ this.config.gmGeolocationApikey
        )
        .map(response => response.json())
        .map(data => {
            let addressString;
            if (data.results.length >0){
                addressString = data.results[0].formatted_address;
            }
            console.log("Address: "+addressString);

            return addressString;
        })
    }
    }

