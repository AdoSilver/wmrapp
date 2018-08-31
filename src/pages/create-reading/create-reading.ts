import { Component, NgZone } from '@angular/core';
import { AuthService } from '../login/auth';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController, normalizeURL, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NgForm } from '@angular/forms';
import { configurations } from '../register-user/role';
import firebase from 'firebase'



@IonicPage()
@Component({
  selector: 'page-create-reading',
  templateUrl: 'create-reading.html',
})
export class CreateReadingPage {

  public myphoto: any;
  public isEndOfMonth: boolean = true;
  public endOfMonth: boolean = true;
  public adminEndOfMonth: boolean = true;
  public photoNotCaptured: boolean = true; 
  public isDateValid: boolean = false;
  public costPerUnit: number = 0;
  public myPhotosRef: any;
  public myPhotoURL: string = "https://uploads-ssl.webflow.com/57e5747bd0ac813956df4e96/5aebae14c6d254621d81f826_placeholder.png";
  public loading: any;
  public isTimeVerified = false;
  public isAppConfigLoaded = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private authService: AuthService,private camera: Camera,
    private loadingController: LoadingController, private alertController: AlertController,
    private zone: NgZone, private toastControl: ToastController) {
    this.loading = this.loadingController.create({
      content: "Please wait.."
    });
    this.loading.present();
    this.verifyPhoneCurrentTime();
    this.getAppConfigurations();

    this.myPhotosRef = firebase.storage().ref('/Photos/');
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
              let month = 8;
              // let month = form.value.four;
              console.log("Current Date ",value); 

              if(this.photoNotCaptured){
                const alert = this.alertController.create({
                  title: 'Error',
                  message: 'Photo not inserted, Please insert photo',
                  buttons: [
                    {
                      text: 'Ok',
                      role: 'Ok',
                      handler: () => {
                        console.log('Ok clicked');
                        //this.navCtrl.pop();
                      }
                    }]
                    });
                    alert.present();
              }else{
                this.authService.recordMeterReading(year,month,value,this.myphoto);
              }

              
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

  choosePhotoSource(){
    const alert = this.alertController.create({
      title: 'Upload photo',
      message: 'Choose your photo location',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'Gallery',
          role: 'galery',
          handler: () => {
            this.selectPhoto();
          }
        }]
        });
        alert.present();
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
		
        this.myphoto = 'data:image/jpeg;base64,'+imageData;
        //this.uploadPhoto();
        this.photoNotCaptured = false;
      }, (err) => {
      // Handle error
      console.log("camera error "+err);
	  
    });
  }


  verifyPhoneCurrentTime(){
    this.authService.getCurrentTime()
      .subscribe(
        (data) => {
          let year = new Date().getUTCFullYear();
          let month = new Date().getUTCMonth()+1;
          let day = new Date().getUTCDate();
          this.isDateValid = (this.authService.currentYear == year) && (this.authService.currentMonth == month) && (this.authService.currentDay == day);
          this.isTimeVerified = true;
          if(this.isAppConfigLoaded){
            this.loading.dismiss();
          }
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
          this.isTimeVerified = true;
          if(this.isAppConfigLoaded){
            this.loading.dismiss();
          }
            const alert = this.alertController.create({
            title: 'Time verification',
            message: error.message,
            buttons: [
              {
                text: 'Ok',
                role: 'ok',
                handler: () => {
                  this.navCtrl.pop();
                }
              }
            ]
          });
          alert.present();
        }
    );
  }



  getAppConfigurations(){
    this.authService.getAppConfigurations()
    .subscribe(
      (config: configurations) => {
        this.updateAppConfig(config.cost_per_unit);
        console.log("adminEndOfMonth: "+config.end_of_month);
        this.isAppConfigLoaded = true;
        if(this.isTimeVerified){
          this.loading.dismiss();
        }
      },
      error => {
        this.isAppConfigLoaded = true;
        if(this.isTimeVerified){
          this.loading.dismis();
        }
          console.log(error);
          const alert = this.alertController.create({
            title: 'User Configiration',
            message: error.message,
            buttons: [
              {
                text: 'Ok',
                role: 'ok',
                handler: () => {
                  this.navCtrl.pop();
                }
              }
            ]
          });
          alert.present();
      }
  );
  
  }


  private updateAppConfig(costPerUnit: number){
    //OR-Operation for debug testing purposes
    //AND-Operation for development usage purposes
    let day = new Date().getUTCDate();
    this.costPerUnit = costPerUnit;
  }


  selectPhoto(): void {
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      this.myphoto = 'data:image/jpeg;base64,'+imageData;
      this.photoNotCaptured = false;
      //this.uploadPhoto();
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }


  // private uploadPhoto(): void {
  //   var imageName = this.generateUUID()+'.png';
  //   var imageRef = this.myPhotosRef+imageName;
  //   this.myPhotosRef.child(imageName)
  //     .putString(this.myphoto, 'base64', { contentType: 'image/png' })
  //     .then((savedPicture) => {
  //       var storageRef = firebase.storage().ref('/Photos/'+imageRef);
  //       storageRef.getDownloadURL().then(function(url) {
  //           this.myPhotoURL = url;
  //       });
  
  //     });
  // }
  
  // private generateUUID(): any {
  //   var d = new Date().getTime();
  //   var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
  //     var r = (d + Math.random() * 16) % 16 | 0;
  //     d = Math.floor(d / 16);
  //     return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  //   });
  //   return uuid;
  // }
  

}
