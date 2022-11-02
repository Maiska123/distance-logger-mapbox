import { Coordinate } from './../../../interfaces/map';
import { Direction } from 'src/app/interfaces/direction';
import { DirectionsService } from './../../../services/directions.service';
import { Observable, Subscription } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface calculatedDistanceBetweenPoints {
  order: number;
  id1: number;
  id2: number;
  distance?: number;
}
@Component({
  selector: 'app-sidenav-directions',
  templateUrl: './sidenav-directions.component.html',
  styleUrls: ['./sidenav-directions.component.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }), // initial
        animate(
          '1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
          style({ transform: 'scale(1)', opacity: 1 })
        ), // final
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*' }),
        animate(
          '1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
          style({
            transform: 'scale(0.5)',
            opacity: 0,
            height: '0px',
            margin: '0px',
          })
        ),
      ]),
    ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavDirectionsComponent implements OnInit {
  @Output() listOutput = new EventEmitter<Direction[]>();
  list: Direction[] = [];
  private calculatedDistances
  : calculatedDistanceBetweenPoints[] = [];
  private changeOccured: boolean = false;

  public set setChangeOccured(value: boolean) {
    console.table(['setChangeOccured',value]);
    this.changeOccured = value;
  }
  /*
   * Store calculated distances once to variables
   * - Change/calculate again if Direction list is modified
   *
   * includes:
   *   - getCalculatedDistance
   *   - getCalculatedDistanceNext
   *   - getCalculatedDistancePrevious
   *
   *
   * */
  public get getCalculatedDistanceHelper() {
    return -1;
  }
  public getCalculatedDistanceNext(item: Direction, i: number) {
    // let returnValue = 0;
    // let arr = this.calculatedDistances.filter((data: calculatedDistanceBetweenPoints) => {
    //   data.id1 === item.id || data.id2 === item.id
    // });

    // if (arr[0]) {
    //   let returnValue = arr.find((match) => {
    //     (match.id1 == this.list[i+1].id || match.id2 == this.list[i+1].id)
    //   });
    //   console.table(['returnValue - Next',returnValue, 'arr',arr]);
    //   return returnValue;
    // }
    // return -1;
    let returnValue;
    let boolReturnValue = this.calculatedDistances[i] ? true : false;
    console.log('boolReturnValue');
    console.log(boolReturnValue);
    if (boolReturnValue) {
      console.log(this.calculatedDistances[i]);
      console.log(this.calculatedDistances[i].distance);
      }
    if (boolReturnValue) returnValue = this.calculatedDistances[i].distance ?? undefined;
    return returnValue ?? null;
  }
  public getCalculatedDistancePrevious(item: Direction, i: number) {
    if (this.calculatedDistances[i] && this.calculatedDistances[i-1]) {
      let calc = this.calculatedDistances.findIndex((data) => data.id1 == item.id);
      let returnValue = this.calculatedDistances[calc].distance;
      return returnValue;
    }
    return null;
  }

  /*
  * Called once when List of directions changes
  *
  * */
  public calculateDistances(): void {

    if(!this.calculatedDistances[0] && this.list[0] && this.list[1]) {
      this.calculatedDistances = [];

      const newCalculation: calculatedDistanceBetweenPoints = {
        order: 1,
        id1: this.list[0].id,
        id2: this.list[1].id,
        distance: this.calculateDistance(
          this.list[0].id,
          this.list[1].id,
          true
        ) as number
      }

      if ((newCalculation?.distance ?? 0) > 0) this.calculatedDistances?.push(newCalculation);

    } else {
      console.log('this.list');
      console.log(this.list);
      this.calculatedDistances = [];

      // calculate distances again
      for (let index = 0;
        index < this.list.length;
        index++ )
      {
        if (this.list[index] && this.list[index + 1]){
          let newCalculation: calculatedDistanceBetweenPoints = {
            order: index,
            id1: this.list[index + 0].id,
            id2: this.list[index + 1].id,
            distance: this.calculateDistance(
              this.list[index + 0].id,
              this.list[index + 1].id,
              true
            ) as number
          }
          console.log('calculation: ' + newCalculation.distance);
          if ((newCalculation.distance)) this.calculatedDistances?.push(newCalculation);
          console.log('console.table(this.calculatedDistances);');
          console.table(this.calculatedDistances);
        }
      }
    }
    this.setChangeOccured = false;
  }

  public getCalculatedDistance(item: Direction, index: number, isPrevious: boolean = false) {

    if
      (
        this.calculatedDistances?.some( (data) =>
          data.id1 == item.id && data.id2 == this.list[index + 1].id ||
          data.id2 == item.id && data.id1 == this.list[index + 1].id)
      )
    {
      let indexOfCalculation = this.calculatedDistances
        .findIndex( (data) =>
        data.id1 == item.id && data.id2 == this.list[index + 1].id ||
        data.id2 == item.id && data.id1 == this.list[index + 1].id);

      if (this.calculatedDistances[indexOfCalculation].distance) return this.calculatedDistances[indexOfCalculation].distance;

      this.calculatedDistances[indexOfCalculation].distance
        = this.calculateDistance(
        item.id,
        this.list[index + 1].id ?? -1,
        true
      ) as number;

      return this.calculatedDistances[indexOfCalculation].distance;
    } else {
      console.log('no values');
      /****** NO CALCULATED ENTRIES *********/
      if (this.changeOccured) this.calculateDistances();
      return 0;
    }
  }

  private subscription!: Subscription;

  remove(index: number) {
    if (!this.list.length) return;
    this.list.splice(index, 1);
    this.calculatedDistances =
      this.calculatedDistances?.filter((calculatedPoint) => {
        calculatedPoint.id1 !== index || calculatedPoint.id2 !== index
      });
    this.updateDirectionList();
    this.emitListEvent();
  }

  removeFromItem(item: Direction) {
    this.list = this.list.filter((a) => a.id != item.id);
    this.updateDirectionList();
  }

  addFromItem(item: Direction) {
    this.list.push(item);
    this.updateDirectionList();
  }

  updateDirectionList() {
    // this.changeOccured = true;
    this.directionsService.overwriteDirection = this.list;
    // this.cd.markForCheck();
  }

  emitListEvent() {
    this.listOutput.emit(this.list);
  }

  drop(event: CdkDragDrop<Direction[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) this.updateDirectionList();
  }

  hasDuplicate(item: Direction) {
    return this.list.filter((a) => a.coords == item.coords).length > 1;
  }

  calculateDistance(
    id1: number,
    id2: number,
    asNumber?: boolean
  ): string | number {
    return asNumber
      ? (this.directionsService.returnDistanceToNext(
          id1,
          id2,
          true
        ) ?? 0)
      : this.directionsService.returnDistanceToNext(id1, id2);
  }

  constructor(
    private directionsService: DirectionsService /*, private cd: ChangeDetectorRef*/
  ) {
    this.subscription = new Subscription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes');
    console.log(changes);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.directionsService.directionsArray$.subscribe(
        (directionArray: Direction[]) => {
          this.setChangeOccured = true;
          this.list = directionArray;

          this.calculateDistances();

        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
