import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faArrowRotateForward, faDownload, faFileExport, faUpload } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularGridInstance, Column, FieldType, Filters, Formatter, GridOption, OnEventArgs } from 'angular-slickgrid';
import { AccountService } from 'app/core/auth/account.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'jhi-san-pham-xuat-kho',
  templateUrl: './san-pham-xuat-kho.component.html',
  styleUrls: ['./san-pham-xuat-kho.component.scss'],
})
export class SanPhamXuatKhoComponent implements OnInit {
  danhSachXuatKhoUrl = this.applicationConfigService.getEndpointFor('api/danh-sach-nhap-khos');
  chiTietXuatKhoUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-xuat-khos');
  title = 'Thống kê danh sách các lần xuất kho';

  faUpload = faUpload;
  faArrowRotateForward = faArrowRotateForward;
  faDownload = faDownload;
  faFileExport = faFileExport;

  predicate!: string;
  ascending!: boolean;
  isLoading = false;
  popupThemMoi = false;
  popupChiTiet = false;
  popupEdit = false;
  isModalOpenConfirmDuplicate = false;
  isModalOpenConfirmUploadSuccess = false;

  columnDefinitions: Column[] = [];
  gridOption: GridOption = {};
  angularGrid?: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  excelData: any;

  danhSachXuatKho: any[] = [];
  chiTietXuatKho: any[] = [];
  listOfChiTietDanhSachXuatKho: any[] = [];
  danhSachXuatKhoChiTiet: any = {};

  danhSachSanPhamXuatKho: any;

  listOfXuatKho: {
    type: string;
    id: number | null;
    month: number | undefined;
    year: number | undefined;
    numberOfUpdate: number;
    timeUpdate: string;
    user: '';
    chiTietXuatKho: any;
  } = {
    type: '',
    id: null,
    month: 0,
    year: 0,
    numberOfUpdate: 0,
    timeUpdate: '',
    user: '',
    chiTietXuatKho: [],
  };

  dataExcel: {
    idSanPham: string;
    idKhachHang: string;
    tenKhachHang: string;
    quantity: string;
    quantityAvailable: string;
    quantityNotAvailable: string;
  }[] = [];

  dataExcelData: {
    idSanPham: string;
    idKhachHang: string;
    tenKhachHang: string;
    quantity: string;
    quantityAvailable: string;
    quantityNotAvailable: string;
  }[] = [];

  public time = Date.now();
  currentDate: Date = new Date();
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();

  account: any;
  yearForm: FormGroup;

