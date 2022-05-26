import { Coordinate } from "./map";

export interface Direction {
  id: number,
  place_name: string,
  coords?: Coordinate,
  poi_coords: Coordinate,
  clicked_coords: Coordinate,
  clicked_bbox1: Coordinate
  clicked_bbox2: Coordinate
//   {
//     "type": "FeatureCollection",
//     "query": [
//         23.762814,
//         61.498643
//     ],
//     "features": [
//         {
//             "id": "poi.781684080502",
//             "type": "Feature",
//             "place_type": [
//                 "poi"
//             ],
//             "relevance": 1,
//             "properties": {
//                 "foursquare": "5baf62f23b8307002c48216c",
//                 "landmark": true,
//                 "wikidata": "Q11900349",
//                 "category": "music venue, music event space, music events venue"
//             },
//             "text": "Kulttuuritalo Laikku",
//             "place_name": "Kulttuuritalo Laikku, Tampere, Pirkanmaa 33100, Finland",
//             "center": [
//                 23.762115,
//                 61.498788000000005
//             ],
//             "geometry": {
//                 "coordinates": [
//                     23.762115,
//                     61.498788000000005
//                 ],
//                 "type": "Point"
//             },
//             "context": [
//                 {
//                     "id": "postcode.7888491074949910",
//                     "text": "33100"
//                 },
//                 {
//                     "id": "place.6057663633726600",
//                     "wikidata": "Q40840",
//                     "text": "Tampere"
//                 },
//                 {
//                     "id": "region.10457007847159210",
//                     "short_code": "FI-11",
//                     "wikidata": "Q5701",
//                     "text": "Pirkanmaa"
//                 },
//                 {
//                     "id": "country.9627851203425650",
//                     "wikidata": "Q33",
//                     "short_code": "fi",
//                     "text": "Finland"
//                 }
//             ]
//         },
//         {
//             "id": "postcode.7888491074949910",
//             "type": "Feature",
//             "place_type": [
//                 "postcode"
//             ],
//             "relevance": 1,
//             "properties": {},
//             "text": "33100",
//             "place_name": "33100, Tampere, Pirkanmaa, Finland",
//             "bbox": [
//                 23.755539,
//                 61.483313,
//                 23.823345,
//                 61.507761
//             ],
//             "center": [
//                 23.760312,
//                 61.498021
//             ],
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     23.760312,
//                     61.498021
//                 ]
//             },
//             "context": [
//                 {
//                     "id": "place.6057663633726600",
//                     "wikidata": "Q40840",
//                     "text": "Tampere"
//                 },
//                 {
//                     "id": "region.10457007847159210",
//                     "short_code": "FI-11",
//                     "wikidata": "Q5701",
//                     "text": "Pirkanmaa"
//                 },
//                 {
//                     "id": "country.9627851203425650",
//                     "wikidata": "Q33",
//                     "short_code": "fi",
//                     "text": "Finland"
//                 }
//             ]
//         },
//         {
//             "id": "place.6057663633726600",
//             "type": "Feature",
//             "place_type": [
//                 "place"
//             ],
//             "relevance": 1,
//             "properties": {
//                 "wikidata": "Q40840"
//             },
//             "text": "Tampere",
//             "place_name": "Tampere, Pirkanmaa, Finland",
//             "bbox": [
//                 23.542288,
//                 61.427238,
//                 24.118288,
//                 61.836395
//             ],
//             "center": [
//                 23.760312,
//                 61.498021
//             ],
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     23.760312,
//                     61.498021
//                 ]
//             },
//             "context": [
//                 {
//                     "id": "region.10457007847159210",
//                     "short_code": "FI-11",
//                     "wikidata": "Q5701",
//                     "text": "Pirkanmaa"
//                 },
//                 {
//                     "id": "country.9627851203425650",
//                     "wikidata": "Q33",
//                     "short_code": "fi",
//                     "text": "Finland"
//                 }
//             ]
//         },
//         {
//             "id": "region.10457007847159210",
//             "type": "Feature",
//             "place_type": [
//                 "region"
//             ],
//             "relevance": 1,
//             "properties": {
//                 "short_code": "FI-11",
//                 "wikidata": "Q5701"
//             },
//             "text": "Pirkanmaa",
//             "place_name": "Pirkanmaa, Finland",
//             "bbox": [
//                 22.4342990925229,
//                 60.9397040448008,
//                 24.9694869888971,
//                 62.4945759974901
//             ],
//             "center": [
//                 23.71667,
//                 61.7
//             ],
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     23.71667,
//                     61.7
//                 ]
//             },
//             "context": [
//                 {
//                     "id": "country.9627851203425650",
//                     "wikidata": "Q33",
//                     "short_code": "fi",
//                     "text": "Finland"
//                 }
//             ]
//         },
//         {
//             "id": "country.9627851203425650",
//             "type": "Feature",
//             "place_type": [
//                 "country"
//             ],
//             "relevance": 1,
//             "properties": {
//                 "wikidata": "Q33",
//                 "short_code": "fi"
//             },
//             "text": "Finland",
//             "place_name": "Finland",
//             "bbox": [
//                 20.508418,
//                 59.6258908,
//                 31.587859,
//                 70.092295
//             ],
//             "center": [
//                 26.199539005192,
//                 62.7777539652943
//             ],
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     26.199539005192,
//                     62.7777539652943
//                 ]
//             }
//         }
//     ],
//     "attribution": "NOTICE: © 2022 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service (https://www.mapbox.com/about/maps/). This response and the information it contains may not be retained. POI(s) provided by Foursquare."
// }
}
