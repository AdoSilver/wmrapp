import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../login/auth';

@IonicPage()
@Component({
  selector: 'page-register-user',
  templateUrl: 'register-user.html'
})
export class RegisterUserPage {
  public isSupplierChecked: boolean = false;
  public isSubscriberChecked: boolean = false;
  public isAdminChecked: boolean = false;
  public loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterUserPage');
  }

  onRegister(form: NgForm) {
    const ownerEmail = this.authService.getActiveUserEmail();
    this.loading = this.loadingController.create({
      content: 'Registering user...'
    });
    this.loading.present();

    this.authService
      .registerUser(form.value.email)
      .then(data => {
        //if firebase authentication registration is successful
        console.log('UBISHI: ' + JSON.stringify(form.value));
        this.authService
          .recordUserInfo(
            form.value.name,
            form.value.email,
            form.value.phone,
            form.value.location,
            form.value.admin,
            form.value.supplier,
            form.value.subscriber
          )
          .subscribe(
            data => {
              this.loading.dismiss();
              const alert = this.alertController.create({
                title: 'Process',
                message: 'User was registered successful',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'ok',
                    handler: () => {
                      //Recovering previous user profile
                      this.authService.logout();
                      this.authService
                        .loginUser(ownerEmail)
                        .then(data => {
                          this.navCtrl.setRoot('ReadingListPage');
                          console.log(data);
                        })
                        .catch(error => {
                          console.log(error);
                        });
                    }
                  }
                ]
              });
              alert.present();
            },
            error => {
              console.log(error);
              this.loading.dismiss();
              const alert = this.alertController.create({
                title: 'Register failed',
                message: error.message,
                buttons: ['Ok']
              });
              alert.present();

              //recovering previous active profile
              this.authService.logout();
              this.authService
                .loginUser(ownerEmail)
                .then(data => {
                  // this.navCtrl.setRoot(ReadingListPage);
                  console.log(data);
                })
                .catch(error => {
                  console.log(error);
                });
            }
          );
      })
      .catch(error => {
        this.loading.dismiss();
        const alert = this.alertController.create({
          title: 'Register failed',
          message: error.message,
          buttons: ['Ok']
        });
        alert.present();
      });
  }

  onSupplierChecked() {
    this.isSupplierChecked = true;
    this.isSubscriberChecked = false;
  }

  onSubscriberChecked() {
    this.isSubscriberChecked = true;
    this.isSupplierChecked = false;
  }

  onAdminChecked() {
    this.isAdminChecked = !this.isAdminChecked;
  }
}
