import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { ReadingListPage } from '../pages/reading-list/reading-list';
import { RegisterUserPage } from '../pages/register-user/register-user';
import { SettingsPage } from '../pages/settings/settings';
import { AuthService } from '../pages/login/auth';
import { HttpModule } from '@angular/http';
import { Camera } from '@ionic-native/camera';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { GooglePlus } from '@ionic-native/google-plus';
import { CreateReadingPage } from '../pages/create-reading/create-reading';

const firebaseConfig = {

}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    ReadingListPage,
    RegisterUserPage,
    SettingsPage,
    CreateReadingPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    ReadingListPage,
    RegisterUserPage,
    SettingsPage,
    CreateReadingPage
  ],
  providers: [
    GooglePlus,
    StatusBar,
    Camera,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
