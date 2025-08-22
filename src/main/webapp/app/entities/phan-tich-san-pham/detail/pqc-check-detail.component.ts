import { Component, Input } from '@angular/core';

@Component({
  selector: 'jhi-pqc-check-detail',
  templateUrl: './pqc-check-detail.component.html',
  styleUrls: ['./pqc-check-detail.component.scss'],
})
export class PqcCheckDetailComponent {
  @Input() data: any;
}
