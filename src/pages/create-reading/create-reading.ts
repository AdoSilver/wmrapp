import { Component } from '@angular/core';
import { AuthService } from '../login/auth';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NgForm } from '@angular/forms';
import { configurations } from '../register-user/role';



@IonicPage()
@Component({
  selector: 'page-create-reading',
  templateUrl: 'create-reading.html',
})
export class CreateReadingPage {

  public myphoto: string = "https://uploads-ssl.webflow.com/57e5747bd0ac813956df4e96/5aebae14c6d254621d81f826_placeholder.png";
  public isEndOfMonth: boolean = true;
  public endOfMonth: boolean = true;
  public adminEndOfMonth: boolean = true;
  public photoNotCaptured: boolean = true; 
  public isDateValid: boolean = false;
  public costPerUnit: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private authService: AuthService,private camera: Camera,
    private loadingController: LoadingController, private alertController: AlertController ) {
  
    this.verifyPhoneCurrentTime();
    this.getAppConfigurations();
    
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad CreateReadingPage');
      
  }


  onSubmitReading(form: NgForm){
    console.log(form.value);
    let value = form.value.whole_no+"."+form.value.one + form.value.two + form.value.three + form.value.four;
    //checking validity of reading
    let currentValue = parseFloat(value);
    let maxValue: any = this.authService.getMaxUnitsSoFar();
    console.log("ugasho umeendelea"+maxValue);
    if( maxValue <= currentValue){
      //valid reading (proceed)
      let usedUnits = currentValue - maxValue;
      let Amount = usedUnits * this.costPerUnit;
      console.log("Valid Reading: Proceeded");
      const alert = this.alertController.create({
        title: 'Bill Information',
        message: 'This Month <br/> Units used: '+usedUnits.toFixed(4)+'<br/> Cost per Unit(TZS): '+this.costPerUnit+'<br/> Total(TZS): '+Amount.toFixed(2),
        buttons: [
          {
            text: 'Ok',
            role: 'Ok',
            handler: () => {
              console.log('Ok clicked');
              let year = new Date().getUTCFullYear();
              // let month = new Date().getUTCMonth()+1;
              let month = form.value.four;
              console.log("Current Date ",value); 

              if(this.photoNotCaptured){
                this.myphoto = "no_photo";
              }
              this.authService.recordMeterReading(year,month,value,this.myphoto)
              .subscribe( () => {
                  console.log("reading success");
              }, error => {
                  console.log(error);
                });
            }
          }]
          });
          alert.present();
    }else{
      //Invalid reading (Stop)
      const alert = this.alertController.create({
        title: 'Invalid Reading',
        message: 'Current reading cannot be less than previous month reading',
        buttons: [
          {
            text: 'Ok',
            role: 'Ok',
            handler: () => {
              console.log('Ok clicked');
              this.navCtrl.pop();
            }
          }]
          });
          alert.present();
    }
    
  }


  openCamera() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
		
        this.myphoto = 'data:image/jpeg;base64,' + imageData;
        this.photoNotCaptured = false;
      }, (err) => {
      // Handle error
      console.log("camera error "+err);
	  
    });
  }


  verifyPhoneCurrentTime(){
    const loading = this.loadingController.create({
      content: "Please wait.."
    });
    loading.present();
    this.authService.getCurrentTime()
      .subscribe(
        (data) => {
          let year = new Date().getUTCFullYear();
          let month = new Date().getUTCMonth()+1;
          let day = new Date().getUTCDate();
          this.isDateValid = (this.authService.currentYear == year) && (this.authService.currentMonth == month) && (this.authService.currentDay == day);
          loading.dismiss();
          console.log("uleideez "+this.isDateValid);

          //restricting access
          if(this.isDateValid){
            //chill 
          }else{
            const alert = this.alertController.create({
              title: 'Incorrect Date',
              message: 'Your device time might be incorrect, please update it',
              buttons: [
                {
                  text: 'Ok',
                  role: 'Ok',
                  handler: () => {
                    console.log('ok clicked');
                    this.navCtrl.pop();
                  }
                }]
                });
                alert.present();
          }
        },
        error => {
        console.log(error);
        }
    );

  }



  getAppConfigurations(){
    const loading = this.loadingController.create({
      content: "Please wait.."
    });
    loading.present();
    this.authService.getAppConfigurations()
            .subscribe(
              (config: configurations) => {
                this.updateAppConfig(config.cost_per_unit);
                console.log("adminEndOfMonth: "+config.end_of_month);
              },
              error => {
                  console.log(error);
              }
          );
    loading.dismiss();
  }


  private updateAppConfig(costPerUnit: number){
    //OR-Operation for debug testing purposes
    //AND-Operation for development usage purposes
    let day = new Date().getUTCDate();
    this.costPerUnit = costPerUnit;
  }


  

}
