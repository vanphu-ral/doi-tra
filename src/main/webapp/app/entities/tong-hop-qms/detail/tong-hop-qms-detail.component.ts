import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IChiTietSanPhamTiepNhan } from '../tong-hop-qms.model';

@Component({
  selector: 'jhi-tong-hop-qms-detail',
  templateUrl: './tong-hop-qms-detail.component.html',
})
export class TongHopQMSDetailComponent implements OnInit {
  chiTietSanPhamTiepNhan: IChiTietSanPhamTiepNhan | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ chiTietSanPhamTiepNhan }) => {
      this.chiTietSanPhamTiepNhan = chiTietSanPhamTiepNhan;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
