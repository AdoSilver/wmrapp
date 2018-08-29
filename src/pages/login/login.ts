import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { NgForm } from "@Angular/forms";
import { AuthService } from './auth';
import firebase from 'firebase';
import { GooglePlus } from '@ionic-native/google-plus';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  userProfile: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private authService: AuthService, private loadingController: LoadingController,
  private alertController: AlertController, private googlePlus: GooglePlus) {


    firebase.auth().onAuthStateChanged( user => {
      if (user){
        this.userProfile = user;
      } else { 
          this.userProfile = null;
      }
    });
  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }


  

  onGoogleBtnPressed(){
    this.googleLogin();
  }




  onLogin(form: NgForm){
    this.loginProcess(form.value.email);
  }





  googleLogin(): Promise<any> {
    return new Promise((resolve, reject) => { 
        this.googlePlus.login({
          'webClientId': '516380198970-j86ia1geh3qu8qbo2kvp2abpf43c1er5.apps.googleusercontent.com',
          'offline': true
        }).then( res => {
                const googleCredential = firebase.auth.GoogleAuthProvider
                    .credential(res.idToken);
                    this.loginProcess(res.email);
        }, err => {
            // console.error("Error: ", err)
            // reject(err);
        });
      });
      }





    private loginProcess(email: string){
      const loading = this.loadingController.create({
        content: "Loggin in.."
      });
      loading.present();
      this.authService.loginUser(email).then(data => {
        console.log(data);
        loading.dismiss();
      }).catch(error => {
        console.log(error);
        const alert = this.alertController.create({
          title: 'Login failed',
          message: error.message,
          buttons: ['Ok']
        });
        alert.present();
        loading.dismiss();
      });
    }




}
 