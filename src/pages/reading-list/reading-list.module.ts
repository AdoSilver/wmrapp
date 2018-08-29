import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReadingListPage } from './reading-list';

@NgModule({
  declarations: [
    ReadingListPage,
  ],
  imports: [
    IonicPageModule.forChild(ReadingListPage),
  ],
})
export class ReadingListPageModule {}