  // @Input() month: number | undefined
  // @Input() year: number | undefined
  month!: number;
  year!: number;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
    protected accountService: AccountService,
    protected fb: FormBuilder
  ) {
    this.yearForm = this.fb.group({
      year: [this.currentYear, [Validators.required, Validators.pattern(/^\d{4}$/)]],
    });
  }

  get yearControl() {
    return this.yearForm.get('year');
  }

  loadAll(): void {
    this.isLoading = true;
    this.http.get<any>(this.danhSachXuatKhoUrl).subscribe(res => {
      this.danhSachXuatKho = res;
      // console.log(res);
    });
  }

  buttonView: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button ></button>`
      : { text: '<button class=" btn btn-primary fa fa-eye" style="height: 28px; line-height: 14px" title="Xem chi tiết"></button>' };

  buttonEdit: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-success fa fa-pencil" style="height: 28px; line-height: 14px; width: 15px">Chỉnh sửa</button>`
      : {
          text: '<button class="btn btn-success fa fa-pencil" style="height: 28px; line-height: 14px" title="Chỉnh sửa"></button>',
        };

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.account = account;
      // console.log('acc', this.account);
    });
    if (!this.month) {
      const currentMonth = new Date().getMonth() + 1;
      this.month = currentMonth;
      // console.log('month', this.month);
    }
    this.year = new Date().getFullYear();
    // console.log('year', this.year);
    this.http.get<any>(this.danhSachXuatKhoUrl).subscribe(res => {
      this.danhSachXuatKho = res;
      // console.log(res);
    });
    this.columnDefinitions = [
      {
        id: 'id',
        name: 'STT',
        field: 'id',
        minWidth: 20,
      },
      {
        id: 'month',
        name: 'Tháng',
        field: 'month',
        sortable: true,
        filterable: true,
        minWidth: 100,
        filter: {
          placeholder: 'Tìm kiếm',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'year',
        name: 'Năm',
        field: 'year',
        sortable: true,
        filterable: true,
        minWidth: 100,
        type: FieldType.string,

        filter: {
          placeholder: 'Tìm kiếm',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'user',
        name: 'Người cập nhật',
        field: 'user',
        sortable: true,
        filterable: true,
        minWidth: 150,
        type: FieldType.string,

        filter: {
          placeholder: 'Tìm kiếm',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'timeCreate',
        name: 'Thời gian tạo file',
        field: 'timeCreate',
        sortable: true,
        filterable: true,
        minWidth: 60,
        type: FieldType.string,

        filter: {
          placeholder: 'Tìm kiếm',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'timeUpdate',
        name: 'Thời gian cập nhật',
        field: 'timeUpdate',
        sortable: true,
        filterable: true,
        minWidth: 120,
        type: FieldType.string,

        filter: {
          placeholder: 'Tìm kiếm',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'view',
        field: 'view',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonView,
        maxWidth: 55,
        minWidth: 55,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.openPopupChiTiet();
          this.showData(args.dataContext.id);
          this.danhSachXuatKhoChiTiet = args.dataContext;
          // console.log('check', this.danhSachXuatKhoChiTiet);
        },
      },
    ];
    this.gridOption = {
      enableAutoResize: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      enableAutoSizeColumns: true,
      asyncEditorLoadDelay: 2000,
      enableCellNavigation: true,
      gridHeight: 620,
      gridWidth: '100%',
      // autoFitColumnsOnFirstLoad: true,
      // asyncEditorLoading: true,
      // forceFitColumns: false,
      presets: {
        columns: [
          { columnId: 'id' },
          { columnId: 'month' },
          { columnId: 'year' },
          { columnId: 'user' },
          { columnId: 'timeCreate' },
          { columnId: 'timeUpdate' },
          { columnId: 'view' },
        ],
      },
    };
  }

  formatDate(date: Date): any {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateResultFormat = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
    return dateResultFormat;
  }

  openPopupThemMoi(): void {
    this.popupThemMoi = true;
  }

  closePopupThemMoi(): void {
    this.popupThemMoi = false;
  }

  openPopupChiTiet(): void {
    this.popupChiTiet = true;
  }

  closePopupChiTiet(): void {
    this.popupChiTiet = false;
  }

  openPopupEdit(): void {
    this.popupEdit = true;
    this.listOfXuatKho.numberOfUpdate = this.danhSachXuatKhoChiTiet.numberOfUpdate;
  }

  closePopupEdit(): void {
    this.popupEdit = false;
  }

  confirmDuplicate(): void {
    this.isModalOpenConfirmDuplicate = false;
  }

  closeModalConfirmDuplicate(): void {
    this.isModalOpenConfirmDuplicate = false;
  }

  confirmCancelUploadSuccess(): void {
    this.isModalOpenConfirmUploadSuccess = false;
  }

  closeModalConfirmUploadSuccess(): void {
    this.isModalOpenConfirmUploadSuccess = false;
  }

  angularGridReady(angularGrid: any): void {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
    // setInterval(()=>{
    this.dataViewObj = angularGrid.dataView;
    // console.log('onGridMenuColumnsChanged11111', this.angularGrid);
    // },1000)
  }

  handleOnBeforePaginationChange(e: any): boolean {
    // e.preventDefault();
    // return false;
    return true;
  }

  showData(id: number | undefined): void {
    // this.listOfChiTietDanhSachXuatKho = [];
    this.http.get<any>(`${this.chiTietXuatKhoUrl}/${id as number}`).subscribe(res => {
      this.chiTietXuatKho = res;
      // console.log('chi tiet 1', this.chiTietXuatKho);
    });
  }

  readExcel(event: any): void {
    this.excelData = [];
    this.isLoading = true;
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = e => {
      const workBook = XLSX.read(fileReader.result, { type: 'binary' });
      const sheetNames = workBook.SheetNames;
      this.excelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]], {
        header: ['idSanPham', 'idKhachHang', 'tenKhachHang', 'quantity', 'quantityAvailable', 'quantityNotAvailable', 'id'],
        defval: '',
      });
      // console.log('sheetNames', workBook.SheetNames)
    };
    setTimeout(() => {
      // console.log('check kq', this.excelData);
      this.listOfXuatKho.chiTietXuatKho = this.excelData;
      this.listOfXuatKho.chiTietXuatKho = this.listOfXuatKho.chiTietXuatKho.filter((item: any) => item.quantity !== 'Tổng số lượng');
      // console.log('chi tiet 2', this.listOfXuatKho.chiTietXuatKho);
    }, 1000);
  }

  createForm(type: string): void {
    this.listOfXuatKho.type = type;
    if (type === 'update') {
      this.listOfXuatKho.id = this.danhSachXuatKhoChiTiet.id;
    }
    this.listOfXuatKho.numberOfUpdate += 1;
    this.listOfXuatKho.timeUpdate = this.formatDate(this.currentDate);
    this.listOfXuatKho.user = this.account.login;
    this.listOfXuatKho.month = this.month;
    this.listOfXuatKho.year = this.year;
    // if (this.listOfXuatKho.month === this.danhSachXuatKhoChiTiet.month &&
    //   this.listOfXuatKho.year === this.danhSachXuatKhoChiTiet.year) {
    //   this.isModalOpenConfirmDuplicate = true;
    //   console.log('thang va nam bi trung')
    //   return
    // }

    const isDuplicate = this.danhSachXuatKho.some(item => item.month === this.month && item.year === this.year);
    if (isDuplicate) {
      alert('Tháng và năm này đã tồn tại. Vui lòng chọn tháng hoặc năm khác.');
      return;
    }

    if (this.yearForm.valid) {
      // console.log('form data is valid', this.yearForm.value);
    } else {
      // console.log('form data is invalid', this.yearForm.value);
    }
    setTimeout(() => {
      this.http.post<any>(this.chiTietXuatKhoUrl, this.listOfXuatKho).subscribe(res => {
        // console.log('cac truong thong tin tra ve BE', this.listOfXuatKho);
        if (type === 'insert') {
          // console.log('them moi thanh cong', res);
        } else if (type === 'update') {
          // console.log('update thanh cong', res);
        }
      });
    }, 2000);
  }

  checkDuplicateTime(): void {
    const selectedMonth = this.month.toString();
    const selectedYear = this.yearForm.get('year')?.value.toString();
    let duplicate = false;
    for (let i = 0; i < this.danhSachXuatKho.length; i++) {
      if (this.danhSachXuatKho[i].month === selectedMonth && this.danhSachXuatKho[i].year === selectedYear) {
        duplicate = true;
      }
    }

    setTimeout(() => {
      if (duplicate) {
        this.isModalOpenConfirmDuplicate = true;
      } else {
        this.isModalOpenConfirmDuplicate = false;
      }
      // console.log('duplicate month and year', duplicate)
    }, 50);
  }

  getExportExcel(): void {
    this.dataExcel = [
      {
        idSanPham: '',
        idKhachHang: '',
        tenKhachHang: '',
        quantity: '',
        quantityAvailable: '',
        quantityNotAvailable: '',
      },
    ];
    const item = {
      idSanPham: '',
      idKhachHang: '',
      tenKhachHang: '',
      quantity: '',
      quantityAvailable: '',
      quantityNotAvailable: '',
    };
    this.dataExcel = [item, ...this.dataExcel];
    this.exportExcel();
    // console.log('gia tri', this.dataExcel);
  }

  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_json(ws, this.dataExcel, { origin: 'B1', skipHeader: true });
    const mergeRange = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 0, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 0, c: 5 } },
    ];
    ws['!merges'] = mergeRange;
    ws['A1'] = { t: 's', v: 'Mã hàng hoá' };
    ws['B1'] = { t: 's', v: 'Mã khách hàng' };
    ws['C1'] = { t: 's', v: 'Tên khách hàng' };
    ws['D1'] = { t: 's', v: 'Tổng số lượng' };
    ws['E1'] = { t: 's', v: 'Số lượng đã lên HĐ + Trả hàng' };
    ws['F1'] = { t: 's', v: 'SL chưa lên' };

    const headerStyle = {
      font: { bold: true },
      aligment: { horizontal: 'center', vertical: 'center' },
    };
    // console.log('merge', mergeRange);

    const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'];
    headers.forEach(header => {
      ws[header].s = headerStyle;
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu báo cáo tổng hợp xuất kho');
    XLSX.writeFile(wb, 'Mẫu báo cáo tổng hợp xuất kho.xlsx');
  }

  getExportExcelData(): void {
    this.dataExcelData = [];

    setTimeout(() => {
      for (let i = 0; i < this.chiTietXuatKho.length; i++) {
        const dataArrange = {
          idSanPham: this.chiTietXuatKho[i].idSanPham,
          idKhachHang: this.chiTietXuatKho[i].idKhachHang,
          tenKhachHang: this.chiTietXuatKho[i].tenKhachHang,
          quantity: this.chiTietXuatKho[i].quantity,
          quantityAvailable: this.chiTietXuatKho[i].quantityAvailable,
          quantityNotAvailable: this.chiTietXuatKho[i].quantityNotAvailable,
        };
        this.dataExcelData.push(dataArrange);
        // console.log('check', this.dataExcelData);
      }
      this.exportExcelData();
    }, 1000);
  }

  exportExcelData(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_json(ws, this.dataExcelData, { origin: 'A2', skipHeader: true });
    const mergeRange = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 0, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 0, c: 5 } },
    ];
    ws['!merges'] = mergeRange;
    ws['A1'] = { t: 's', v: 'Mã hàng hoá' };
    ws['B1'] = { t: 's', v: 'Mã khách hàng' };
    ws['C1'] = { t: 's', v: 'Tên khách hàng' };
    ws['D1'] = { t: 's', v: 'Tổng số lượng' };
    ws['E1'] = { t: 's', v: 'Số lượng đã lên HĐ + Trả hàng' };
    ws['F1'] = { t: 's', v: 'SL chưa lên' };

    const headerStyle = {
      font: { bold: true },
      aligment: { horizontal: 'center', vertical: 'center' },
    };
    // console.log('merge', mergeRange);

    const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'];
    headers.forEach(header => {
      ws[header].s = headerStyle;
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tổng hợp xuất kho theo tháng');
    XLSX.writeFile(wb, 'Tổng hợp xuất kho theo tháng.xlsx');
  }
}
