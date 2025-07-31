import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SanPhamXuatKhoComponent } from './san-pham-xuat-kho.component';

const sanPhamXuatKhoRoute: Routes = [
  {
    path: '',
    component: SanPhamXuatKhoComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(sanPhamXuatKhoRoute), NgxPaginationModule, AngularSlickgridModule],
  declarations: [SanPhamXuatKhoComponent],
  exports: [SanPhamXuatKhoComponent],
})
export class SanPhamXuatKhoModule {}
