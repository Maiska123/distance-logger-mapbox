import { Coordinate } from './../../../interfaces/map';
import { Direction } from 'src/app/interfaces/direction';
import { DirectionsService } from './../../../services/directions.service';
import { Subscription } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sidenav-directions',
  templateUrl: './sidenav-directions.component.html',
  styleUrls: ['./sidenav-directions.component.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1, height: '*' }),
      animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
       style({
         transform: 'scale(0.5)', opacity: 0,
         height: '0px', margin: '0px'
       }))
    ])

    ]),

  ]
})
export class SidenavDirectionsComponent implements OnInit {

  @Output() listOutput = new EventEmitter<Direction[]>();
  list: Direction[] = [];

  private subscription!: Subscription;

  remove(index: number) {
    if(!this.list.length) return;
    this.list.splice(index, 1);
    this.updateDirectionList();
    this.emitListEvent();
  }

  removeFromItem(item: Direction){
    this.list = this.list.filter(a => a.id != item.id)
    this.updateDirectionList();
  }

  addFromItem(item: Direction){
    this.list.push(item);
    this.updateDirectionList();
  }

  updateDirectionList(){
    this.directionsService.overwriteDirection = this.list;
  }

  emitListEvent() {
    this.listOutput.emit(this.list);
  }

  drop(event: CdkDragDrop<Direction[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    if(event.previousIndex !== event.currentIndex) this.updateDirectionList();
  }

  constructor(private directionsService: DirectionsService ) {
    this.subscription = new Subscription();
   }

  ngOnInit(): void {
    this.subscription.add(
      this.directionsService.directionsArray$.subscribe((directionArray: Direction[]) => {
        this.list = directionArray;
      }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
