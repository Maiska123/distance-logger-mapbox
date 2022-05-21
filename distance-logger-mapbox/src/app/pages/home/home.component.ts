import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { MapEventType } from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GeoJson, FeatureCollection, Coordinate } from '../../interfaces/map';
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
  private subscription!: Subscription;

  private style = 'mapbox://styles/maiska/cl3fu5ycr003d15o41pktkgup';
  private lat = 61.498643;
  private lng = 23.762814;
  private currentPosition: any[] = [];
  private currentDestination: any[] = [];
  routeData: any[] = [];
  routeDataSet: Set<any> = new Set();
  routeActivated: boolean = false;
  distance: number | undefined;
  distanceToDestination: string | undefined;
  waypoints: string[] = [];
  latestReq: XMLHttpRequest | undefined;
  flyToDestinationChecked: boolean = false;
  clicked: any;
  offlineData: FeatureCollection | undefined;
  offlineMarkerData: any[] = [];
  currentPoint: any;
  markersToDisplay: Set<any> = new Set();
  message = 'Määränpää';
  eventData: any;

  constructor() {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com

  }


  ngAfterViewInit(): void {
    this.initializeMap();
  }


  createPoint(event: any, i: any) {
    var x, y;
    this.eventData = event;
    (x = event.pageX), (y = event.pageY);
    // console.log('x: '+x +' ' + 'y: '+ y);
    // this.map.on('click', (event) => {
    //   const coordinates = [event.lngLat.lng, event.lngLat.lat]
    // this.map.fire('click', (event));
    //this.eventFire(document.getElementById('map'), 'click');

    // this.map.queryRenderedFeatures();

    //   document.getElementById('map')
    // .dispatchEvent(new MouseEvent('click', { screenX: x, screenY: y }))
    this.simulatedClick(document.getElementsByClassName('mapboxgl-canvas')[0], {
      clientX: x,
      clientY: y,
    });
    // this.simulatedClick(document.getElementById('map'))
    // this.map.fire('foo');
  }

  simulatedClick(target: any, options?: any) {
    // console.log('this.simulatedClick');
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


  flyToCoords(coords: any[]) {
    // this.cameraRotate = !this.cameraRotate;
    this.map.flyTo({
      center: coords as mapboxgl.LngLatLike, // eslint-disable-line no-use-before-define
      zoom: 17,
    });
  }

  private initializeMap() {
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

  buildMap() {
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
    // MAPBOX NAVIGATION CONTROLS
    // this.directions = new this.MapboxDirections({
    //   accessToken: environment.mapbox.accessToken,
    //   unit: 'metric',
    //   profile: 'mapbox/walking',
    //   alternatives: true,
    //   geometries: 'geojson',
    //   controls: { inputs:true, instructions: true, profileSwitcher:false },
    //   flyTo: false,
    //   language: 'fi'
    //   });

    //   this.map.addControl(this.directions, "bottom-right");
    this.map.on('click', (event) => {
      // console.log('this.map.on(click, (event)');
      // var point = turf.point([23.84629822, 61.44356812]);
      // var buffered = turf.buffer(point, 5, {units:'kilometers'});
      // var bbox = turf.bbox(buffered);
      // console.log(turf.bboxPolygon(bbox));
      // var features = this.map.queryRenderedFeatures(bbox, {
      // layers: ['counties']
      // });

      // Run through the selected features and set a filter
      // to match features with unique FIPS codes to activate
      // the `counties-highlighted` layer.
      // var filter = features.reduce(
      //   function (memo, feature) {
      //   memo.push(feature.properties.FIPS);
      //   return memo;
      //   },
      //   ['in', 'FIPS']
      // );

      //map.setFilter('counties-highlighted', filter);

      const coordinates = [event.lngLat.lng, event.lngLat.lat];
      const newMarker = new GeoJson(coordinates, { message: this.message });
      //console.log(newMarker)

      // set bbox as 5px reactangle area around clicked point
      var bboxClick = [
        // [event.point.x - 5, event.point.y - 5],
        // [event.point.x + 5, event.point.y + 5]
        [event.lngLat.lng - 0.0005, event.lngLat.lat - 0.0005],
        [event.lngLat.lng + 0.0005, event.lngLat.lat + 0.0005],
      ];

      //console.log(bbox);

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
          //  console.log(element);
          //  console.log('true: ' + countInside);
          markerIndex.add(countInside);
        }
        countInside++;
        //  console.log(element.geometry.coordinates);
        // 0: 23.76598724
        // 1: 61.50039711
      });

      //var description = "<button class='btn btn-dark' onclick='+${this.getRoute(coordinates)}+'>Button</button>"

      const name = '';
      const innerHtmlContent = `<div style="font-size: large;color : black;background: rgba(#2EC4B6, 0.75);
    border-top: 5px solid rgba(#2EC4B6,0.75)">
                <h4 class="h4Class">${name} </h4> </div>`;

      const divElement = document.createElement('div');
      const routeBtn = document.createElement('div');
      const markerNewBtn = document.createElement('div');
      const assignBtn = document.createElement('div');
      const addToWaypoints = document.createElement('div');
      const flyToUser = document.createElement('div');
      var coords: any;

      addToWaypoints.innerHTML = `<button class="btn btn-success btn-simple text-white" >Add a Waypoint</button>`;
      routeBtn.innerHTML = `<button class="btn btn-success btn-simple text-white" >Get Route</button>`;
      markerNewBtn.innerHTML = `<button class="btn btn-success btn-simple text-white" >New Marker</button>`;
      flyToUser.innerHTML = `<button class="btn btn-success btn-simple text-white" >Fly To User</button>`;

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
      } /*else {this.clicked = !this.clicked}*/

      // markerIndex.forEach(index => {
      //   console.log(index);

      //   // jokaista napinpainalluksen alueelle sisältyvää kohden fly to nappi
      //   coords = this.offlineMarkerData[index].geometry.coordinates;

      //   console.log(coords);
      //   this.messageInBubble = this.offlineMarkerData[index].properties.message;
      //   //assignBtn.innerHTML = `<button class="btn btn-primary" (click)="flyTo(coords)">noh</button>`;
      //   assignBtn.innerHTML = `<button class="btn btn-primary" (click)="flyToCoords(coords)">${ this.messageInBubble }</button>`;
      //   // assignBtn.innerHTML = `<button class="btn btn-success btn-simple text-white" >Do Something</button>`;
      //   divElement.appendChild(assignBtn);
      //   console.log(assignBtn);

      // });

      divElement.innerHTML = innerHtmlContent;
      divElement.appendChild(routeBtn);
      divElement.appendChild(addToWaypoints);
      divElement.appendChild(assignBtn);
      divElement.appendChild(flyToUser);

      // btn.className = 'btn';

      // const popup = new mapboxgl.Popup({
      //     offset: 25
      //   })
      //   .setDOMContent(divElement);

      var popup = new mapboxgl.Popup()
        .setLngLat(
          // this.flyToDestinationChecked
          //   ? this.clickedBinCoords(markerIndex, coords, coordinates):
            coordinates as mapboxgl.LngLatLike
        ) // eslint-disable-line no-use-before-define
        //.setHTML(description)
        .addTo(this.map)
        .setDOMContent(divElement);

        // console.log(popup)
      //console.log(description);
      //console.log();

      this.clicked = true;
      // addEventListener

      if (!Array.from(markerIndex)[0]) {
        divElement.appendChild(markerNewBtn);

        markerNewBtn.addEventListener('click', (e) => {
          // console.log('Button clicked' + name);
          // this.mapService.createMarker(newMarker);
          popup.remove();
          this.clicked = false;
        });
      }

      addToWaypoints.addEventListener('click', (e) => {
        // console.log('Button clicked' + name);
        this.waypoints.push(coordinates.toString());
        // console.log(this.waypoints)
        popup.remove();
        this.clicked = false;
      });

      routeBtn.addEventListener('click', (e) => {
        // console.log('Button clicked' + name);
        this.getRoute(coordinates);
        popup.remove();
        this.clicked = false;
      });

      assignBtn.addEventListener('click', (e) => {
        // console.log('Button clicked' + name);
        this.flyToCoords(coords);
        popup.remove();
        this.clicked = false;
      });

      flyToUser.addEventListener('click', (e) => {
        // console.log('Button clicked' + name);
        this.flyToCoords(this.currentPosition);
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

      //this.getRoute(coordinates);// mapService.createMarker(newMarker)
      // console.log(event)
    });

    /// Add realtime firebase data on map load'
    //@ts-ignore
    this.map.on('load', (event: any) => {
      this.map.touchZoomRotate.enable();
      this.map.dragPan
        .enable
        // {
        // // linearity: 0.3, // eslint-disable-line no-use-before-define
        // // easing: bezier(0, 0, 0.3, 1), // eslint-disable-line no-use-before-define
        // // maxSpeed: 2000, // eslint-disable-line no-use-before-define
        // // deceleration: 1500, // eslint-disable-line no-use-before-define
        // }
        (); // eslint-disable-line no-use-before-define
      this.map.keyboard.enable();

      // var noLocalData: boolean = localStorage.getItem('markers') == null;
      // // console.log(noLocalData);

      // if (noLocalData) {
      //   this.markers = this.mapService.getMarkers();

      //   //localStorage.setItem("markers", JSON.stringify(this.markers));
      //   console.log('did fetch markers from online');
      // } else {
      //   this.markers = null;
      //   this.offlineMarkerData = JSON.parse(localStorage.getItem('markers'));
      //   this.offlineData = new FeatureCollection(this.offlineMarkerData);

      //   //this.source.setData(offlineData)
      //   console.log('markers from offline');
      // }

      /// register source
      // this.map.addSource('firebase', {
      //   type: 'geojson',
      //   data: {
      //     type: 'FeatureCollection',
      //     features: [],
      //   },
      // });

      // /// get source
      // this.source = this.map.getSource('firebase');

      // // täytyy laittaa tämä data localstorageen ja jos se löytyy sieltä niin
      // // OLLA PÄIVITTÄMÄTTÄ UUDESTAAN KAIKKEA

      // if (noLocalData) {
      //   /// subscribe to realtime database and set data source
      //   this.markers.valueChanges().subscribe((markers) => {
      //     var valueChanged: boolean = false;

      //     let data = new FeatureCollection(markers);

      //     this.source.setData(data);

      //     markers.forEach((value) => {
      //       //console.log(this.markersToDisplay.findIndex(x => x==value.value));
      //       !this.markersToDisplay.has(value)
      //         ? (this.markersToDisplay.add(value), (valueChanged = true))
      //         : console.log('object already exists');
      //       // console.log(this.markersToDisplay);
      //       // console.log(value.geometry.coordinates);
      //     });
      //     localStorage.setItem('markers', JSON.stringify(markers));
      //     valueChanged
      //       ? (localStorage.removeItem('markers'),
      //         localStorage.setItem('markers', JSON.stringify(markers)))
      //       : console.log('values didnt change');
      //     //console.log(this.markersToDisplay)
      //   });
      // }

      // if (!noLocalData) {
      //   this.source.setData(this.offlineData);

      //   this.offlineMarkerData.forEach((value) => {
      //     //console.log(this.markersToDisplay.findIndex(x => x==value.value));
      //     !this.markersToDisplay.has(value)
      //       ? this.markersToDisplay.add(value)
      //       : console.log('object already exists');
      //     // console.log(this.markersToDisplay);
      //     // console.log(value.geometry.coordinates);
      //   });
      // }

      /// create map layers with realtime data
      this.map.addLayer({
        id: 'firebase',
        source: 'firebase',
        type: 'symbol',
        layout: {
          'text-field': '{message}',
          'text-size': 24,
          'text-transform': 'uppercase',
          'icon-image': 'bin',
          'text-offset': [0, 1.5],
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2,
        },
      });

      // add markers to map
      // geojson.features.forEach(function (marker) {
      //   // create a DOM element for the marker
      //   var el = document.createElement('div');
      //   el.className = 'marker';
      //   el.style.backgroundImage =
      //   'url(https://placekitten.com/g/' +
      //   marker.properties.iconSize.join('/') +
      //   '/)';
      //   el.style.width = marker.properties.iconSize[0] + 'px';
      //   el.style.height = marker.properties.iconSize[1] + 'px';
      //   el.style.backgroundSize = '100%';

      //   el.addEventListener('click', function () {
      //   window.alert(marker.properties.message);
      //   });

      //   // add marker to map
      //   new mapboxgl.Marker(el)
      //   .setLngLat(marker.geometry.coordinates)
      //   .addTo(map);
      //   });

      // make an initial directions request that
      // starts and ends at the same location
      var start = [this.lng, this.lat];
      //this.getRoute(start);

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
  directionsWithWaypoints() {
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
    // console.log(end);
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

  getRoute(end: any) {
    // make a directions request using walking profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    this.currentPoint = end;
    // if (localStorage.getItem("routeData")  !== null ) var obj = (localStorage.getItem("routeData"));

    // console.log(obj);

    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });

    var start = [this.lng, this.lat];

    // this.map.addLayer({
    //   id: 'point',
    //   type: 'circle',
    //   source: {
    //     type: 'geojson',
    //     data: {
    //       type: 'FeatureCollection',
    //       features: [{
    //         type: 'Feature',
    //         properties: {},
    //         geometry: {
    //           type: 'Point',
    //           coordinates: start
    //         }
    //       }
    //       ]
    //     }
    //   },
    //   paint: {
    //     'circle-radius': 10,
    //     'circle-color': '#3887be',
    //     'circle-stroke-color': 'black',
    //     'circle-stroke-width': 1,
    //   }
    // });

    ///////////////////////////////////////////////////
    // Täytyy katsoa distance dataa ja päätellä mikä roskis on lähinnä
    // tään jälkeen valita se reitiksi ja esittää  reitti

    //   console.log(start);
    //   console.log(this.currentPosition);
    // console.log(end);
    // console.log(this.currentDestination);
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
      //var bool: Observable<boolean>;

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
        //console.log(req)
        //test(req)
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

  routeFunction(req: XMLHttpRequest) {
    if (!req) return;
    var json = JSON.parse(req.response);

    if (!this.routeDataSet.has(json.routes[0])) {
      this.routeData.push(json.routes[0]);
      localStorage.setItem('routeData', JSON.stringify(this.routeData));
    }

    this.routeActivated = true;

    var data = json.routes[0];
    this.distance = Math.ceil(Math.round(data.distance) / 5) * 5;

    this.distanceToDestination = this.distance.toString();
    if (this.distance > 2500) {
      this.distanceToDestination = (data.distance / 1000).toFixed(2);
    }

    this.digit = Math.round(Number.parseInt(this.distanceToDestination));

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
  getNearestPoint(fromCoordindexes: any[], pointCoordinates: any[]): number {
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
      // console.log(element.geometry.coordinates);
      // console.log(d);
      // routeLengths.add([index, d]);
      routeLengths[1].push(d);
    } //)
    var arrayOfLenghts = routeLengths; // etäisyys bboxin sisällä olevista roskiksista
    //var markersOfLenghts = Array.from(this.markersToDisplay);
    var shortest = Math.min(...routeLengths[1]);
    var indexOfShortest = arrayOfLenghts[1].findIndex((x: number) => x == shortest);

    return arrayOfLenghts[0][indexOfShortest];
  }

  inBoundingBox(
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




  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    this.subscription.unsubscribe();
  }
}
