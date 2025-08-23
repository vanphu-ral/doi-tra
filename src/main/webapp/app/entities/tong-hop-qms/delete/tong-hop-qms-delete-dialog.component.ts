import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IChiTietSanPhamTiepNhan } from '../tong-hop-qms.model';
import { TongHopQMSService } from '../service/tong-hop-qms.service';

@Component({
  templateUrl: './tong-hop-qms-delete-dialog.component.html',
})
export class TongHopQMSDeleteDialogComponent {
  chiTietSanPhamTiepNhan?: IChiTietSanPhamTiepNhan;

  constructor(protected chiTietSanPhamTiepNhanService: TongHopQMSService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.chiTietSanPhamTiepNhanService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
