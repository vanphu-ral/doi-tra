import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChiTietSanPhamTiepNhan, ChiTietSanPhamTiepNhan } from '../tong-hop-qms.model';
import { TongHopQMSService } from '../service/tong-hop-qms.service';

@Injectable({ providedIn: 'root' })
export class TongHopQMSRoutingResolveService implements Resolve<IChiTietSanPhamTiepNhan> {
  constructor(protected service: TongHopQMSService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IChiTietSanPhamTiepNhan> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((chiTietSanPhamTiepNhan: HttpResponse<ChiTietSanPhamTiepNhan>) => {
          if (chiTietSanPhamTiepNhan.body) {
            return of(chiTietSanPhamTiepNhan.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new ChiTietSanPhamTiepNhan());
  }
}
