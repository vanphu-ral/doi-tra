import { NgxPrintModule } from 'ngx-print';
import { PhanTichThongTinSanPhamComponent } from './list/phan-tich-thong-tin-san-pham.component';

import { PhanTichMaTiepNhanComponent } from './list/phan-tich-ma-tiep-nhan.component';
import { AngularSlickgridModule, ContainerService } from 'angular-slickgrid';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PhanTichSanPhamComponent } from './list/phan-tich-san-pham.component';
import { PhanTichSanPhamDetailComponent } from './detail/phan-tich-san-pham-detail.component';
import { PhanTichSanPhamUpdateComponent } from './update/phan-tich-san-pham-update.component';
import { PhanTichSanPhamDeleteDialogComponent } from './delete/phan-tich-san-pham-delete-dialog.component';
import { PhanTichSanPhamRoutingModule } from './route/phan-tich-san-pham-routing.module';
import { NavbarComponent } from 'app/layouts/navbar/navbar.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@NgModule({
  imports: [SharedModule, ApolloModule, PhanTichSanPhamRoutingModule, AngularSlickgridModule, NgxPrintModule, QRCodeModule],
  declarations: [
    PhanTichSanPhamComponent,
    PhanTichSanPhamDetailComponent,
    PhanTichSanPhamUpdateComponent,
    PhanTichSanPhamDeleteDialogComponent,
    PhanTichMaTiepNhanComponent,
    PhanTichThongTinSanPhamComponent,
  ],
  entryComponents: [PhanTichSanPhamDeleteDialogComponent],
  providers: [
    ContainerService,
    NavbarComponent,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => ({
        cache: new InMemoryCache(),
        link: httpLink.create({ uri: 'http://192.168.68.61:8081/graphql' }),
      }),
      deps: [HttpLink],
    },
  ],
})
export class PhanTichSanPhamModule {}
