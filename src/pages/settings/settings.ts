import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { AuthService } from '../login/auth';
import { configurations } from '../register-user/role';
import { NgForm } from '@angular/forms';


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnInit {

  public appConfig: configurations = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private authService: AuthService, private alertController: AlertController, private loadingController: LoadingController) {
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }


  ngOnInit(){
    this.appConfig = this.authService.appConfig;
    console.log(this.appConfig);
  }

  onChangeConfig(form: NgForm){
    const loading = this.loadingController.create({
      content: 'Please wait...'
    });
    loading.present();
    this.authService.updateAppConfigurations(form.value.costPerUnit,form.value.endOfMonth)
    .subscribe( () =>{
        loading.dismiss();
        this.navCtrl.pop();
    }
    , error => {
      loading.dismiss();
      console.log(error);
      this.errorHandler(error.message);
    });;
  }


  errorHandler(errorMessage: string){
    const alert = this.alertController.create({
      title: 'Error Occured',
      message: errorMessage,
      buttons: ['Ok']
    });
    alert.present();
  }


}
