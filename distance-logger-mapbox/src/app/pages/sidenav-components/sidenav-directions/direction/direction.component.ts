import { Direction } from 'src/app/interfaces/direction';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Coordinate } from 'src/app/interfaces/map';
import { DirectionsService } from 'src/app/services/directions.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.scss'],
})
export class DirectionComponent implements OnInit {
  @Input() item!: Direction;
  //  = {
  //   id: -1,
  //   place_name: "Nowhere Town",
  //   poi_coords: [0, 0] as unknown as Coordinate,
  //   clicked_coords: [0, 0] as unknown as Coordinate,
  //   clicked_bbox1: [0, 0] as unknown as Coordinate,
  //   clicked_bbox2: [0, 0] as unknown as Coordinate,
  // };
  @Input() hasDuplicateNeighbor: boolean = false;

  @Output() itemOutputRemove = new EventEmitter<Direction>();
  @Output() itemOutputAdd = new EventEmitter<Direction>();

  constructor(private directionsService: DirectionsService) {}

  ngOnInit() {}

  sendClickEventFromDirection(item: Direction) {
    this.directionsService.sendClickEvent(item);
  }

  remove(item: Direction) {
    this.emitListEventRemove(item);
  }

  emitListEventRemove(item: Direction) {
    this.itemOutputRemove.emit(item);
  }

  add(item: Direction) {
    // same item but invidual!
    const { id, ...rest } = item;
    const newItem: Direction = {
      id: this.directionsService.newDirectionId,
      ...rest,
    };
    this.emitListEventAdd(newItem);
  }

  emitListEventAdd(item: Direction) {
    this.itemOutputAdd.emit(item);
  }
}
