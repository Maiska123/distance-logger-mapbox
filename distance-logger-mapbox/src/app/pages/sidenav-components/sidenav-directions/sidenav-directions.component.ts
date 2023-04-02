import { Coordinate } from './../../../interfaces/map';
import { Direction } from 'src/app/interfaces/direction';
import { DirectionsService } from './../../../services/directions.service';
import { Observable, Observer, Subscription } from 'rxjs';
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
  public list: Direction[] = [];
  public calculatedDistances: calculatedDistanceBetweenPoints[] = [];
  private changeOccured: boolean = false;
  private subscription: Subscription = new Subscription();
  private intervalForRangesBetween: NodeJS.Timeout | undefined;

  constructor(
    private directionsService: DirectionsService /*, private cd: ChangeDetectorRef*/
  ) {
    this.subscription
      .add
      // this.directionsService.addresses$.subscribe((data) => {

      //   if (!data) return;

      //   let listItem = data.getElem();
      //   if (listItem) this.list.push(listItem);

      //   this.listOutput.emit(this.list);
      // })
      ();
  }

  public set setChangeOccured(value: boolean) {
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
    //   return returnValue;
    // }
    // return -1;
    let returnValue;
    let boolReturnValue = this.calculatedDistances[i] ? true : false;

    if (boolReturnValue) {
    }
    if (boolReturnValue)
      returnValue = this.calculatedDistances[i].distance ?? undefined;
    return returnValue ?? null;
  }

  public getCalculatedDistancePrevious(
    item: Direction,
    i: number
  ): Observable<string> {
    if (this.calculatedDistances.findIndex((data) => data.order == i) >= 0)
      return new Observable<string>((observer: Observer<string>) =>
        observer.next(
          (
            (this.calculatedDistances[
              this.calculatedDistances.findIndex((data) => data.order == i)
            ].distance ?? 0) / 1000
          )?.toFixed(1) ?? ''
        )
      );

    if (this.calculatedDistances.some((data) => data.order == i)) {
      let calc = this.calculatedDistances.findIndex((data) => data.order == i);
      if (calc < 0)
        return new Observable<string>((observer: Observer<string>) =>
          observer.next('')
        );

      let returnValue: number | undefined =
        this.calculatedDistances[calc].distance;
      return new Observable<string>((observer: Observer<string>) =>
        observer.next(returnValue ? (returnValue / 1000)?.toFixed(1) ?? '' : '')
      );
    } else {
      this.calculateDistances();
    }
    return new Observable<string>((observer: Observer<string>) =>
      observer.next('')
    );

    // }
    // return null;
  }

  /*
   * Called once when List of directions changes
   *
   * */
  public calculateDistances(): void {
    if (this.list[0] && this.list[1]) {
      this.calculatedDistances = [];

      // calculate distances again
      for (let index = 1; index <= this.list.length; index++) {
        if (this.list[index - 1] && this.list[index]) {
          let newCalculation: calculatedDistanceBetweenPoints = {
            order: index,
            id1: this.list[index - 1].id,
            id2: this.list[index].id,
            distance: this.calculateDistance(
              this.list[index - 1].id,
              this.list[index].id,
              true
            ) as number,
          };

          if (newCalculation.distance != 0)
            this.calculatedDistances?.push(newCalculation);
          else {
            if (this.intervalForRangesBetween) continue;
            else
              this.intervalForRangesBetween = setTimeout(() => {
                this.calculateDistances();
                clearTimeout(this.intervalForRangesBetween);
                this.intervalForRangesBetween = undefined;
              }, 1000);
          }

          // console.table(this.calculatedDistances);
        }
      }
    }
    this.setChangeOccured = false;
  }

  public getCalculatedDistance(
    item: Direction,
    index: number,
    isPrevious: boolean = false
  ) {
    if (
      this.calculatedDistances?.some(
        (data) =>
          (data.id1 == item.id && data.id2 == this.list[index + 1].id) ||
          (data.id2 == item.id && data.id1 == this.list[index + 1].id)
      )
    ) {
      let indexOfCalculation = this.calculatedDistances.findIndex(
        (data) =>
          (data.id1 == item.id && data.id2 == this.list[index + 1].id) ||
          (data.id2 == item.id && data.id1 == this.list[index + 1].id)
      );

      return (
        this.calculatedDistances[indexOfCalculation].distance ??
        (this.calculateDistance(
          item.id,
          this.list[index + 1].id ?? -1,
          true
        ) as number)
      );
    } else {
      /****** NO CALCULATED ENTRIES *********/
      if (this.changeOccured) this.calculateDistances();
      return 0;
    }
  }

  remove(index: number) {
    if (!this.list.length) return;
    this.list.splice(index, 1);
    this.calculatedDistances = this.calculatedDistances?.filter(
      (calculatedPoint) => {
        calculatedPoint.id1 !== index || calculatedPoint.id2 !== index;
      }
    );
    this.updateDirectionList();
    this.emitListEvent();
  }

  removeAll() {
    if (!this.list.length) return;
    this.list = [];
    this.updateDirectionList();
    this.emitListEvent();
  }

  removeFromItem(item: Direction) {
    this.list = this.list.filter((a) => a.id != item.id);
    // if deleted calculations, have to reclalculate in ORDER
    // this.calculatedDistances.filter((a) => a.id1 !== item.id && a.id2 !== item.id);// = [];
    this.updateDirectionList();
  }

  addFromItem(item: Direction) {
    this.list.push(item);
    // if deleted calculations, have to reclalculate in ORDER
    // this.calculatedDistances.filter((a) => a.id1 !== item.id && a.id2 !== item.id);// = [];
    this.updateDirectionList();
  }

  updateDirectionList() {
    this.calculatedDistances = [];
    this.directionsService.overwriteDirection = this.list;
  }

  emitListEvent() {
    this.listOutput.emit(this.list);
  }

  drop(event: CdkDragDrop<Direction[]>) {
    let array = Array.from(this.list);
    let previous = event.previousIndex;
    let current = event.currentIndex;
    moveItemInArray(array, previous, current);
    this.list = array;

    if (event.previousIndex !== event.currentIndex) this.updateDirectionList();
  }

  hasDuplicateNeighbor(item: Direction) {
    return this.list.filter((a) => a.coords == item.coords).length > 1;
  }

  calculateDistance(
    id1: number,
    id2: number,
    asNumber?: boolean
  ): string | number {
    return asNumber
      ? this.directionsService.returnDistanceToNext(id1, id2, true) ?? 0
      : this.directionsService.returnDistanceToNext(id1, id2);
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    this.subscription.add(
      this.directionsService.addresses$.subscribe((direction: Direction[]) => {
        if (!direction) return;

        if (direction.length < 2) {
          this.list = direction;
          return;
        }

        this.list = direction;

        // if (JSON.stringify(this.list) != JSON.stringify(direction)) return;
        if (this.calculatedDistances.length != this.list.length - 1) {
          this.calculateDistances();
        }
        this.setChangeOccured = true;

        // let listItem: Direction[] = this.list.filter(dir => {
        //   direction.includes(JSON.parse(JSON.stringify(dir)));
        // });

        // listItem.forEach((item) => {
        //   this.list.push(item);
        // });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
