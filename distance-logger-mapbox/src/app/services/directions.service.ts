import { setAddress } from './../store/actions/route-plan.actions';
import { MapService } from 'src/app/services/map.service';
import { Coordinate } from './../interfaces/map';
import { Direction } from './../interfaces/direction';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { LinkedList } from '../interfaces/linked-list';
import { addAddress } from '../store/actions/route-plan.actions';

interface rangeBetween {
  fromId: number;
  toId: number;
  distance: number;
}
@Injectable({
  providedIn: 'root',
})
export class DirectionsService {
  private subscription: Subscription = new Subscription();
  private calculatingDistance: boolean = false;

  private subject = new Subject<any>();

  public get getDirections() {
    return this.dummy;
  }

  constructor(
    private mapService: MapService,
    private store: Store<{ addresses: Direction[] }>
  ) {
    this.addresses$ = store.select('addresses');

    this.subscription.add(
      this.addresses$.subscribe((newDirections) => {
        this.dummy = newDirections;

        if (this.dummy.length > 1) {
          var first = this.dummy[this.dummy.length - 2].id;
          var second = this.dummy[this.dummy.length - 1].id;

          this.calculateBetweenKm(first, second);
        } else {
          this.rangesBetween = [];
        }
        // this.directionsArray$.next(this.dummy);
      })
    );
    // this.directionsArray$ = new BehaviorSubject(this.dummy);
  }

  public dummy: Direction[] = [];
  public rangesBetween: rangeBetween[] = [];
  // public directionsArray$: BehaviorSubject<Direction[]>;
  public addresses$: Observable<Direction[]>;

  /**
   * Adds a new direction to the list
   * from the map, by clicking on the map popup box button
   */
  public set addDirection(newDirection: Direction) {
    // this.dummy.push(newDirection);

    /**
     * Dispatches the new direction to the store
     */

    this.store.dispatch(addAddress({ direction: newDirection }));
  }

  public set overwriteDirection(newDirections: Direction[]) {
    this.store.dispatch(setAddress({ directions: newDirections }));
    // this.directionsArray$.next(this.dummy);
  }

  public get newDirectionId(): number {
    var id = Math.random();

    while (this.dummy.some((x) => x.id == id)) {
      id = Math.random();
    }

    return id;
  }

  sendClickEvent(item: Direction) {
    this.subject.next(item);
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  returnDistanceToNext(
    id1: number,
    id2: number,
    asNumber: boolean = false
  ): string | number {
    var findo = asNumber
      ? this.rangesBetween.find((x) => x.fromId == id1)?.distance ??
        this.getNewCalculatedDistance(id1, id2)
      : this.rangesBetween.find((x) => x.fromId == id1)?.distance.toString() ??
        '- t';
    return findo;
  }

  getNewCalculatedDistance(id1: number, id2: number): number {
    if (
      !this.calculatingDistance &&
      !this.rangesBetween.find((x) => x.fromId == id1)?.distance
    ) {
      this.rangesBetween.push({ fromId: id1, toId: id2, distance: 0 }); // add a new range

      this.calculatingDistance = true;

      this.calculateBetweenKm(id1, id2);
    }
    return this.rangesBetween.find((x) => x.fromId == id1)?.distance ?? 0;
  }

  calculateBetweenKm(id1: number, id2: number): void {
    var checkIfDuplicate = this.rangesBetween.filter((x) => {
      x.fromId == id1 || x.toId == id2;
    });

    // if ((checkIfDuplicate[0].distance ?? -1) > 0) return;

    this.getRouteDistanceDriving(id1, id2);
  }

  private getRouteDistanceDriving(id1: number, id2: number): any {
    var start: Coordinate, end: Coordinate;

    start =
      this.dummy.find((x) => x.id == id1)?.poi_coords ??
      ({ lon: 0, lat: 0 } as Coordinate);
    end =
      this.dummy.find((x) => x.id == id2)?.poi_coords ??
      ({ lon: 0, lat: 0 } as Coordinate);

    var url =
      'https://api.mapbox.com/directions/v5/mapbox/driving/' +
      (start as unknown as number[])[0] +
      ',' +
      (start as unknown as number[])[1] +
      ';' +
      (end as unknown as number[])[0] +
      ',' +
      (end as unknown as number[])[1] +
      '?steps=true&geometries=geojson&access_token=' +
      environment.mapbox.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = () => {
      // Do something with the retrieved data ( found in xmlhttp.response )
      this.routeFunction(req, id1, id2);
    };
    req.onerror = () => {
      this.calculatingDistance = false;
      // There was a connection error of some sort
    };
    req.send();
  }

  private routeFunction(req: XMLHttpRequest, id1: number, id2: number): void {
    if (!req) return;
    var json = JSON.parse(req.response);
    var data = json.routes[0];

    const rangeBetween = this.rangesBetween.find(
      (x) => x.fromId == id1 && x.toId == id2
    );

    if (rangeBetween) {
      rangeBetween.distance = data.distance as number;
    } else {
      this.rangesBetween.push({
        fromId: id1,
        toId: id2,
        distance: data.distance as number,
      });
    }

    this.calculatingDistance = false;

    var allDistances: number = this.rangesBetween.reduce(
      (acc: number, val: rangeBetween) => {
        return this.dummy.some(
          (x) =>
            x.id === val.fromId ||
            this.dummy.findIndex((y) => y.id === val.toId) ==
              this.dummy.findIndex((y) => y.id === val.fromId) + 1
        )
          ? (acc += val.distance)
          : 0;
      },
      0
    );

    if (allDistances == 0) allDistances = this.rangesBetween[0]?.distance ?? 0;

    this.mapService.setAppTitle =
      this.mapService.appTitleString.split('|')[0] +
      '    |   ' +
      (allDistances / 1000).toFixed(2) +
      ' km';
  }

  getLocation(): Observable<any> {
    return Observable.create(
      (observer: {
        next: (arg0: GeolocationPosition) => void;
        complete: () => void;
        error: (arg0: string | GeolocationPositionError) => void;
      }) => {
        if (window.navigator && window.navigator.geolocation) {
          window.navigator.geolocation.getCurrentPosition(
            (position) => {
              observer.next(position);
              observer.complete();
            },
            (error) => observer.error(error)
          );
        } else {
          observer.error('Unsupported Browser');
        }
      }
    );
  }
}
