import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { NgForm } from "@Angular/forms";
import { AuthService } from '../login/auth';



@IonicPage()
@Component({
  selector: 'page-register-user',
  templateUrl: 'register-user.html',
})
export class RegisterUserPage {

  public isSupplierChecked: boolean = false;
  public isSubscriberChecked: boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private authService: AuthService, private loadingController: LoadingController, 
    private alertController: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterUserPage');
  }

  onRegister(form: NgForm){
      const ownerEmail = this.authService.getActiveUserEmail();
      const loading = this.loadingController.create({
        content: "Registering user..."
      });
      loading.present();
      this.authService.registerUser(form.value.email).then( data => {
        loading.dismiss();
        console.log(form.value);
        this.authService.recordUserInfo(form.value.name,form.value.email,form.value.phone, form.value.location, form.value.admin, form.value.supplier, form.value.subscriber)
        .subscribe( () =>
          console.log(this.authService.getActiveUser())
        , error => {
          console.log(error);
        });

        //recovering previous active profile
        this.authService.logout();
        this.authService.loginUser(ownerEmail); 

      }).catch(error => {
        const alert = this.alertController.create({
          title: 'Register failed',
          message: error.message,
          buttons: ['Ok']
        });
        alert.present();
        loading.dismiss();
      });
  }

  onSupplierChecked(){
    this.isSupplierChecked = true;
    this.isSubscriberChecked = false;
  }

  onSubscriberChecked(){
    this.isSubscriberChecked = true;
    this.isSupplierChecked = false;
  }


}
