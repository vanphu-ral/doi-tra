import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TongHopQMSComponent } from './list/tong-hop-qms.component';
import { TongHopQMSDetailComponent } from './detail/tong-hop-qms-detail.component';
import { TongHopQMSUpdateComponent } from './update/tong-hop-qms-update.component';
import { TongHopQMSDeleteDialogComponent } from './delete/tong-hop-qms-delete-dialog.component';
import { TongHopQMSRoutingModule } from './route/tong-hop-qms-routing.module';
import { AngularSlickgridModule, ContainerService } from 'angular-slickgrid';
import { RowDetailViewComponent } from '../don-bao-hanh/list/rowdetail-view.component';
import { ChiTietBaoCaoTongHopComponent } from './list/chi-tiet-bao-cao-tong-hop.component';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@NgModule({
  imports: [SharedModule, ApolloModule, TongHopQMSRoutingModule, AngularSlickgridModule],
  declarations: [
    TongHopQMSComponent,
    TongHopQMSDetailComponent,
    TongHopQMSUpdateComponent,
    TongHopQMSDeleteDialogComponent,
    ChiTietBaoCaoTongHopComponent,
  ],
  entryComponents: [TongHopQMSDeleteDialogComponent],
  providers: [
    ContainerService,
    RowDetailViewComponent,
    ChiTietBaoCaoTongHopComponent,
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
export class TongHopQMSModule {}
