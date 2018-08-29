import firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import 'rxjs/Rx';
import { Role, configurations, Reading } from '../register-user/role';


@Injectable()
export class AuthService{
    
  public ownerEmail: string = null;
  public appConfig: configurations = null;
  public total_costs: number = null;
  public roles: Role[] = [];
  public isAdmin: boolean = false;
  public isSupplier: boolean = false;
  public readings: Reading[] = [];
  public currentYear: number = 2017;
  public currentMonth: number = 6;
  public currentDay: number = 4;
  public currentUnitsSoFar: number = 0;

 
  

    constructor(private http: Http){}

    registerUser(email: string){
       return firebase.auth().createUserWithEmailAndPassword(email,email);
    }



    

    loginUser(email: string){
        this.ownerEmail = email;
        //getting app configurations
         firebase.auth().signInWithEmailAndPassword(email, email).then(data => {
            this.getAppConfigurations()
            .subscribe(
              (config: configurations) => {
                
                  if(config){
                    this.updateAppConfig(config);
                  }
                  this.getMeterReadings()
                  .subscribe(
                      (data) => {
                        //   for(var i of data){
                        //     console.log("uleeeidez "+i.year);
                        //   }
                      },
                      error => {
                      //    console.log(error);
                      }
                  );
                  this.getUserRoles()
                  .subscribe(
                      (roles: Role[]) => {
                      },
                      error => {
                          console.log(error);
                      }
                  );
              },
              error => {
                  console.log(error);
              }
          );
         }).catch( error => {

         });
        
        return firebase.auth().signInWithEmailAndPassword(email, email);
    }





    logout(){
        firebase.auth().signOut();
    }

    getActiveUser(){
        return firebase.auth().currentUser.uid; 
    }

    getActiveUserEmail(){
        return firebase.auth().currentUser.email; 
    }





    recordUserInfo(name: string, email: string, phone: string, location: string, admin: boolean, supplier: boolean, subscriber: boolean){
        const userId = firebase.auth().currentUser.uid;

       let roles: Role[] = [];
       let meterType: string = null;

       if(admin){
           roles.push(new Role(1,"admin"))
       }

       if(supplier){
            roles.push(new Role(2,"supplier"));
            meterType = "source";
       }

       if(subscriber){
            roles.push(new Role(3,"subscriber"));
            roles.push(new Role(2,"supplier"));
            meterType = "destination";
     }


        var regUser = {
            name: name,
            email: email,
            phone: phone,
            location: location,
            roles: roles,
            meter: {type: meterType}
        };
        return this.http.put("https://wmr-app2018.firebaseio.com/users/"+userId+".json",regUser)
        .map((response: Response) => {
            return response.json();
        });
    }


    
    getUserRoles(){
        const userId = firebase.auth().currentUser.uid;
        return this.http.get("https://wmr-app2018.firebaseio.com/users/"+userId+"/roles.json")
        .map((response: Response) => {
            //console.log(response+" asisee");
            return response.json();
        }).do((data) => {
            // this.roles = JSON.parse(JSON.parse(data)[0];
            var LOCAL_ROLES: Role[] = [];
            var is_admin: boolean = false;
            var is_supplier: boolean = false;
            for (var i of data) {
            LOCAL_ROLES.push(new Role(i.id,i.name));
            if(i.id == 1){
                is_admin = true;
            }else if(i.id == 2){
                is_supplier = true;
            }
            }
            this.setIsAdmin(is_admin);
            this.setIsSupplier(is_supplier);
            this.setUserRoles(LOCAL_ROLES);
        });
    }




    getAppConfigurations(){
        return this.http.get("https://wmr-app2018.firebaseio.com/configurations.json")
        .map((response: Response) => {
            return response.json();
        }).do((data) => {
            this.appConfig = data;
        });
    }




    updateAppConfigurations(cost: number, endOfMonth: boolean){
        var config = {
            cost_per_unit: cost,
            end_of_month: endOfMonth
        };
        return this.http.put("https://wmr-app2018.firebaseio.com/configurations.json",config)
        .map((response: Response) => {
            return response.json();
        });
    }




