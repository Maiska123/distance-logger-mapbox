import { Direction } from 'src/app/interfaces/direction';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.scss']
})
export class DirectionComponent implements OnInit {

  @Input() item!: Direction;
  @Output() itemOutputRemove = new EventEmitter<Direction>();
  @Output() itemOutputAdd = new EventEmitter<Direction>();

  constructor() { }

  ngOnInit() {
  }

  remove(item: Direction){
    this.emitListEventRemove(item)
  }

  emitListEventRemove(item: Direction) {
    this.itemOutputRemove.emit(item);
  }

  add(item: Direction){
    // same item but invidual!
    const {id, ...rest} = item;
    const newItem: Direction = {
      id: Math.random(),
      ...rest
    }
    this.emitListEventAdd(newItem)
  }

  emitListEventAdd(item: Direction) {
    this.itemOutputAdd.emit(item);
  }

}
