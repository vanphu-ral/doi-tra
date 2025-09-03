import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IChiTietSanPhamTiepNhan } from '../tong-hop-qms.model';
import { TongHopQMSService } from '../service/tong-hop-qms.service';
import { TongHopQMSDeleteDialogComponent } from '../delete/tong-hop-qms-delete-dialog.component';
import { AngularGridInstance, Column, ExternalResource, FieldType, Filters, Formatters, GridOption } from 'angular-slickgrid';
import { ExcelExportService } from '@slickgrid-universal/excel-export';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { GET_WORK_ORDER_BY_LOT } from '../service/tong-hop-qms.service.graphql';
import * as XLSX from 'xlsx';
import { faFileAlt, faList, faEye, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { Apollo } from 'apollo-angular';
import { saveAs } from 'file-saver';

interface LotSummary {
  lot: string;
  bomErrors: any[];
  testNVL: any[];
  scan100Pass: any[];
  returnDay: string;
  totalQty: number;
}
interface ItemSummary {
  itemName: string;
  partNumber: string;
  totalLots: number;
  totalQty: number;
  totalBomErr: number;
  totalFixErr: number;
}

interface LotDetail {
  lot: string;
  itemName?: string;
  partNumber?: string;
  totalQty?: number;
  vendor?: string;
  checkDate?: string;
  conclude?: string;
}
interface TestNVL {
  note?: string;
  itemName: string;
  sampleQuantity: number;
  regulationCheck: string;
  allowResult: number;
  realResult: number;
  paramMin: number;
  paramMax: number;
  checkDate: string;
  returnDay: string;
  unit: string;
  [key: string]: any;
}
interface Scan100PassItem {
  stt: number;
  tenSanPham: string;
  lotNumber: string;
  vendor: string;
  partNumber: string;
  sap: string;
  username: string;
  tenNhanVienPhanTich: string;
  ngayKiemTra: string;
  qr: string;
  material?: string;
  user_check?: string;
  reason?: string;
  createdAt?: string;
}
export interface TongHopResponse {
  maTiepNhan: string;
  ngayTiepNhan: string;
  nhanVienGiaoHang: string;
  nhomKhachHang: string;
  tenKhachHang: string;
  soLuongKhachGiao: number;
  tongSoLuong: number;
  lotNumber: string;
  serial: string;
  tenSanPham: string;
}

interface SummaryRow {
  stt: number;
  maLot: string;
  maTiepNhan: string;
  ngayTiepNhan: string;
  nhanVienGiao: string;
  nhomKhachHang: string;
  tenKhachHang: string;
  soLuongKhachGiao: number;
  soLuongThucNhan: number;
  tongSoLoSanXuat: number;
}
@Component({
  selector: 'jhi-tong-hop-qms',
  templateUrl: './tong-hop-qms.component.html',
  styleUrls: ['./tong-hop-qms.component.scss'],
})
export class TongHopQMSComponent implements OnInit {
  tongHopUrl = this.applicationConfigService.getEndpointFor('api/tong-hop');
  searchDateUrl = this.applicationConfigService.getEndpointFor('api/search-date');
  tongHopCaculateUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-caculate');
  tongHopDBHUrl = this.applicationConfigService.getEndpointFor('api/thong-tin-don-bao-hanh');
  sanPhamDBHUrl = this.applicationConfigService.getEndpointFor('api/san-pham-don-bao-hanh2');
  phanLoaiSanPhamUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-phan-loai-san-pham');
  tongHopNewUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-new');
  chiTietSanPhamTiepNhans?: IChiTietSanPhamTiepNhan[];
  popupViewCTL = false;
  faFileAlt = faFileAlt;
  faList = faList;
  faEye = faEye;
  faFileExport = faFileExport;
  isLoading = false;
  columnDefinitions: Column[] = [];
  conlumDefinitionCTL: Column[] = [];
  gridOptions: GridOption = {};
  gridOptionCTL: GridOption = {};
  angularGrid!: AngularGridInstance;
  gridObj: any;
  lotSummaries: LotSummary[] = [];
  scannedLot = '';
  lotList: string[] = [];
  dataViewObj: any;
  chiTietSanPhamTiepNhan: any[] = [];
  chiTietSanPhamTiepNhanGoc: any[] = [];
  chiTietSanPhamTiepNhanCTL: ITongHop[] = [];
  chiTietSanPhamTiepNhanCTLGoc: ITongHop[] = [];
  chiTietSanPhamTiepNhanExport: IChiTietSanPhamTiepNhan[] = [];
  excelExportService: ExcelExportService;

  //bien chua thong tin ngay mac dinh
  dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
  fileName = 'bao-cao-doi-tra';
  fileNameCT = 'thong-tin-phan-tich-don-bao-hanh';

  dataSearch: {
    maTiepNhan: string;
    nhanVienGiaoHang: string;
    tenKhachHang: string;
    nhomKhachHang: string;
    tinhThanh: string;
    tenSanPham: string;
    tenNganh: string;
    tenChungLoai: string;
    tenNhomSanPham: string;
  } = {
    maTiepNhan: '',
    nhanVienGiaoHang: '',
    tenKhachHang: '',
    nhomKhachHang: '',
    tinhThanh: '',
    tenSanPham: '',
    tenNganh: '',
    tenChungLoai: '',
    tenNhomSanPham: '',
  };
  data: {
    maTiepNhan?: string;
    maKhachHang?: string;
    tenKhachHang?: string;
    nhomKhachHang?: string;
    tinhThanh?: string;
    ngayTaoDon?: string;
    tongTiepNhan?: string;
    ngayTiepNhan?: Date;
    ngayTraBienBan?: Date;
    nguoiTaoDon?: string;
    nhanVienGiaoHang?: string;
    trangThai?: string;
  }[] = [];

  dataSP: {
    donBaoHanhId?: number;
    maTiepNhan?: string;
    idSPTN?: number;
    tenSanPham?: string;
    tenNganh?: string;
    tenChungLoai?: string;
    tenNhomSanPham?: string;
    nhomSPTheoCongSuat?: string;
    phanLoaiSP: string;
    slTiepNhan?: number;
    trangThai?: string;
  }[] = [];

  dataCT: {
    idSPTN?: number;
    donBaoHanhId?: number;
    maTiepNhan?: string;
    phanLoaiSP?: string;
    soLuongPL?: number;
  }[] = [];

  dataExcel: {
    tenSanPham: string;
    nganh: string;
    sanPham: string;
    nhomSanPham: string;
    chungLoai: string;
    nhomSanPhamTheoCongSuat: string;
    tongDoiTra: number;
    soLuongXuatKho: number;
    tongLoi: number;
    tongLoiKyThuat: number;
    tongLoiLinhDong: number;
    tiLeDoiTraLoiKyThuat: number;
    tiLeDoiTraLoiLinhDong: number;
    tiLeDoiTra: number;
    tiLePPMDoiTra: number;
    loi1: number;
    loi2: number;
    loi3: number;
    loi4: number;
    loi5: number;
    loi6: number;
    loi7: number;
    loi8: number;
    loi9: number;
    loi10: number;
    loi11: number;
    loi12: number;
    loi13: number;
    loi14: number;
    loi15: number;
    loi16: number;
    loi17: number;
    loi18: number;
    loi19: number;
    loi20: number;
    loi21: number;
    loi22: number;
    loi23: number;
    loi24: number;
    loi25: number;
    loi26: number;
    loi27: number;
    loi28: number;
    loi29: number;
    loi30: number;
    loi31: number;
    loi32: number;
    loi33: number;
    loi34: number;
    loi35: number;
    loi36: number;
    loi37: number;
    loi38: number;
    loi39: number;
  }[] = [];

  startDates = '';
  endDates = '';
  selectedLot?: string;
  itemsInLot: ItemSummary[] = [];
  filterMaterial = '';
  filterDate = '';
  filterLot = '';
  searchTerms = {
    lotNumber: '',
    maTiepNhan: '',
    ngayTiepNhan: '',
    nhanVienGiaoHang: '',
    nhomKhachHang: '',
    tenKhachHang: '',
  };
  filteredData: any[] = [];
  saveLOT = '';
  //phân trang chính
  qmsPage = 1;
  qmsPageSize = 20;
  pagedData: any[] = [];
  // Test NVL
  testNVLPage = 1;
  testNVLPageSize = 20;

  // Scan100 Pass
  scan100Page = 1;
  scan100PageSize = 20;

  // Sản phẩm trong LOT
  itemsPage = 1;
  itemsPageSize = 20;

  // LOT theo vật tư
  lotsPage = 1;
  lotsPageSize = 20;
  Math = Math;
  listOfSanPhamTrongDialog: any[] = [];
  baoCaoVatTuList: SummaryRow[] = [];
  detailLotList: TongHopResponse[] = [];
  rawData: TongHopResponse[] = [];
  lotMessage!: string;
  selectedItem?: ItemSummary;
  lotsOfItem: LotDetail[] = [];
  dataCTL: ITongHop[] = [];
  selectedLotItems: TongHopResponse[] = [];
  selectedMaTiepNhan!: string;
  currentLotNumber = '';
  selectedLotDetail: (LotSummary & { checkNVL: any[] }) | null = null;
  @ViewChild('detailModal', { static: true }) detailModalTpl: TemplateRef<any> | undefined;
  @ViewChild('itemSummaryModal', { static: true }) itemSummaryModal!: TemplateRef<any>;
  @ViewChild('scanLotModal', { static: true }) scanLotModal!: TemplateRef<any>;
  @ViewChild('lotListModal', { static: true }) lotListModal!: TemplateRef<any>;
  constructor(
    protected chiTietSanPhamTiepNhanService: TongHopQMSService,
    protected modalService: NgbModal,
    protected applicationConfigService: ApplicationConfigService,
    protected http: HttpClient,
    protected apollo: Apollo,
    protected cdr: ChangeDetectorRef
  ) {
    this.excelExportService = new ExcelExportService();
  }

  loadAll(): void {
    this.isLoading = true;
    // console.log("checkdate:",this.dateTimeSearchKey)
    this.chiTietSanPhamTiepNhanService.query().subscribe({
      next: (res: HttpResponse<IChiTietSanPhamTiepNhan[]>) => {
        this.isLoading = false;
        this.chiTietSanPhamTiepNhans = res.body ?? [];
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  startDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-01`;
  }
  endDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.startDates = today.replace(/(\d{4}-\d{2})-\d{2}/, '$1-01');
    this.endDates = today;
    const savedLots = sessionStorage.getItem('lotList');
    const savedSummaries = sessionStorage.getItem('lotSummaries');

    this.lotList = savedLots ? JSON.parse(savedLots) : [];
    this.lotSummaries = savedSummaries ? JSON.parse(savedSummaries) : [];

    if (this.lotList.length && !this.lotSummaries.length) {
      this.fetchAllLots();
    }

    this.cdr.detectChanges();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.changeDate();
    });
  }

  dataShow(): void {
    const lotRequests = this.lotList.map((lot, index) =>
      this.apollo
        .query({
          query: GET_WORK_ORDER_BY_LOT,
          variables: { lotNumber: lot },
        })
        .toPromise()
        .then(({ data }: any) => {
          const info = data.qmsToDoiTraInfoByLotNumber;
          const checkTest = Array.isArray(info.pqcCheckTestNVL) ? info.pqcCheckTestNVL[0] : {};
          const checkNVL = Array.isArray(info.pqcCheckNVL) ? info.pqcCheckNVL[0] : {};
          const scanPass = Array.isArray(info.pqcScan100Pass) ? info.pqcScan100Pass[0] : {};

          const bomErrorQty = Array.isArray(info.pqcBomErrorDetail)
            ? info.pqcBomErrorDetail.reduce((sum: number, err: any) => sum + Number(err.quantity || 0), 0)
            : 0;

          const fixErrorQty = Array.isArray(info.pqcFixErr)
            ? info.pqcFixErr.reduce((sum: number, err: any) => sum + Number(err.quantityErr || 0), 0)
            : 0;

          return {
            id: index + 1,
            lot: lot,
            itemName: checkTest?.itemName,
            partNumber: checkTest?.partNumber,
            vendor: checkTest?.vendor,
            manufactureDate: checkTest?.manufactureDate,
            checkDate: checkTest?.checkDate,
            checkPerson: checkNVL?.CheckPerson,
            conclude: checkNVL?.conclude,
            qty: Number(checkTest?.qty || checkTest?.sampleQuantity),
            bomErrorQty,
            fixErrorQty,
            realResult: checkTest?.realResult,
            allowResult: checkTest?.allowResult,
            regulationCheck: checkTest?.regulationCheck,
            rankAp: checkTest?.rankAp,
            rankMau: checkTest?.rankMau,
            rankQuang: checkTest?.rankQuang,
            qr: scanPass?.qr,
            machine: scanPass?.machine,
            note: checkTest?.note || checkNVL?.note,
          };
        })
    );

    Promise.all(lotRequests).then(rows => {
      this.chiTietSanPhamTiepNhan = [...rows];
      console.log('✅ Dữ liệu bảng:', this.chiTietSanPhamTiepNhan);
    });
  }

  getTongHopUrl(): void {
    this.http.get<any>(this.tongHopUrl).subscribe(res => {
      this.chiTietSanPhamTiepNhanCTLGoc = res.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      for (let i = 0; i < this.chiTietSanPhamTiepNhanCTLGoc.length; ++i) {
        this.chiTietSanPhamTiepNhanCTLGoc[i].id = i + 1;
      }
      this.dataCTL = res.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc;
      // console.log('tong Hop', this.dataCTL);
    });
    this.http.get<any>(this.tongHopCaculateUrl).subscribe(resTongHop => {
      this.chiTietSanPhamTiepNhanGoc = resTongHop.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      for (let i = 0; i < this.chiTietSanPhamTiepNhanGoc.length; ++i) {
        this.chiTietSanPhamTiepNhanGoc[i].id = i + 1;
      }
      this.data = resTongHop.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      this.chiTietSanPhamTiepNhan = this.chiTietSanPhamTiepNhanGoc;
      // console.log('caculate', resTongHop);
      // console.log('data total', this.chiTietSanPhamTiepNhan);
    });
  }
  addLot(): void {
    const lot = this.scannedLot.trim();
    if (!lot) {
      return;
    }

    // Nếu đã tồn tại, báo user và dọn input
    if (this.lotList.includes(lot)) {
      alert(`LOT ${lot} đã quét rồi.`);
      this.scannedLot = '';
      return;
    }

    // LOT mới: đẩy vào list, lưu session, fetch summary riêng
    this.lotList.push(lot);
    sessionStorage.setItem('lotList', JSON.stringify(this.lotList));
    this.scannedLot = '';
    this.fetchLot(lot);
  }
  fetchLot(lot: string): void {
    this.apollo
      .query<any>({
        query: GET_WORK_ORDER_BY_LOT,
        variables: { lotNumber: lot },
      })
      .toPromise()
      .then(res => {
        const info = res?.data?.qmsToDoiTraInfoByLotNumber;
        const bomErrors = info?.pqcBomErrorDetail || [];
        const testNVL = info?.pqcCheckTestNVL || [];
        const totalQty = testNVL.reduce((sum: number, t: any) => sum + Number(t.qty || t.sampleQuantity || 0), 0);

        this.lotSummaries.push({
          lot,
          bomErrors,
          testNVL,
          scan100Pass: info?.pqcScan100Pass || [],
          returnDay: testNVL[0]?.returnDay || '',
          totalQty,
        });
      });
    sessionStorage.setItem('lotSummaries', JSON.stringify(this.lotSummaries));
  }
  fetchAllLots(): void {
    const promises = this.lotList.map(lot =>
      this.apollo
        .query<any>({
          query: GET_WORK_ORDER_BY_LOT,
          variables: { lotNumber: lot },
        })
        .toPromise()
        .then(res => {
          const info = res?.data?.qmsToDoiTraInfoByLotNumber;
          const bomErrors = info?.pqcBomErrorDetail || [];
          const testNVL = info?.pqcCheckTestNVL || [];
          const totalQty = testNVL.reduce((sum: number, t: any) => sum + Number(t.qty || t.sampleQuantity || 0), 0);
          return {
            lot,
            bomErrors,
            testNVL,
            scan100Pass: info?.pqcScan100Pass || [],
            returnDay: testNVL[0]?.returnDay || '',
            totalQty,
          };
        })
    );

    Promise.all(promises).then(results => {
      this.lotSummaries = results;
      sessionStorage.setItem('lotSummaries', JSON.stringify(results));
    });
  }
  get totalTestNVLPages(): number {
    return this.selectedLotDetail?.testNVL ? Math.ceil(this.selectedLotDetail.testNVL.length / this.testNVLPageSize) : 0;
  }
  get totalScan100Pages(): number {
    return this.selectedLotDetail?.scan100Pass ? Math.ceil(this.selectedLotDetail.scan100Pass.length / this.scan100PageSize) : 0;
  }
  get totalItemsPages(): number {
    return this.itemsInLot?.length ? Math.ceil(this.itemsInLot.length / this.itemsPageSize) : 0;
  }

  get totalLotsPages(): number {
    return this.lotsOfItem?.length ? Math.ceil(this.lotsOfItem.length / this.lotsPageSize) : 0;
  }
  get totalQmsPages(): number {
    return Math.ceil(this.lotSummaries.length / this.qmsPageSize);
  }

  get filteredScan100Pass(): any[] {
    const materialFilter = this.filterMaterial?.toLowerCase() || '';
    const dateFilter = this.filterDate?.toLowerCase() || '';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (
      this.selectedLotDetail?.scan100Pass?.filter((s: any) => {
        const materialMatch = s.material?.toLowerCase().includes(materialFilter);
        const dateStr = s.date?.toLowerCase() || '';
        const dateMatch = dateStr.includes(dateFilter);

        return materialMatch && dateMatch;
      }) ?? []
    );
  }
  get filteredLotSummaries(): LotSummary[] {
    const lotFilter = this.filterLot?.toLowerCase() || '';
    return this.lotSummaries.filter(lot => lot.lot?.toLowerCase().includes(lotFilter));
  }

  parseQR(qr: string): { partNumber: string; vendor: string } {
    const parts = qr?.split('#');
    return {
      partNumber: parts?.[1] || '',
      vendor: parts?.[2] || '',
    };
  }
  filterData(): void {
    const filtered = this.baoCaoVatTuList.filter(
      item =>
        (!this.searchTerms.lotNumber || item.maLot?.toLowerCase().includes(this.searchTerms.lotNumber.toLowerCase())) &&
        (!this.searchTerms.maTiepNhan || item.maTiepNhan?.toLowerCase().includes(this.searchTerms.maTiepNhan.toLowerCase())) &&
        (!this.searchTerms.ngayTiepNhan || this.formatDate(new Date(item.ngayTiepNhan)).includes(this.searchTerms.ngayTiepNhan)) &&
        (!this.searchTerms.nhanVienGiaoHang ||
          item.nhanVienGiao?.toLowerCase().includes(this.searchTerms.nhanVienGiaoHang.toLowerCase())) &&
        (!this.searchTerms.nhomKhachHang || item.nhomKhachHang?.toLowerCase().includes(this.searchTerms.nhomKhachHang.toLowerCase())) &&
        (!this.searchTerms.tenKhachHang || item.tenKhachHang?.toLowerCase().includes(this.searchTerms.tenKhachHang.toLowerCase()))
    );

    this.filteredData = filtered;
    this.qmsPage = 1; // reset về trang đầu
    this.updatePagedData();
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
  openDetail(lotSummary: LotSummary) {
    const lotNumber = lotSummary.lot;
    console.log(lotNumber);

    this.apollo
      .query<any>({
        query: GET_WORK_ORDER_BY_LOT,
        variables: { lotNumber },
      })
      .subscribe(res => {
        if (!res || !res.data) {
          return;
        }

        const info = res.data.qmsToDoiTraInfoByLotNumber;
        const scan100Pass: any[] = Array.isArray(info.pqcScan100Pass) ? info.pqcScan100Pass : [];
        const testNVL: any[] = Array.isArray(info.pqcCheckTestNVL) ? info.pqcCheckTestNVL : [];

        const enrichedTestNVL = testNVL.map((test: any): typeof test & { vendor: string } => {
          const note = test.note || '';
          const parts = note.split('#');
          const vendor = parts.length >= 3 ? parts[2] : '';
          return { ...test, vendor };
        });

        this.selectedLotDetail = {
          ...lotSummary,
          checkNVL: info.pqcCheckNVL || [],
          testNVL: enrichedTestNVL,
          scan100Pass,
          bomErrors: info.pqcBomErrorDetail || [],
        };

        this.modalService.open(this.detailModalTpl, {
          windowClass: 'full-screen-modal',
          scrollable: true,
        });
      });
  }
  openItemSummary(lot: string): void {
    this.apollo
      .query<{ qmsToDoiTraInfoByLotNumber: any }>({
        query: GET_WORK_ORDER_BY_LOT,
        variables: { lotNumber: lot },
      })
      .toPromise()
      .then(res => {
        if (!res || !res.data) {
          return;
        }

        const info = res.data.qmsToDoiTraInfoByLotNumber;
        const scan100Pass: any[] = Array.isArray(info.pqcScan100Pass) ? info.pqcScan100Pass : [];
        const bomErrors: any[] = Array.isArray(info.pqcBomErrorDetail) ? info.pqcBomErrorDetail : [];
        const fixErrs: any[] = Array.isArray(info.pqcFixErr) ? info.pqcFixErr : [];

        // Gán vendor từ QR vào testNVL nếu có
        const testNVL: any[] = Array.isArray(info.pqcCheckTestNVL)
          ? info.pqcCheckTestNVL.map((test: any): any => {
              const matchedQR = scan100Pass.find((q: any) => q.material === test.itemName);
              const { vendor } = this.parseQR(matchedQR?.qr || '');
              return { ...(test as Record<string, unknown>), vendor } as {
                [K in keyof typeof test]: typeof test[K];
              } & { vendor: string };
            })
          : [];

        const itemMap = new Map<string, ItemSummary>();

        testNVL.forEach(test => {
          const key = test.partNumber || test.itemCode;
          const qty = Number(test.qty ?? test.sampleQuantity ?? 0);

          if (!itemMap.has(key)) {
            itemMap.set(key, {
              itemName: test.itemName,
              partNumber: test.partNumber,
              totalLots: 1,
              totalQty: qty,
              totalBomErr: bomErrors.length,
              totalFixErr: fixErrs.reduce((sum: number, e) => sum + Number(e.quantityErr ?? 0), 0),
            });
          } else {
            const item = itemMap.get(key)!;
            item.totalLots += 1;
            item.totalQty += qty;
          }
        });

        this.selectedLot = lot;
        this.itemsInLot = Array.from(itemMap.values());

        this.modalService.open(this.itemSummaryModal, {
          scrollable: true,
          windowClass: 'full-screen-modal',
        });
      });
  }

  openLotList(item: ItemSummary): void {
    const filteredLots = this.lotSummaries
      .filter(s => Array.isArray(s.testNVL) && s.testNVL.some((t: any) => t.partNumber === item.partNumber))
      .map(s => s.lot);

    const requests = filteredLots.map(lot =>
      this.apollo
        .query<{ qmsToDoiTraInfoByLotNumber: any }>({
          query: GET_WORK_ORDER_BY_LOT,
          variables: { lotNumber: lot },
        })
        .toPromise()
        .then(res => {
          if (!res || !res.data) {
            return {
              lot,
              itemName: undefined,
              partNumber: undefined,
              totalQty: 0,
              vendor: undefined,
              checkDate: undefined,
              conclude: '',
            } as LotDetail;
          }

          const info = res.data.qmsToDoiTraInfoByLotNumber;
          const test = ((info.pqcCheckTestNVL as any[]) || []).find(t => t.partNumber === item.partNumber);
          const scan100Pass: any[] = Array.isArray(info.pqcScan100Pass) ? info.pqcScan100Pass : [];
          const matchedQR = scan100Pass.find(q => q.material === test?.itemName);
          const { vendor } = this.parseQR(matchedQR?.qr || '');

          return {
            lot,
            itemName: test?.itemName,
            partNumber: test?.partNumber,
            totalQty: Number(test?.qty ?? test?.sampleQuantity ?? 0),
            vendor,
            checkDate: test?.checkDate,
            conclude: ((info.pqcCheckNVL as any[]) || [])[0]?.conclude ?? '',
          } as LotDetail;
        })
    );

    Promise.all(requests).then(results => {
      this.selectedItem = item;
      this.lotsOfItem = results;

      this.modalService.open(this.lotListModal, {
        scrollable: true,
        windowClass: 'custom-modal',
      });
    });
  }

  trackId(_index: number, item: IChiTietSanPhamTiepNhan): number {
    return item.id!;
  }

  delete(chiTietSanPhamTiepNhan: IChiTietSanPhamTiepNhan): void {
    const modalRef = this.modalService.open(TongHopQMSDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.chiTietSanPhamTiepNhan = chiTietSanPhamTiepNhan;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  changeDate(): void {
    const dateTimeSearchKey = {
      startDate: this.startDates,
      endDate: this.endDates,
    };

    this.http.post<TongHopResponse[]>(this.tongHopUrl, dateTimeSearchKey).subscribe(res => {
      this.rawData = res;

      const receiptMap = new Map<string, TongHopResponse[]>();
      res.forEach(item => {
        const receipt = item.maTiepNhan;
        if (!receiptMap.has(receipt)) {
          receiptMap.set(receipt, [item]);
        } else {
          receiptMap.get(receipt)!.push(item);
        }
      });

      this.baoCaoVatTuList = [];

      receiptMap.forEach((items, receipt) => {
        const distinctLots = Array.from(new Set(items.map(i => i.lotNumber)));

        distinctLots.forEach((lot, index) => {
          const lotItems = items.filter(i => i.lotNumber === lot);

          this.baoCaoVatTuList.push({
            stt: this.baoCaoVatTuList.length + 1,
            maLot: lot,
            maTiepNhan: receipt,
            ngayTiepNhan: lotItems[0].ngayTiepNhan,
            nhanVienGiao: lotItems[0].nhanVienGiaoHang,
            nhomKhachHang: lotItems[0].nhomKhachHang || 'Chưa có',
            tenKhachHang: lotItems[0].tenKhachHang,
            soLuongKhachGiao: lotItems.reduce((sum, i) => sum + (i.soLuongKhachGiao || 0), 0),
            soLuongThucNhan: lotItems.reduce((sum, i) => sum + (i.tongSoLuong || 0), 0),
            tongSoLoSanXuat: distinctLots.length,
          });
        });
      });

      this.updatePagedData();
    });
  }
  updatePagedData(): void {
    const source = this.filteredData.length > 0 ? this.filteredData : this.baoCaoVatTuList;
    const start = (this.qmsPage - 1) * this.qmsPageSize;
    const end = start + this.qmsPageSize;
    this.pagedData = source.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.qmsPage = page;
    this.updatePagedData();
  }

  totalPages(): number {
    const dataSource = this.filteredData.length > 0 ? this.filteredData : this.baoCaoVatTuList;
    return Math.ceil(dataSource.length / this.qmsPageSize);
  }

  totalPagesArray(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  openLotDialog(maTiepNhan: string, modalRef: TemplateRef<any>): void {
    this.selectedMaTiepNhan = maTiepNhan;
    this.selectedLot = maTiepNhan;

    const itemsOfReceipt = this.rawData.filter(item => item.maTiepNhan === maTiepNhan);

    const lotMap = new Map<string, TongHopResponse>();
    itemsOfReceipt.forEach(item => {
      if (!lotMap.has(item.lotNumber)) {
        lotMap.set(item.lotNumber, item);
      }
    });

    this.selectedLotItems = Array.from(lotMap.values());

    this.modalService.open(modalRef, { size: 'lg', scrollable: true, windowClass: 'list-lot-modal' });
  }
  openScanLotDialog(lotNumber: string): void {
    const trimmedLot = lotNumber?.trim();
    this.currentLotNumber = trimmedLot;

    const modalRef = this.modalService.open(this.scanLotModal, {
      windowClass: 'full-screen-modal',
      scrollable: true,
    });

    if (trimmedLot) {
      this.handleScanLot(modalRef, trimmedLot);
    }
  }
  getLotSummaryByLotNumber(lotNumber: string): LotSummary {
    const item = this.selectedLotItems.find(i => i.lotNumber === lotNumber);
    if (!item) {
      console.warn('Không tìm thấy LOT tương ứng:', lotNumber);
      return {
        lot: lotNumber,
        bomErrors: [],
        testNVL: [],
        scan100Pass: [],
        returnDay: '',
        totalQty: 0,
      };
    }

    return {
      lot: item.lotNumber,
      bomErrors: [],
      testNVL: [],
      scan100Pass: [],
      returnDay: '',
      totalQty: 0,
    };
  }

  handleScanLot(modal: any, lotNumber: string): void {
    const trimmedLot = lotNumber?.trim();
    this.isLoading = true;
    this.lotMessage = '';

    if (!trimmedLot || trimmedLot === '240000000000K') {
      this.lotMessage = 'Mã LOT không hợp lệ';
      this.selectedLotDetail = null;
      this.listOfSanPhamTrongDialog = [];
      this.isLoading = false;
      return;
    }

    this.onScanLotChange(trimmedLot);
  }

  onScanLotChange(lot: string): void {
    const trimmedLot = lot?.trim();
    this.lotMessage = '';

    this.apollo
      .watchQuery({
        query: GET_WORK_ORDER_BY_LOT,
        variables: { lotNumber: trimmedLot },
      })
      .valueChanges.subscribe(
        (result: any) => {
          const data = result?.data?.qmsToDoiTraInfoByLotNumber;

          if (
            !data ||
            (!data.pqcScan100Pass?.length &&
              !data.pqcCheckNVL?.length &&
              !data.pqcCheckTestNVL?.length &&
              !data.pqcBomErrorDetail?.length &&
              !data.pqcBomWorkOrder?.length)
          ) {
            this.lotMessage = 'Không có dữ liệu';
            this.selectedLotDetail = null;
            this.listOfSanPhamTrongDialog = [];
            this.isLoading = false;
            return;
          }

          const testNVLs = data.pqcCheckTestNVL || [];
          const bomErrors = data.pqcBomErrorDetail || [];
          const bomWorkOrders = data.pqcBomWorkOrder || [];
          const bomQuantities = data.pqcBomQuantity || [];
          const checkNVLInfo = data.pqcCheckNVL?.[0] || {};
          const scan100Raw = data.pqcScan100Pass || [];

          const scan100Pass: Scan100PassItem[] = scan100Raw.map((item: any, index: number): Scan100PassItem => {
            const parts = item.qr?.split('#') || [];
            return {
              stt: index + 1,
              tenSanPham: item.material || '',
              lotNumber: trimmedLot,
              vendor: parts[2] || '',
              partNumber: parts[1] || '',
              sap: parts[parts.length - 1] || '',
              username: item.user_check || '',
              tenNhanVienPhanTich: item.reason || '',
              ngayKiemTra: item.createdAt,
              qr: item.qr,
              material: item.material,
              user_check: item.user_check,
              reason: item.reason,
              createdAt: item.createdAt,
            };
          });

          const firstScan = scan100Pass[0];
          const sap = firstScan?.sap || '';
          const vendor = firstScan?.vendor || '';
          const partNumber = firstScan?.partNumber || '';

          const bomData = bomWorkOrders.map((bom: any, index: number) => {
            const matchedQuantity = bomQuantities.find((q: any) => q.pqcBomWorkOrderId === bom.id);
            const quantity = matchedQuantity?.quantity ?? 0;
            const totalError = matchedQuantity?.totalError ?? 0;

            return {
              stt: index + 1,
              tenSanPham: bom.itemName || '',
              lotNumber: trimmedLot,
              sap,
              vendor: bom.vendor || '',
              partNumber: bom.partNumber || '',
              detail: bom.itemCode || '',
              // namSanXuat: bom.createdAt ? bom.createdAt.slice(0, 4) : '',
              namSanXuat: trimmedLot?.length >= 2 ? String(2000 + Number(trimmedLot.slice(0, 2))) : '',
              slThucNhap: isNaN(Number(quantity)) ? 0 : Number(quantity),
              ngayKiemTra: bom.createdAt || '',
              ghiChu: bom.uremarks || '',
              nhomLoi: '',
              tenLoi: '',
              soLuongLoi: isNaN(Number(totalError)) ? 0 : Number(totalError),
              ngayCapNhat: bom.updatedAt || '',
              trangThai: false,
              username: '',
              tenNhanVienPhanTich: '',
              loiKyThuat: '',
              loiLinhDong: '',
              type: 'bom',
              raw: bom,
            };
          });

          const testNVLData = testNVLs.map((item: any, index: number) => ({
            stt: index + 1 + Number(bomData.length),
            tenSanPham: item.itemName || '',
            lotNumber: trimmedLot,
            sap,
            vendor,
            partNumber: item.partNumber || '',
            detail: item.itemCode || '',
            namSanXuat: checkNVLInfo.createdAt ? checkNVLInfo.createdAt.slice(0, 4) : '',
            slThucNhap: isNaN(Number(item.qty)) ? 0 : Number(item.qty),
            ngayKiemTra: item.checkDate || '',
            ghiChu: item.note || '',
            nhomLoi: '',
            tenLoi: '',
            soLuongLoi: '',
            ngayCapNhat: checkNVLInfo.updatedAt || '',
            trangThai: false,
            username: checkNVLInfo.CheckPerson || '',
            tenNhanVienPhanTich: checkNVLInfo.note || '',
            loiKyThuat: '',
            loiLinhDong: '',
            type: 'testNVL',
            raw: item,
          }));

          const bomErrorData = bomErrors.map((item: any, index: number) => ({
            stt: index + 1 + Number(bomData.length) + Number(testNVLData.length),
            tenSanPham: '',
            lotNumber: '',
            sap: '',
            vendor: '',
            partNumber: '',
            detail: '',
            namSanXuat: '',
            slThucNhap: '',
            ngayKiemTra: '',
            ghiChu: item.note || '',
            nhomLoi: item.errorCode || '',
            tenLoi: item.errorName || '',
            soLuongLoi: isNaN(Number(item.quantity)) ? 0 : Number(item.quantity),
            ngayCapNhat: item.updatedAt || '',
            trangThai: false,
            username: '',
            tenNhanVienPhanTich: '',
            loiKyThuat: '',
            loiLinhDong: '',
            type: 'bomError',
            raw: item,
          }));

          this.listOfSanPhamTrongDialog = [...bomData, ...testNVLData, ...bomErrorData];
          this.selectedLotDetail = {
            lot: trimmedLot,
            bomErrors,
            checkNVL: data.pqcCheckNVL || [],
            scan100Pass,
            testNVL: testNVLs,
            returnDay: '',
            totalQty: 0,
          };

          this.isLoading = false;
        },
        error => {
          this.lotMessage = 'Lỗi khi tải dữ liệu';
          this.selectedLotDetail = null;
          this.listOfSanPhamTrongDialog = [];
          this.isLoading = false;
          console.error('Lỗi khi gọi API:', error);
        }
      );
  }

  exportToExcel(): void {
    this.getDonBaoHanhInfo();
    this.getChiTietDonBaoHanhInfo();
    this.getPhanLoaiChiTietDonBaoHanhInfo();
    // console.log(this.data, this.dataCT, this.dataSP);
    setTimeout(() => {
      const donBaoHanh = this.data.map(item => ({
        maTiepNhan: item.maTiepNhan,
        maKhachHang: item.maKhachHang,
        tenKhachHang: item.tenKhachHang,
        nhomKhachHang: item.nhomKhachHang,
        tinhThanh: item.tinhThanh,
        ngayTaoDon: item.ngayTaoDon,
        tongTiepNhan: item.tongTiepNhan,
        ngayTiepNhan: item.ngayTiepNhan,
        ngayTraBienBan: item.ngayTraBienBan,
        nguoiTaoDon: item.nguoiTaoDon,
        nhanVienGiaoHang: item.nhanVienGiaoHang,
        trangThai: item.trangThai,
      }));

      const SPdonBaoHanh = this.dataSP.map(item => ({
        donBaoHanhId: item.donBaoHanhId,
        maTiepNhan: item.maTiepNhan,
        idSPTN: item.idSPTN,
        tenSanPham: item.tenSanPham,
        tenNganh: item.tenNganh,
        tenChungLoai: item.tenChungLoai,
        tenNhomSanPham: item.tenNhomSanPham,
        nhomSPTheoCongSuat: item.nhomSPTheoCongSuat,
        phanLoaiSP: item.phanLoaiSP,
        slTiepNhan: item.slTiepNhan,
        trangThai: item.trangThai,
      }));

      const phanLoaiSP = this.dataCT.map(item => ({
        donBaoHanhId: item.donBaoHanhId,
        maTiepNhan: item.maTiepNhan,
        idSPTN: item.idSPTN,
        phanLoaiSP: item.phanLoaiSP,
        soLuong: item.soLuongPL,
      }));

      const chiTietPhanLoaiSanPham = this.dataCTL.map((itemCTL: ITongHop) => ({
        donBaoHanhId: itemCTL.donBaoHanhId,
        maTiepNhan: itemCTL.maTiepNhan,
        namSanXuat: itemCTL.namSanXuat,
        ngayTiepNhan: itemCTL.ngayTiepNhan,
        ngayPhanTich: itemCTL.ngayPhanTich,
        idSP: itemCTL.idSP,
        idSPTN: itemCTL.idSPTN,
        // idPL: itemCTL.idPL,
        tenSanPham: itemCTL.tenSanPham,
        lotNumber: itemCTL.lotNumber,
        serial: itemCTL.serial,
        tenNhomLoi: itemCTL.tenNhomLoi,
        tenLoi: itemCTL.tenLoi,
        soLuongTheoTungLoi: itemCTL.soLuongTheoTungLoi,
        trangThai: itemCTL.trangThai,
        thoiGianPhanTich: itemCTL.ngayPhanTich,
        nguoiPhanTich: itemCTL.tenNhanVienPhanTich,
        id: itemCTL.id,
      }));
      // console.log('dataCTL', this.dataCTL);
      // const data = document.getElementById("table-data");
      const wsDBH: XLSX.WorkSheet = XLSX.utils.json_to_sheet(donBaoHanh);
      const wsSPDBH: XLSX.WorkSheet = XLSX.utils.json_to_sheet(SPdonBaoHanh);
      const wsCTPLSP: XLSX.WorkSheet = XLSX.utils.json_to_sheet(phanLoaiSP);
      const wsPTCTSP: XLSX.WorkSheet = XLSX.utils.json_to_sheet(chiTietPhanLoaiSanPham);

      // create workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const wbPT: XLSX.WorkBook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, wsDBH, 'don-bao-hanh');
      XLSX.utils.book_append_sheet(wb, wsSPDBH, 'san-pham-don-bao-hanh');
      XLSX.utils.book_append_sheet(wbPT, wsCTPLSP, 'chi-tiet-phan-loai-san-pham');
      XLSX.utils.book_append_sheet(wbPT, wsPTCTSP, 'phan-tich-chi-tiet-san-pham');

      XLSX.writeFile(wb, `${this.fileName}.xlsx`);
      XLSX.writeFile(wbPT, `${this.fileNameCT}.xlsx`);
    }, 3000);
  }

  openPopupViewCTL(): void {
    // this.handleSearchCTL();
    setTimeout(() => {
      this.popupViewCTL = true;
    }, 100);
    // this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc;
  }

  closePopupViewCTL(): void {
    this.popupViewCTL = false;
  }

  onFilterChange(event: Event): void {
    const filterText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.angularGrid) {
      this.angularGrid.filterService.updateFilters([{ columnId: 'donBaoHanhId', operator: 'Contains', searchTerms: [filterText] }]);
    }
  }
  // Lấy thông tin từ khóa tìm kiếm tổng hợp
  onSearchChange(e: any): void {
    // detail is the args data payload
    const args = e.detail;
    if (args.columnId === 'maTiepNhan') {
      if (args.searchTerms === undefined) {
        this.dataSearch.maTiepNhan = '';
      } else {
        this.dataSearch.maTiepNhan = args.searchTerms[0];
      }
    }
    if (args.columnId === 'nhanVienGiaoHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.nhanVienGiaoHang = '';
      } else {
        this.dataSearch.nhanVienGiaoHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenKhachHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenKhachHang = '';
      } else {
        this.dataSearch.tenKhachHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'nhomKhachHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.nhomKhachHang = '';
      } else {
        this.dataSearch.nhomKhachHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tinhThanh') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tinhThanh = '';
      } else {
        this.dataSearch.tinhThanh = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenSanPham') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenSanPham = '';
      } else {
        this.dataSearch.tenSanPham = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenNganh') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenNganh = '';
      } else {
        this.dataSearch.tenNganh = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenChungLoai') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenChungLoai = '';
      } else {
        this.dataSearch.tenChungLoai = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenNhomSanPham') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenNhomSanPham = '';
      } else {
        this.dataSearch.tenNhomSanPham = args.searchTerms[0];
      }
    }
    this.handleSearchCTL();
    // console.log('header search body', this.dataSearch);
    // this.handleSearchCTL();
  }
  //Filter trong danh sách chi tiết
  handleSearchCTL(): void {
    this.data = this.chiTietSanPhamTiepNhanGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
    this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
    // console.log('result', this.chiTietSanPhamTiepNhanCTL);
    this.dataCTL = this.chiTietSanPhamTiepNhanCTLGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
  }
  angularGridReady(angularGrid: any): void {
    this.angularGrid = angularGrid;

    // the Angular Grid Instance exposes both Slick Grid & DataView objects
    this.gridObj = angularGrid.slickGrid;
    this.dataViewObj = angularGrid.dataView;
    this.dataShow();
  }
  getDonBaoHanhInfo(): void {
    this.http.post<any>(this.tongHopDBHUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.data = res;
    });
  }
  getChiTietDonBaoHanhInfo(): void {
    this.http.post<any>(this.sanPhamDBHUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.dataSP = res;
    });
  }
  getPhanLoaiChiTietDonBaoHanhInfo(): void {
    this.http.post<any>(this.phanLoaiSanPhamUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.dataCT = res;
    });
  }
  exportExcel(data: any[], sheetName: string, fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  }
  exportBomErrors(): void {
    const data = (this.selectedLotDetail?.bomErrors ?? []).map((e, i) => ({
      STT: i + 1,
      'Mã lỗi': e.errorCode,
      'Tên lỗi': e.errorName,
      'Số lượng': e.quantity,
      'Ghi chú': e.note,
      'Ngày tạo': e.createdAt,
    }));
    this.exportExcel(data, 'BOM lỗi', `BOM_LOI_${this.selectedLotDetail?.lot ?? ''}`);
  }
  exportCheckNVL(): void {
    const data = (this.selectedLotDetail?.checkNVL ?? []).map((c, i) => ({
      STT: i + 1,
      'Người kiểm': c.CheckPerson,
      'Kết luận': c.conclude,
      'Ghi chú': c.note,
      'Ngày kiểm': c.createdAt,
    }));
    this.exportExcel(data, 'Kiểm tra NVL', `KIEM_TRA_NVL_${this.selectedLotDetail?.lot ?? ''}`);
  }
  exportTestNVL(): void {
    const data = (this.selectedLotDetail?.testNVL ?? []).map((t, i) => ({
      STT: i + 1,
      'Tên vật tư': t.itemName,
      'Mã vật tư': t.itemCode,
      'SL mẫu': t.sampleQuantity,
      'Kết quả': t.realResult,
      'Ngày kiểm': t.checkDate,
      Vendor: t.vendor,
      'Ghi chú': t.note,
    }));
    this.exportExcel(data, 'Test NVL', `TEST_NVL_${this.selectedLotDetail?.lot ?? ''}`);
  }
  exportScan100(): void {
    const data = (this.selectedLotDetail?.scan100Pass ?? []).map((s, i) => ({
      STT: i + 1,
      QR: s.qr,
      'Vật tư': s.material,
      Máy: s.machine,
      'Người kiểm': s.user_check,
      Ngày: s.date,
    }));
    this.exportExcel(data, 'Scan100 Pass', `SCAN100_${this.selectedLotDetail?.lot ?? ''}`);
  }
}

export interface ITongHop {
  id: number;
  donBaoHanhId: number;
  maTiepNhan: string;
  namSanXuat: Date;
  ngayTiepNhan: Date;
  ngayPhanTich: string;
  nhanVienGiaoHang: string;
  tenKhachHang: string;
  nhomKhachHang: string;
  tinhThanh: string;
  tenSanPham: string;
  tenNganh: string;
  tenChungLoai: string;
  tenNhomSanPham: string;
  soLuongKhachGiao: number;
  slTiepNhan: number;
  soLuongDoiMoi: number;
  loiKT: number;
  loiLinhDong: number;
  trangThai: string;
  lotNumber: string;
  serial: string;
  soLuongTheoTungLoi: number;
  tenLoi: string;
  tenNhomLoi: string;
  phanTichSanPhamId: number;
  tenTinhTrangPhanLoai: string;
  idSP: number;
  idSPTN: number;
  idPhanLoai: number;
  tenNhanVienPhanTich: string;
}