    recordMeterReading(year: number, month: number,units: string, photo: string){
        //check reading month & year
        const userId = firebase.auth().currentUser.uid;
        let LOCAL_READINGS: Reading[] = [];
        var absUnits = 0;
        var totalAmount = 0;
        var cost: number = this.appConfig.cost_per_unit;  
        var isValidReading = false;
        var refMonthIndex = 0;
        var refYearIndex = 0;
        var refYear = 2018;
        var refMonth = 1;
        var yearIndex = 0;
        var monthIndex = 0;
        var refUnits = "0";
        var preRefUnits = "0";

        //finding largest year of readings so far
        for(var i of this.readings){
            if(i.year > refYear){
                refYear = i.year;
                refYearIndex = yearIndex;
                yearIndex++;
            }
        }

        //finding largest month of reading so far
        for(var i of this.readings){
            if(i.year == refYear){
                if(i.month > refMonth ){
                    refMonth = i.month;
                    preRefUnits = refUnits;
                    refUnits = i.units;
                }
            }
            refMonthIndex = monthIndex;
            monthIndex++;
        }

        //checking for validity of incoming reading
        var refUnitsAmount : number = parseFloat(refUnits);
        var incomingUnitsAmount : number = parseFloat(units);
        absUnits = incomingUnitsAmount - refUnitsAmount;
        totalAmount =  cost * absUnits;
        if(refUnitsAmount <= incomingUnitsAmount){
            if(refYear == year){
                //Existing year || we check validity of month
                if(refMonth < month){
                    //if its not the same month, add readings
                    this.readings.splice(0,0,new Reading(year,month,units,absUnits+"",photo,totalAmount+""));
                }else if(refMonth == month){
                    //if its the same month, replace readings
                    var refUnitsAmount : number = parseFloat(preRefUnits);
                    var incomingUnitsAmount : number = parseFloat(units);
                    absUnits = incomingUnitsAmount - refUnitsAmount;
                    totalAmount =  cost * absUnits;
                    this.readings.splice(refMonthIndex,1,new Reading(year,month,units,absUnits+"",photo,totalAmount+""));
                }else{
                    isValidReading = false;
                }
            }else if(refYear < year){
                //assume its a new year || continue execution
                this.readings.splice(0,0,new Reading(year,month,units,absUnits+"",photo,totalAmount+""));
            }else{
                isValidReading = false;
            }
        }else{
            isValidReading = false;
        }

        //double-checking readings locally and globally
         LOCAL_READINGS = this.readings;

        return this.http.put("https://wmr-app2018.firebaseio.com/users/"+userId+"/meter/readings.json",LOCAL_READINGS)
        .map((response: Response) => {
            return response.json();
        });
    }






    getMeterReadings(){
        const userId = firebase.auth().currentUser.uid;
        return this.http.get("https://wmr-app2018.firebaseio.com/users/"+userId+"/meter/readings.json")
        .map((response: Response) => {
            return response.json();
        }).do((data) => {
            // this.roles = JSON.parse(JSON.parse(data)[0];
            var LOCAL_READINGS: Reading[] = [];
            for (var i of data) {
                console.log(i.absUnits+" asisee");
                LOCAL_READINGS.push(new Reading(i.year,i.month,i.units,i.absUnits,i.photo,i.amount.toString()));
            }
            this.setReadings(LOCAL_READINGS);
        });
    }



    private updateAppConfig(config: configurations){
        this.appConfig = config;
      }

    private setUserRoles(roles: Role[]){
        this.roles = roles
    }

    private setIsAdmin(value: boolean){
        this.isAdmin = value;
    }

    private setIsSupplier(value: boolean){
        this.isSupplier = value;
    }

    private setReadings(readings: Reading[]){
        this.readings = readings;
        console.log(this.readings);
    }

    getCurrentTime(){
        return this.http.get("http://worldclockapi.com/api/json/utc/now")
        .map((response: Response) => {
            return response.json();
        }).do((data) => {
            this.currentYear = data.currentDateTime.substring(0,4);
            this.currentMonth = data.currentDateTime.substring(5,7);
            this.currentDay = data.currentDateTime.substring(8,10);
        });
    }

    getMaxUnitsSoFar(): number{
        const userId = firebase.auth().currentUser.uid;
        let LOCAL_READINGS: Reading[] = [];
        var absUnits = 0;
        var totalAmount = 0;
        var cost: number = this.appConfig.cost_per_unit;  

        var refMonthIndex = 0;
        var refYearIndex = 0;
        var refYear = 2018;
        var refMonth = 1;
        var yearIndex = 0;
        var monthIndex = 0;
        var refUnits = "0";
        var preRefUnits = "0";

        //check if readings exists

        if(this.readings.length != 0){
                //finding largest year of readings so far
                for(var i of this.readings){
                    if(i.year > refYear){
                        refYear = i.year;
                        refYearIndex = yearIndex;
                        yearIndex++;
                    }
                }

                //finding largest month of reading so far
                for(var i of this.readings){
                    if(i.year == refYear){
                        if(i.month > refMonth ){
                            refMonth = i.month;
                            preRefUnits = refUnits;
                            refUnits = i.units;
                        }
                    }
                    refMonthIndex = monthIndex;
                    monthIndex++;
                }
                this.currentUnitsSoFar = parseFloat(refUnits);
    }else{
        this.currentUnitsSoFar = 0;
    }

        
        return this.currentUnitsSoFar;
    }


 
}