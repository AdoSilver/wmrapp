import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NgForm } from '@angular/forms';
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
  public readings: {year: number, month: number, units: string, absUnits: string, photo: string, amount: string}[];



  constructor(private navCtrl: NavController, 
    private navParams: NavParams,
    private menuCtrl: MenuController, private camera: Camera,
    private authService: AuthService, private loadingController: LoadingController ) {

    const loading = this.loadingController.create({
      content: "Please wait.."
    });
  }




  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadingListPage');
  }

  ionViewWillEnter(){
  }

  onOpenMenu(){
    this.menuCtrl.open();
  }

  ngOnInit(){
    const loading = this.loadingController.create({
      content: "Please wait.."
    });
    loading.present();
    this.getReadings();
    this.getAppConfigurations();
    loading.dismiss();
  }


  // onSubmitReading(form: NgForm){
  //     console.log(form.value);
  //     let value = form.value.whole_no+"."+form.value.one + form.value.two + form.value.three + form.value.four;
  //     let year = new Date().getUTCFullYear();
  //     // let month = new Date().getUTCMonth()+1;
  //     let month = form.value.four;
  //     console.log("Current Date ",value); 

  //     if(this.photoNotCaptured){
  //       this.myphoto = "no_photo";
  //     }
  //     this.authService.recordMeterReading(year,month,value,this.myphoto)
  //     .subscribe( () => {
  //         console.log("reading success");
  //         this.getReadings();
  //     }, error => {
  //         console.log(error);
  //       });
  // }

  getReadings(){
    const loading = this.loadingController.create({
      content: "Please wait.."
    });
    loading.present();
    this.authService.getMeterReadings()
      .subscribe(
          (data) => {
            // this.roles = JSON.parse(JSON.parse(data)[0];
          var LOCAL_READINGS: Reading[] = [];
          for (var i of data) {
              LOCAL_READINGS.push(new Reading(i.year,i.month,i.units,i.absUnits,i.photo,i.amount.toString()));
          }
          this.readings = LOCAL_READINGS;
          },
          error => {
          //    console.log(error);
          }
      );
      loading.dismiss();
  }


  getAppConfigurations(){
    const loading = this.loadingController.create({
      content: "Please wait.."
    });
    loading.present();
    this.authService.getAppConfigurations()
            .subscribe(
              (config: configurations) => {
                  if(config){
                    if(config.end_of_month){
                      this.updateAppConfig(config.end_of_month);
                      console.log("Config:isEndOfMonth: "+config.end_of_month);
                    }
                  }
              },
              error => {
                  console.log(error);
              }
          );
    loading.dismiss();
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
    return parseFloat(units).toFixed(2);
  }


  // openCamera() {
  //   const cameraOptions: CameraOptions = {
  //     quality: 50,
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE,
  //   };

  //   this.camera.getPicture(cameraOptions)
  //     .then((imageData) => {
  //       // imageData is either a base64 encoded string or a file URI
  //       // If it's base64:
		
  //       this.myphoto = 'data:image/jpeg;base64,' + imageData;
  //       this.photoNotCaptured = false;
  //     }, (err) => {
  //     // Handle error
  //     console.log("camera error "+err);
	  
  //   });
  // }



}
