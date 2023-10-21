import { DirectionsService } from './../../services/directions.service';
import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { fromEvent, Subscription } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { environment } from 'src/environments/environment';
import { GeoJson, FeatureCollection, Coordinate } from '../../interfaces/map';
import { Direction } from 'src/app/interfaces/direction';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { LinkedList } from 'src/app/interfaces/linked-list';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @Output('digit') digit: number = 0;
  @Output('destination') destination: string = '';

  @ViewChild('mapElement')
  mapElement!: ElementRef;

  private directions!: mapboxgl.Control | mapboxgl.IControl;

  public map!: mapboxgl.Map;
  private subscription: Subscription = new Subscription();

  private style = 'mapbox://styles/maiska/cl3fu5ycr003d15o41pktkgup';
  private lat = 61.498643;
  private lng = 23.762814;
  private currentPosition: any[] = [];
  private currentDestination: any[] = [];
  private routeData: any[] = [];
  private routeDataSet: Set<any> = new Set();
  private routeActivated: boolean = false;
  private distance: number | undefined;
  private distanceToDestination: string | undefined;
  private waypoints: string[] = [];
  private latestReq: XMLHttpRequest | undefined;
  private flyToDestinationChecked: boolean = false;
  private clicked: any;
  private offlineData: FeatureCollection | undefined;
  private offlineMarkerData: any[] = [];
  private currentPoint: any;
  private markersToDisplay: Set<any> = new Set();
  private message = 'Määränpää';
  private eventData: any;
  private latestBbox1!: Coordinate;
  private latestBbox2!: Coordinate;
  private latestCoords!: Coordinate;
  private offlineEvent: any;
  private onlineEvent: any;
  private directionsHelper: Direction[] = [];

  constructor(
    private mapService: MapService,
    private directionsService: DirectionsService,
    private snackbarService: SnackbarService
  ) {
    this.subscription.add(
      this.directionsService.getClickEvent().subscribe((item: any) => {
        this.flyToCoords(item.poi_coords ?? item.coords);
      })
    );

    this.subscription.add(
      this.directionsService.addresses$.subscribe((direction: Direction[]) => {
        // this.snackbarService.openSnackBar('You Are Offline!');
        // this.waypoints = [];
        // direction.forEach((item: Direction) => {
        //   if (item.poi_coords.lat && item.poi_coords.lon) this.waypoints.push(item.poi_coords.lon + ',' + item.poi_coords.lat);
        // });

        if (
          direction.length > 1 &&
          this.directionsHelper.length == direction.length
        ) {
          this.directionsHelper = direction;
          this.waypoints = [];

          this.directionsHelper.forEach((item: any) => {
            if (
              (item.poi_coords[0] && item.poi_coords[1]) ||
              (item.clicked_coords[0] && item.clicked_coords[1])
            ) {
              this.waypoints.push(
                (item.poi_coords[0].toFixed(7) ??
                  item.clicked_coords[0].toFixed(7)) +
                  ',' +
                  (item.poi_coords[1].toFixed(7) ??
                    item.clicked_coords[1].toFixed(7))
              );
            }
          });

          try {
            var breakingString: string[] =
              this.waypoints[this.waypoints.length - 1].split(','); // if length is 1, it will be the last one

            var breakingParse = [
              Number.parseFloat(breakingString[0]),
              Number.parseFloat(breakingString[1]),
            ];

            if (
              this.waypoints.length > 0 &&
              breakingParse[0] &&
              breakingParse[1]
            ) {
              this.directionsWithWaypoints();
            }
          } catch (error) {
            console.error(error);
            this.clearDirectionsWithWaypoints(); // if error, clear the route
          }
        } else if (direction.length == 0) {
          this.waypoints = [];
          this.clearDirectionsWithWaypoints(); // if empty, clear the route
        } else {
          this.directionsHelper = direction;
        }

        // if (this.waypoints.length > 0) this.directionsWithWaypoints();
        // this.getWholeRouteDriving(direction);
      })
    );
  }

  clearDirectionsWithWaypoints() {
    // if (this.map.getLayer('route')) this.map.removeLayer('route');

    const geojsonFeature = {
      type: 'Feature' as const,
      properties: {
        name: 'route',
        amenity: 'Custom Route',
        popupContent: 'Route',
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [],
      },
    };

    // if the route already exists on the map, reset it using setData
    let source;
    if (this.map) source = this.map.getSource('route') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojsonFeature); // eslint-disable-line no-use-before-define
    }
  }

  ngOnInit() {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com

    this.handleAppConnectivityChanges();
  }

  ngAfterViewInit(): void {
    this.initializeMap();

    // let leftGarbage =
    document.getElementsByClassName('mapboxgl-ctrl-bottom-left')[0].innerHTML =
      '';
    document.getElementsByClassName('mapboxgl-ctrl-bottom-right')[0].innerHTML =
      '';
    // leftGarbage.innerHTML = "";
    // rightGarbage.innerHTML = "";

    // (myRow.querySelector('.myClass') as HTMLInputElement).value = " a vaule";
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    this.subscription.unsubscribe();
  }
  /*
    End Of lifecycle hooks
  */

  /**
   * Calls simulatedClick() with x and y coords from event.
   *
   * @param {any} event Event eg. from mouseclick.
   * @param {any} i Could be targeted to index of some sort (not used).
   * @calls this.simulatedClick().
   * @return nothing.
   */
  private createPoint(event: any, i: any): void {
    var x, y;
    this.eventData = event;
    (x = event.pageX), (y = event.pageY);
    this.simulatedClick(document.getElementsByClassName('mapboxgl-canvas')[0], {
      clientX: x,
      clientY: y,
    });
  }

  /**
   * Fires .dispatchEvent() of a target element with given options.
   *
   * @param {any} target Event eg. from mouseclick.
   * @param {any} options (optional) consists of options which are included in dispatched event as merge.
   * @calls target.dispatchEvent(MouseEvent).
   * @return nothing.
   */
  private simulatedClick(target: any, options?: any): void {
    var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {},
      opts: any = {
        // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 1,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

    //Merge the options with the defaults
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        opts[key] = options[key];
      }
    }

    //Pass in the options
    event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
    );

    //Fire the event
    target.dispatchEvent(event);
  }

  /**
   * Causes this.map to fly to given point.
   *
   * @param {any[]} coords coordinates in array to fly to.
   * @calls this.map.flyTo()
   * @return nothing.
   */
  private flyToCoords(coords: any[]) {
    if (coords[0] && coords[1]) {
      this.map.flyTo({
        center: coords as mapboxgl.LngLatLike, // eslint-disable-line no-use-before-define
        zoom: 17,
      });
    }
  }

  /**
   * Initializes map to get users location (navigator.geolocation). If given location, store and fly there. Builds a map.
   *
   * @calls this.buildMap().
   * @return nothing.
   */
  private initializeMap(): void {
    /// locate the user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.map.flyTo({
          center: [this.lng, this.lat],
        });
      });
    }

    this.currentPosition = [this.lng, this.lat];

    this.buildMap();
  }

  private handleAppConnectivityChanges(): void {
    this.offlineEvent = fromEvent(window, 'offline');
    this.onlineEvent = fromEvent(window, 'online');

    this.subscription.add(
      this.offlineEvent.subscribe(() => {
        // handle offline mode

        this.snackbarService.openPersistentSnackBar('You Are Offline!');
      })
    );

    this.subscription.add(
      this.onlineEvent.subscribe(() => {
        // handle offline mode

        this.snackbarService.openSnackBar('You Are Online!');
      })
    );
  }

  /**
   * Builds a mapboxgl.Map() object to live in this.map.
   * Adds navigation controls and initializes onLoad-method where configurations are given.
   * Adds onClick-watcher which creates buttons to the popup of clicked coordinates with options.
   *
   * @calls new mapboxgl.Map()
   * @return nothing.
   */
  private buildMap(): void {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: this.mapElement.nativeElement,
      style: this.style,
      zoom: 16,
      maxZoom: 19,
      minZoom: 5,
      minPitch: 0,
      maxPitch: 67,
      center: [this.lng, this.lat],
    });

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat];
      const newMarker = new GeoJson(coordinates, { message: this.message });

      // set bbox as 5px reactangle area around clicked point
      var bboxClick = [
        // [event.point.x - 5, event.point.y - 5],
        // [event.point.x + 5, event.point.y + 5]
        [event.lngLat.lng - 0.0005, event.lngLat.lat - 0.0005],
        [event.lngLat.lng + 0.0005, event.lngLat.lat + 0.0005],
      ];

      var bboxCoord1: Coordinate = {
        lon: bboxClick[0][0],
        lat: bboxClick[0][1],
      };

      var bboxCoord2: Coordinate = {
        lon: bboxClick[1][0],
        lat: bboxClick[1][1],
      };

      // 0: (2) [23.84848426640055, 61.44414624556565]
      // 1: (2) [23.849484266400548, 61.44514624556565]
      var countInside: number = 0;
      var markerIndex: Set<any> = new Set();

      this.offlineMarkerData.forEach((element) => {
        var elementCoords: Coordinate = {
          lon: element.geometry.coordinates[0],
          lat: element.geometry.coordinates[1],
        };

        if (this.inBoundingBox(bboxCoord1, bboxCoord2, elementCoords)) {
          markerIndex.add(countInside);
        }
        countInside++;

        // 0: 23.76598724
        // 1: 61.50039711
      });

      const name = '';
      const innerHtmlContent = `<div class="nav" style="font-size: large;color : black;background: rgba(#2EC4B6, 0.75);
    border-top: 5px solid rgba(#2EC4B6,0.75)">
                <h4 class="h4Class">${name} </h4> </div>`;

      const divElement = document.createElement('div');
      divElement.className = 'nav';
      const ulContainer = document.createElement('ul');
      ulContainer.className = 'radial-nav';
      const routeBtn = document.createElement('li');
      routeBtn.className = 'li';
      const markerNewBtn = document.createElement('li');
      markerNewBtn.className = 'li';
      const assignBtn = document.createElement('li');
      assignBtn.className = 'li';
      const addToWaypoints = document.createElement('li');
      addToWaypoints.className = 'li';
      const flyToUser = document.createElement('li');
      flyToUser.className = 'li';
      const getLocationAddress = document.createElement('li');
      getLocationAddress.className = 'li';

      const dummy1 = document.createElement('li');
      dummy1.className = 'li';
      const dummy2 = document.createElement('li');
      dummy2.className = 'li';
      const dummy3 = document.createElement('li');
      dummy3.className = 'li';
      const dummy4 = document.createElement('li');
      dummy4.className = 'li';
      ulContainer.appendChild(addToWaypoints);
      ulContainer.appendChild(dummy1);
      ulContainer.appendChild(routeBtn);
      ulContainer.appendChild(dummy2);
      ulContainer.appendChild(markerNewBtn);
      ulContainer.appendChild(dummy3);
      ulContainer.appendChild(flyToUser);
      ulContainer.appendChild(dummy4);
      ulContainer.appendChild(getLocationAddress);

      var coords: any;

      addToWaypoints.innerHTML = `<button class="menu-button btn swipe-overlay btn-success btn-simple text-white" >Add a Waypoint</button>`;
      routeBtn.innerHTML = `<button class="menu-button btn swipe-overlay btn-success btn-simple text-white" >Get Route</button>`;
      markerNewBtn.innerHTML = `<button class="menu-button btn swipe-overlay btn-success btn-simple text-white" >New Marker</button>`;
      flyToUser.innerHTML = `<button class="menu-button btn swipe-overlay btn-success btn-simple text-white" >Fly To User</button>`;
      getLocationAddress.innerHTML = `<button class="menu-button btn swipe-overlay btn-success btn-simple text-white" >Get Address</button>`;

      if (Array.from(markerIndex)[0]) {
        var nearestPointIndex = this.getNearestPoint(
          Array.from(markerIndex),
          coordinates
        );
        coords = this.offlineMarkerData[nearestPointIndex].geometry.coordinates;
        assignBtn.innerHTML = `<button class="btn btn-primary" (click)="flyToCoords(coords)">${
          this.offlineMarkerData[Array.from(markerIndex)[0]].properties.message
        } : ${nearestPointIndex}</button>`;

        if (this.flyToDestinationChecked) {
          this.flyToCoords(coords);
        }
      }

      // divElement.innerHTML = innerHtmlContent;
      divElement.appendChild(ulContainer);
      // divElement.appendChild(routeBtn);
      // divElement.appendChild(addToWaypoints);
      // divElement.appendChild(assignBtn);
      // divElement.appendChild(flyToUser);
      // divElement.appendChild(getLocationAddress);

      var popup = new mapboxgl.Popup()
        .setLngLat(coordinates as mapboxgl.LngLatLike) // eslint-disable-line no-use-before-define
        .addTo(this.map)
        .setDOMContent(divElement);

      this.clicked = true;
      // addEventListener

      /**
       * UGLY MESS BELOW
       * TODO: REFACTOR AKA. CLEAN UP
       */
      var asd = document.getElementsByClassName('radial-nav');
      var dsa = document.getElementsByClassName('nav');
      dsa[0].classList.remove('active');
      asd[0].className = 'radial-nav expanded';
      asd[0].getElementsByClassName('li')[0].classList.remove('selected');
      var qwe = document.getElementsByClassName('li');

      qwe[0].addEventListener('click', (evt) => {
        evt.stopPropagation();

        var ewq = document.getElementsByClassName('nav');
        ewq[0].classList.add('selected');

        var uyt = document.getElementsByClassName('nav');
        uyt[0].classList.add('active');

        asd[0].classList.remove('expanded');
      });
      /**
       * UGLY MESS ABOVE
       */

      // if (!Array.from(markerIndex)[0]) {
      //   divElement.appendChild(markerNewBtn);

      //   markerNewBtn.addEventListener('click', (e) => {
      //     popup.remove();
      //     this.clicked = false;
      //   });
      // }

      addToWaypoints.addEventListener('click', (e) => {
        this.waypoints.push(coordinates.toString());
        popup.remove();
        this.clicked = false;
      });

      routeBtn.addEventListener('click', (e) => {
        this.getRoute(coordinates);
        popup.remove();
        this.clicked = false;
      });

      assignBtn.addEventListener('click', (e) => {
        this.flyToCoords(coords);
        popup.remove();
        this.clicked = false;
      });

      flyToUser.addEventListener('click', (e) => {
        this.flyToCoords(this.currentPosition);
        popup.remove();
        this.clicked = false;
      });

      getLocationAddress.addEventListener('click', (e) => {
        this.latestBbox1 = bboxCoord1;
        this.latestBbox2 = bboxCoord2;
        this.latestCoords = coordinates as unknown as Coordinate;
        this.waypoints.push(coordinates.toString());
        this.directionsWithWaypoints();
        this.getPlaceName(coordinates);
        popup.remove();
        this.clicked = false;
      });

      var closebtn = document.getElementsByClassName(
        'mapboxgl-popup-close-button'
      );
      closebtn[0].setAttribute('style', 'transform: scale(3);');
      closebtn[0].addEventListener('click', (e) => {
        this.clicked = false;
      });
    });

    /// Add realtime firebase data on map load'
    //@ts-ignore
    this.map.on('load', (event: any) => {
      this.map.touchZoomRotate.enable();
      this.map.dragPan.enable(); // eslint-disable-line no-use-before-define
      this.map.keyboard.enable();

      /// create map layers with realtime data
      // this.map.addLayer({
      //   id: 'firebase',
      //   source: 'firebase',
      //   type: 'symbol',
      //   layout: {
      //     'text-field': '{message}',
      //     'text-size': 24,
      //     'text-transform': 'uppercase',
      //     'icon-image': 'bin',
      //     'text-offset': [0, 1.5],
      //   },
      //   paint: {
      //     'text-color': '#f16624',
      //     'text-halo-color': '#fff',
      //     'text-halo-width': 2,
      //   },
      // });

      // add markers to map
      // TODO

      // make an initial directions request that
      // starts and ends at the same location
      var start = [this.lng, this.lat];

      // Add starting point to the map
      this.map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: start,
                },
              },
            ],
          },
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be',
          'circle-stroke-color': 'black',
          'circle-stroke-width': 1,
        },
      });
      // this is where the code from the next step will go
    });
  }

  // directions with waypoints (start; waypoint; end;)
  private directionsWithWaypoints() {
    this.destination = 'Destination';
    // make a directions request using walking profile
    // an arbitrary start will always be the same
    // only the end or destination will change

    // Get Current Location Data
    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });

    // Its going to be the starting point
    var start = [this.lng, this.lat];

    // end is the latest waypoint

    var endString: string[] =
      this.waypoints[this.waypoints.length - 1].split(',');

    var end = [
      Number.parseFloat(endString[0]),
      Number.parseFloat(endString[1]),
    ];

    // everything in between is gradually added after start but before end
    // on display it should show waypoints with numbers of order
    var waypointsToUrl: string = '';

    if (this.waypoints.length > 0) {
      this.waypoints.forEach((value, index) => {
        waypointsToUrl += value + ';';
      });

      this.currentPosition = start;

      var url =
        'https://api.mapbox.com/directions/v5/mapbox/driving/' +
        start[0] +
        ',' +
        start[1] +
        ';' +
        waypointsToUrl +
        end[0] +
        ',' +
        end[1] +
        '?steps=true&geometries=geojson&access_token=' +
        environment.mapbox.accessToken;

      // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.onload = () => {
        this.routeFunction(req);
        //bool.
        // Do something with the retrieved data ( found in xmlhttp.response )
      };
      req.send();

      this.latestReq = req;
    } else {
      this.routeFunction(this.latestReq!);
    }
    this.currentDestination = end;
  }

  private getPlaceName(end: any[]): void {
    this.mapService.setAppTitle = '';

    // https://api.mapbox.com/geocoding/v5/mapbox.places/{longitude},{latitude}.json
    var url =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      end[0] +
      ',' +
      end[1] +
      '.json?access_token=' +
      environment.mapbox.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = () => {
      this.displayPlaceName(req);
    };
    req.send();
  }

  private displayPlaceName(req: XMLHttpRequest) {
    if (!req) return;
    var json = JSON.parse(req.response);

    this.mapService.setAppTitle = json.features[0].place_name;

    /*
     * 1. get the place name
     * 2. get the coordinates of the place
     * 3. get the coordinates of the clicked point
     * 4. get the bounding box of the clicked point
     * 5. check if the coordinates of the place is within the bounding box
     * 6. if yes, then use the coordinates of the place
     * 7. if no, then use the coordinates of the clicked point
     * 8. add the direction to the directionsService
     * 9. add the direction to the map
     *
     */
    var direction: Direction = {
      id: Math.random(),
      place_name: json.features[0].place_name,
      poi_coords:
        json.features[0].geometry.coordinates ?? json.features[0].center,
      clicked_coords: this.latestCoords,
      clicked_bbox1: this.latestBbox1,
      clicked_bbox2: this.latestBbox2,
    };

    if (
      this.inBoundingBox(
        direction.clicked_bbox1,
        direction.clicked_bbox2,
        direction.poi_coords
      )
    ) {
      direction.coords = direction.poi_coords;
    } else {
      direction.coords = direction.clicked_coords;
    }
    this.directionsService.addDirection = direction;
  }

  private getWholeRouteDriving(directions: Direction[]): void {
    if (directions.length < 2 && this.map) {
      // if (this.map.getLayer('route')) this.map.removeLayer('route');
      // if (this.map.getSource('route')) this.map.removeSource('route');
      return;
    }
    if (!directions || directions.length < 2) return;

    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });

    // https://api.mapbox.com/optimized-trips/v1/{profile}/{coordinates}

    var coordinteString = '';
    var comma = ',';
    var separator = ';';
    var latestCoords: number[] = [];

    for (const key in directions) {
      if (Object.prototype.hasOwnProperty.call(directions, key)) {
        const direction: any = directions[key];

        if (latestCoords != direction.poi_coords) {
          coordinteString +=
            '' +
            direction.poi_coords[0].toFixed(6) +
            comma +
            direction.poi_coords[1].toFixed(6) +
            separator;
        }
        latestCoords = direction.poi_coords;
      }
    }

    coordinteString = coordinteString.substring(0, coordinteString.length - 1);

    var url =
      'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' +
      coordinteString +
      '?steps=true&geometries=geojson&access_token=' +
      environment.mapbox.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = () => {
      // Do something with the retrieved data ( found in xmlhttp.response )
      this.wholeRouteFunction(req);
    };
    req.send();

    this.latestReq = req;
  }

  private getRouteDriving(end: any): void {
    this.currentPoint = end;

    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });

    var start = [this.lng, this.lat];

    if (!(this.currentPosition == start && this.currentDestination == end)) {
      this.currentPosition = start;

      var url =
        'https://api.mapbox.com/directions/v5/mapbox/driving/' +
        start[0] +
        ',' +
        start[1] +
        ';' +
        end[0] +
        ',' +
        end[1] +
        '?steps=true&geometries=geojson&access_token=' +
        environment.mapbox.accessToken;

      // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.onload = () => {
        // Do something with the retrieved data ( found in xmlhttp.response )
        this.routeFunction(req);
      };
      req.send();

      this.latestReq = req;
    } else {
      this.routeFunction(this.latestReq!);
    }
    this.currentDestination = end;
    this.destination = 'Roskis';
  }

  private getRoute(end: any): void {
    // make a directions request using walking profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    this.currentPoint = end;
    // if (localStorage.getItem("routeData")  !== null ) var obj = (localStorage.getItem("routeData"));

    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });

    var start = [this.lng, this.lat];

    // Täytyy katsoa distance dataa ja päätellä mikä roskis on lähinnä
    // tään jälkeen valita se reitiksi ja esittää  reitti

    if (!(this.currentPosition == start && this.currentDestination == end)) {
      this.currentPosition = start;

      var url =
        'https://api.mapbox.com/directions/v5/mapbox/walking/' +
        start[0] +
        ',' +
        start[1] +
        ';' +
        end[0] +
        ',' +
        end[1] +
        '?steps=true&geometries=geojson&access_token=' +
        environment.mapbox.accessToken;

      // if one would use mapbox directions api
      //   let directions = new MapboxDirections({
      //     accessToken: mapboxgl.accessToken,
      //     unit: 'metric',
      //     profile: 'mapbox/driving',
      //     interactive: false,
      //     controls: false
      // });

      // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.onload = () => {
        this.routeFunction(req);
        //bool.
        // Do something with the retrieved data ( found in xmlhttp.response )
      };
      req.send();

      this.latestReq = req;
    } else {
      this.routeFunction(this.latestReq!);
    }
    this.currentDestination = end;
    this.destination = 'Roskis';
  }

  private wholeRouteFunction(req: XMLHttpRequest) {
    // https://api.mapbox.com/optimized-trips/v1/mapbox/driving

    // code: "Ok"
    // trips: [,…]0: {geometry: {,…}, legs: [,…], weight_name: "routability", weight: 179.60000000000002, duration: 178.9,…}distance: 777.8duration: 178.9geometry: {,…}legs: [,…]weight: 179.60000000000002weight_name: "routability"
    // waypoints: [{distance: 55.848085634651085, name: "Moisionaukea", location: [23.762133, 61.34244],…},…]0: {distance: 55.848085634651085, name: "Moisionaukea", location: [23.762133, 61.34244],…}1: {distance: 0.11143697630438006, name: "Moisionaukea", location: [23.755621, 61.343742],…}

    if (!req && !JSON.parse(req)?.response) return;
    var json = JSON.parse(req.response);

    if (!localStorage.getItem('routeData')) {
      this.routeData.push(json.routes[0]);
      localStorage.setItem('routeData', JSON.stringify(this.routeData));
    }

    var data = json?.trips[0] ?? json?.routes[0];

    // this.distance = Math.ceil(Math.round(data.distance) / 5) * 5;

    // this.distanceToDestination = this.distance.toString() + 'm';
    // if (this.distance > 2500) {
    //   this.distanceToDestination = (data.distance / 1000).toFixed(2) + 'km';
    // }

    // this.digit = Math.round(Number.parseInt(this.distanceToDestination));

    // this.mapService.setAppTitle =
    //   this.mapService.appTitleString.split('|')[0] +
    //   '    |   ' +
    //   this.distanceToDestination;

    this.mapService.setAppTitle =
      this.mapService.appTitleString.split('|')[0] +
      '    |   ' +
      (json.routes[0].distance / 1000).toFixed(2) +
      ' km';

    if (data.geometry) {
      var route = data.geometry.coordinates;

      const geojsonFeature = {
        type: 'Feature' as const,
        properties: {
          name: 'route',
          amenity: 'Custom Route',
          popupContent: 'Route',
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: route,
        },
      };

      // if the route already exists on the map, reset it using setData
      if (this.map.getSource('route') && this.map.getLayer('route')) {
        const source: mapboxgl.GeoJSONSource = this.map.getSource(
          'route'
        ) as mapboxgl.GeoJSONSource;

        source.setData(geojsonFeature); // eslint-disable-line no-use-before-define
      } else {
        // otherwise, make a new request
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route, // eslint-disable-line no-use-before-define
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            // 'line-color': '#3887be',
            'line-color': '#ffc107',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }
    }
    // add turn instructions here at the end
  }

  private routeFunction(req: XMLHttpRequest) {
    // https://api.mapbox.com/directions/v5/mapbox/driving/

    // code: "Ok"
    // routes: [{weight_name: "auto", weight: 93.351, duration: 92.561, distance: 389.296,…}]0: {weight_name: "auto", weight: 93.351, duration: 92.561, distance: 389.296,…}uuid: "nAN535V6HTiyrC28Oz5Lo-pXugyKnOhUiw09r_PKgjJcZxgeQ5tkAA=="
    // waypoints: [{distance: 55.854, name: "Moisionaukea", location: [23.762133, 61.34244]},…]0: {distance: 55.854, name: "Moisionaukea", location: [23.762133, 61.34244]}1: {distance: 0.025, name: "Moisionaukea", location: [23.755621, 61.343742]}

    var json = JSON.parse(req.response);
    if (!req) return;

    if (!this.routeDataSet.has(json.routes[0])) {
      this.routeData.push(json.routes[0]);
      localStorage.setItem('routeData', JSON.stringify(this.routeData));
    }

    this.routeActivated = true;

    var data = json.routes[0];
    var route = data.geometry.coordinates; // route == json.routes[0].geometry.coordinates: Array(n[])

    this.distance = Math.ceil(Math.round(data.distance) / 5) * 5;

    this.distanceToDestination = this.distance.toString();
    if (this.distance > 2500) {
      this.distanceToDestination = (data.distance / 1000).toFixed(2);
    }

    this.digit = Math.round(Number.parseInt(this.distanceToDestination));

    const geojsonFeature = {
      type: 'Feature' as const,
      properties: {
        name: 'route',
        amenity: 'Custom Route',
        popupContent: 'Route',
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: route ?? [],
      },
    };

    // if the route already exists on the map, reset it using setData
    if (this.map.getSource('route')) {
      const source: mapboxgl.GeoJSONSource = this.map.getSource(
        'route'
      ) as mapboxgl.GeoJSONSource;
      source.setData(geojsonFeature); // eslint-disable-line no-use-before-define
    } else {
      // otherwise, make a new request
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route, // eslint-disable-line no-use-before-define
            },
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          // 'line-color': '#3887be',
          'line-color': '#ffc107',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
    // add turn instructions here at the end
  }

  private getNearestPoint(
    fromCoordindexes: any[],
    pointCoordinates: any[]
  ): number {
    // Return index of nearest point
    var arrayOfMatches: any[] = [];
    var routeLengths: any[] = [[], []]; //: Set<any> = new Set();
    var arrayOfMarkers = Array.from(this.markersToDisplay);

    fromCoordindexes.forEach((element) => {
      arrayOfMatches.push(arrayOfMarkers[element]);
      routeLengths[0].push(element);
    });

    for (let value of arrayOfMatches) {
      const R = 6371e3; // metres
      const φ1 = (pointCoordinates[0] * Math.PI) / 180; // φ, λ in radians
      const φ2 = (value.geometry.coordinates[0] * Math.PI) / 180;
      const Δφ =
        ((value.geometry.coordinates[0] - pointCoordinates[0]) * Math.PI) / 180;
      const Δλ =
        ((value.geometry.coordinates[1] - pointCoordinates[1]) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; // in metres

      routeLengths[1].push(d);
    } //)
    var arrayOfLenghts = routeLengths; // etäisyys bboxin sisällä olevista roskiksista
    var shortest = Math.min(...routeLengths[1]);
    var indexOfShortest = arrayOfLenghts[1].findIndex(
      (x: number) => x == shortest
    );

    return arrayOfLenghts[0][indexOfShortest];
  }

  private inBoundingBox(
    bl: /*bottom left*/ Coordinate,
    tr: /*top right*/ Coordinate,
    p: Coordinate
  ): Boolean {
    // in case longitude 180 is inside the box
    var isLongInRange =
      tr.lon < bl.lon
        ? p.lon >= bl.lon || p.lon <= tr.lon
        : p.lon >= bl.lon && p.lon <= tr.lon;

    return p.lat >= bl.lat && p.lat <= tr.lat && isLongInRange;
  }
}
