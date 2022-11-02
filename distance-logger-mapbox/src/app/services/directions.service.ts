import { MapService } from 'src/app/services/map.service';
import { Coordinate } from './../interfaces/map';
import { Direction } from './../interfaces/direction';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface rangeBetween {
  fromId: number,
  toId: number,
  distance: number
}
@Injectable({
  providedIn: 'root'
})
export class DirectionsService {

  public dummy: Direction[] = [];
  public rangesBetween: rangeBetween[] = [];
  public directionsArray$: BehaviorSubject<Direction[]>;

  public set addDirection(newDirection: Direction){
    this.dummy.push(newDirection);

    console.log('addDirection')
    console.log('this.dummy')
    console.log(this.dummy)

      var first = this.dummy[this.dummy.length-2].id;
      console.log(first);
      var second = this.dummy[this.dummy.length-1].id;
      console.log(second);

      this.calculateBetweenKm(first,second);

    console.log('calulated..?')




    this.directionsArray$.next(this.dummy);

    var allDistances:number = this.rangesBetween.reduce((acc, val) => acc += (val.distance), 0 );
    console.log(allDistances)
    this.mapService.setAppTitle = this.mapService.appTitleString.split('|')[0] + '    |   ' + allDistances ;

  }

  public set overwriteDirection(newDirections: Direction[]){
    this.dummy = newDirections;
    this.directionsArray$.next(this.dummy);
  }

  constructor (private mapService: MapService){
    this.directionsArray$ = new BehaviorSubject(this.dummy)
  }

  returnDistanceToNext(id1: number, id2: number, asNumber: boolean = false): string | number{
    console.log('this.rangesBetween -RETURN DISTANCE')
    console.log(this.rangesBetween)
    // if ((this.rangesBetween.length ?? 0) < 2 ) return "- ";
    var findo = asNumber ?
    this.rangesBetween.find(x =>
      (x.fromId == id1))?.distance ?? 0
    : this.rangesBetween.find(x =>
      (x.fromId == id1))?.distance.toString() ?? '- t'
      console.log(findo);
    return findo;
  }

  calculateBetweenKm(id1: number, id2: number): void{
    console.log('this.calculateBetweenKm')
    console.log(id1)
    console.log(id2)

    console.log('this.rangesBetwee')
    console.log(this.rangesBetween)

    var checkIfDuplicate = this.rangesBetween.filter((x) =>
      {(x.fromId == id1 || x.toId == id2)});

      console.log('checkIfDuplicate');
      console.log(checkIfDuplicate)

    // if ((checkIfDuplicate[0].distance ?? -1) > 0) return;
    console.log('getRouteDistanceDriving tO ->>');

    this.getRouteDistanceDriving(id1,id2)
  }

  private getRouteDistanceDriving(id1: number, id2: number): any{
    var start: Coordinate, end: Coordinate;
    console.log('getRouteDistanceDriving');

    start = this.dummy.find(x => x.id == id1)?.poi_coords ?? {lon: 0, lat:0} as Coordinate;
    end = this.dummy.find(x => x.id == id2)?.poi_coords ?? {lon: 0, lat:0} as Coordinate;
    console.log(start);
    console.log(end);

      var url =
        'https://api.mapbox.com/directions/v5/mapbox/driving/' +
        (start as unknown as number[])[0] +
        ',' +
        (start as unknown as number[])[1]  +
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
        this.routeFunction(req,id1,id2);
      };
      req.send();

  }

  private routeFunction(req: XMLHttpRequest,id1: number,id2: number): void {
    if (!req) return;
    var json = JSON.parse(req.response);
    console.log('routeFunction');
    var data = json.routes[0];
    // var distance = Math.ceil(Math.round(data.distance) / 5) * 5;
    console.log(json);

    this.rangesBetween.push(
      {
        fromId: id1,
        toId: id2,
        distance: ((data.distance / 1000).toFixed(2) as unknown as number)
      });
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
