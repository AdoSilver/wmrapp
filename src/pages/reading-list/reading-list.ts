import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AuthService } from '../login/auth';
import { configurations, Reading } from '../register-user/role';

@IonicPage()
@Component({
  selector: 'page-reading-list',
  templateUrl: 'reading-list.html',
})

export class ReadingListPage implements OnInit {

  public myphoto: string = "https://uploads-ssl.webflow.com/57e5747bd0ac813956df4e96/5aebae14c6d254621d81f826_placeholder.png";
  public isEndOfMonth: boolean = false;
  public endOfMonth: boolean = true;
  public photoNotCaptured: boolean = true; 
  public readings: {key: string, year: number, month: number, units: string, absUnits: string, photo: string, amount: string}[];
  public isConfigLoaded = false;
  public isReadingsLoaded = false;
  public loading: any;
  public isRecordsNull = true;
  

  constructor(private navCtrl: NavController, 
    private navParams: NavParams,
    private menuCtrl: MenuController, private camera: Camera,
    private authService: AuthService, private loadingController: LoadingController, private alertController: AlertController ) {
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadingListPage');
  }

  ionViewWillEnter(){
  }

  onOpenMenu(){
    this.menuCtrl.open();
  }

  ngOnInit(){}


  ionViewDidEnter(){
    this.loading = this.loadingController.create({
      content: "Please wait.."
    });
    this.loading.present();
    this.getAppConfigurations();
    this.getReadings();
  }


  getReadings(){
    this.authService.getMeterReadings()
      .subscribe(
          (data) => {
                if(data){
                  var rKeys = Object.keys(data);
                  console.log("ugahooo "+ rKeys.length)
                  if(rKeys.length > 0){
                    this.isRecordsNull = false;
                  }
                  var LOCAL_READINGS: Reading[] = [];
                  for(var key of rKeys){
                      LOCAL_READINGS.push(new Reading(key,data[key].year,data[key].month,data[key].units,data[key].absUnits,data[key].photo,data[key].amount));
                  }
                this.readings = LOCAL_READINGS;
                this.isReadingsLoaded = true;
                if(this.isConfigLoaded){
                  this.loading.dismiss();
                }
              }else{
                this.isReadingsLoaded = true;
                if(this.isConfigLoaded){
                  this.loading.dismiss();
                }
                const alert = this.alertController.create({
                  title: 'Alert',
                  message: 'No Reading records found',
                  buttons: ['Ok']
                });
                alert.present();
              }
          },
          error => {
              console.log(error);
              this.isReadingsLoaded = true;
              if(this.isConfigLoaded){
                this.loading.dismiss();
              }
              const alert = this.alertController.create({
                title: 'Meter Records Error',
                message: error.message,
                buttons: ['Ok']
              });
              alert.present();
          }
      );
  }


  getAppConfigurations(){
    this.authService.getAppConfigurations()
            .subscribe(
              (config: configurations) => {
                  if(config){
                    if(config.end_of_month){
                      this.updateAppConfig(config.end_of_month);
                      console.log("Config:isEndOfMonth: "+config.end_of_month);
                    }
                  }
                  this.isConfigLoaded = true;
                  if(this.isReadingsLoaded){
                    this.loading.dismiss();
                  }
              },
              error => {
                  console.log(error);
                  this.isConfigLoaded = true;
                  if(this.isReadingsLoaded){
                    this.loading.dismiss();
                  }
                  const alert = this.alertController.create({
                    title: 'User Configuration Error',
                    message: error.message,
                    buttons: ['Ok']
                  });
                  alert.present();
              }
          );
  }


  private updateAppConfig(isEndOfMonth: boolean){
    this.isEndOfMonth = isEndOfMonth;
  }


  getMonthName(month: number): string{
    if(month == 1){
      return "Jan";
    }else if(month == 2){
      return "Feb";
    }else if(month == 3){
      return "Mar";
    }else if(month == 4){
      return "Apr";
    }else if(month == 5){
      return "May";
    }else if(month == 6){
      return "Jun";
    }else if(month == 7){
      return "Jul";
    }else if(month == 8){
      return "Aug";
    }else if(month == 9){
      return "Sep";
    }else if(month == 10){
      return "Oct";
    }else if(month == 11){
      return "Nov";
    }else if(month == 12){
      return "Dec";
    } 
  }


  getUnits(units: string): string{
    return parseFloat(units).toFixed(4);
  }


}
