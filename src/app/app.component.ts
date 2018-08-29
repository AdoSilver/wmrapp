import { Component, ViewChild, OnInit } from '@angular/core';
import { Platform, MenuController, NavController, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { RegisterUserPage } from '../pages/register-user/register-user';
import firebase from 'firebase';
import { ReadingListPage } from '../pages/reading-list/reading-list';
import { AuthService } from '../pages/login/auth';
import { CreateReadingPage } from '../pages/create-reading/create-reading';
import { configurations } from '../pages/register-user/role';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
    rootPage: any = LoginPage;
    settingsPage = SettingsPage;
    registerUserPage = RegisterUserPage;
    readingListPage = ReadingListPage;
    createReading = CreateReadingPage;
    isAuthenticated = false;
    isAdmin: boolean = false;
    isReadingPeriod: boolean = false;
    adminIsReadingPeriod: boolean = false;
    @ViewChild('nav') nav: NavController;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, 
      private menuCtrl: MenuController, private authService: AuthService, private loadingController: LoadingController) {
      firebase.initializeApp({
        apiKey: "AIzaSyDK6U2wDD2SPulgpozVVG4C5OyqbaJ0H7I",
         authDomain: "wmr-app2018.firebaseapp.com"
      });
      firebase.auth().onAuthStateChanged(user => {
        if(user){
          this.isAuthenticated = true;
          this.rootPage = this.readingListPage;
          this.authService.ownerEmail = user.email;
          this.authService.loginUser(user.email);
          this.getUsesRoles();
          this.getAppConfigurations();
        }else{
          this.isAuthenticated = false;
          this.rootPage = LoginPage;
        }
      });

      

      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();
      });
    }



    ngOnInit(){
    }



    onLoad(page: any){
      this.nav.push(page);
      this.menuCtrl.close();
    }



    onLogOut(){
      this.authService.logout();
      this.menuCtrl.close();
      this.nav.setRoot(LoginPage);
    }



    getUsesRoles(){
      const loading = this.loadingController.create({
        content: "Please wait.."
      });
      loading.present();
      this.authService.getUserRoles()
        .subscribe(
            (data) => { 
              for (var i of data) {
                if(i.name === "admin"){
                  this.setIsAdmin(true)
                  console.log("userRole-isAdmin: "+this.isAdmin);
                }
                if(i.name === "supplier"){
                  this.setIsAdmin(true)
                  console.log("userRole-isAdmin: "+this.isAdmin);
                }
               }
               
            },
            error => {
                console.log(error);
            }
        );
        loading.dismiss();
    }


    setIsAdmin(isAdmin: boolean){
      this.isAdmin = isAdmin;
    }


    getAppConfigurations(){
      const loading = this.loadingController.create({
        content: "Please wait.."
      });
      loading.present();
      this.authService.getAppConfigurations()
              .subscribe(
                (config: configurations) => {
                  this.updateAppConfig(config.end_of_month);
                  console.log("adminEndOfMonth: "+config.end_of_month);
                },
                error => {
                    console.log(error);
                }
            );
      loading.dismiss();
    }
  
  
    private updateAppConfig(isEndOfMonth: boolean){
      //OR-Operation for debug testing purposes
      //AND-Operation for development usage purposes
      let day = new Date().getUTCDate();
      this.adminIsReadingPeriod = isEndOfMonth;
      this.isReadingPeriod = ((day >= 25) && (day <= 31)) || this.adminIsReadingPeriod;
    }
  

}

