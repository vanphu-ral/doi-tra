import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TongHopQMSComponent } from '../list/tong-hop-qms.component';
import { TongHopQMSDetailComponent } from '../detail/tong-hop-qms-detail.component';
import { TongHopQMSUpdateComponent } from '../update/tong-hop-qms-update.component';
import { TongHopQMSRoutingResolveService } from './tong-hop-qms-routing-resolve.service';

const chiTietSanPhamTiepNhanRoute: Routes = [
  {
    path: '',
    component: TongHopQMSComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TongHopQMSDetailComponent,
    resolve: {
      chiTietSanPhamTiepNhan: TongHopQMSRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TongHopQMSUpdateComponent,
    resolve: {
      chiTietSanPhamTiepNhan: TongHopQMSRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TongHopQMSUpdateComponent,
    resolve: {
      chiTietSanPhamTiepNhan: TongHopQMSRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(chiTietSanPhamTiepNhanRoute)],
  exports: [RouterModule],
})
export class TongHopQMSRoutingModule {}
