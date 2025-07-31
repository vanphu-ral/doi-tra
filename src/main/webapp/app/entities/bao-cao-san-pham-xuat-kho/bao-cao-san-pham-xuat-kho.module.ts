import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { SharedModule } from 'app/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { BaoCaoSanPhamXuatKhoComponent } from './bao-cao-san-pham-xuat-kho.component';

const baoCaoSanPhamXuatKhoRoute: Routes = [
  {
    path: '',
    component: BaoCaoSanPhamXuatKhoComponent,
  },
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(baoCaoSanPhamXuatKhoRoute),
    NgxPaginationModule,
    AngularSlickgridModule,
    NgMultiSelectDropDownModule,
  ],
  declarations: [BaoCaoSanPhamXuatKhoComponent],
  exports: [BaoCaoSanPhamXuatKhoComponent],
})
export class BaoCaoSanPhamXuatKhoModule {}
