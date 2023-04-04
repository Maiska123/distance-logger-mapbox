import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public appTitleString: string = 'Eeppinen ajopäiväkirja -äppi!';
  public appTitle: BehaviorSubject<string> = new BehaviorSubject(
    this.appTitleString
  );

  public set setAppTitle(newTitle: string) {
    this.appTitleString = newTitle + ' | ';
    this.appTitle.next(newTitle);
  }

  constructor() {}

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

  _routeFunction(req: any, map: any) {
    var json = JSON.parse(req.response);
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route,
      },
    };
    // if the route already exists on the map, reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else {
      // otherwise, make a new request
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson,
            },
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
  }
}
