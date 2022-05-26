import { Direction } from './../interfaces/direction';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {

  public dummy: Direction[] =  [];
  public directionsArray$: BehaviorSubject<Direction[]>;

  public set addDirection(newDirection: Direction){
    this.dummy.push(newDirection);
    this.directionsArray$.next(this.dummy);
  }

  public set overwriteDirection(newDirections: Direction[]){
    this.dummy = newDirections;
    this.directionsArray$.next(this.dummy);
  }

  constructor (){
    this.directionsArray$ = new BehaviorSubject(this.dummy)
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
