import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateReadingPage } from './create-reading';

@NgModule({
  declarations: [
    CreateReadingPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateReadingPage),
  ],
})
export class CreateReadingPageModule {}
