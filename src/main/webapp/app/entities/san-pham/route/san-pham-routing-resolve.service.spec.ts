import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ISanPham, SanPham } from '../san-pham.model';
import { SanPhamService } from '../service/san-pham.service';

import { SanPhamRoutingResolveService } from './san-pham-routing-resolve.service';

describe('SanPham routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: SanPhamRoutingResolveService;
  let service: SanPhamService;
  let resultSanPham: ISanPham | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    routingResolveService = TestBed.inject(SanPhamRoutingResolveService);
    service = TestBed.inject(SanPhamService);
    resultSanPham = undefined;
  });

  describe('resolve', () => {
    it('should return ISanPham returned by find', () => {
      // GIVEN
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSanPham = result;
      });

      // THEN
      expect(service.find);
      expect(resultSanPham);
    });

    it('should return new ISanPham if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSanPham = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultSanPham).toEqual(new SanPham());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as SanPham })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSanPham = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSanPham).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
