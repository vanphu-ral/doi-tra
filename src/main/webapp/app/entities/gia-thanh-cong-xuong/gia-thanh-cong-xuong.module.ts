import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxPrintModule } from 'ngx-print';
import { GiaThanhCongXuongComponent } from './gia-thanh-cong-xuong.component';

const giaThanhCongXuongRoute: Routes = [
  {
    path: '',
    component: GiaThanhCongXuongComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(giaThanhCongXuongRoute), NgxPaginationModule, AngularSlickgridModule, NgxPrintModule],
  declarations: [GiaThanhCongXuongComponent],
  exports: [GiaThanhCongXuongComponent],
})
export class GiaThanhCongXuongModule {}
