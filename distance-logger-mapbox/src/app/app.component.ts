import { MapService } from './services/map.service';
import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ThemePalette } from '@angular/material/core';
import { trigger, state, style, transition, animate, query, animateChild, group } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Direction } from './interfaces/direction';
@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('enabledStateChange', [
      state(
        'default',
        style({
			opacity: 1,
		})
	),
	state(
		'disabled',
		style({
			opacity: 0.5,
        })
      ),
      transition('* => *', animate('300ms ease')),
    ]),
  trigger('fadeSlideInOut', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('500ms ease-in', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      animate('100ms', style({ opacity: 0 })),
    ]),
  ]),
  ]
})
    // transition('* => *', [
    //   query(':enter', [
    //     style({ opacity: 0 }),
    //     stagger(100, [
    //       animate('500ms ease-in', style({ opacity: 1 })),
    //     ])
    //   ]
    //   )
    // ]),
export class AppComponent {
  title = 'distance-logger-mapbox';

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  @ViewChild('#sidenav2')
  sidenav2!: MatSidenav;

  private subscription!: Subscription;

  public navSticky: boolean = false;
  public isBigScreen: boolean = false;
  public helpWanted: boolean = false;
  public directionsWanted: boolean = false;
  private sidenavclosing: boolean = false;
  private sidenavManualclose: boolean = false;
  public appTitle: string = '';
  public direction: Direction[] = [];
  // private subscription: Subscription | undefined;

  public set setHelpWanted(bool:any) {
    this.helpWanted = bool;
    this.directionsWanted = !bool;
    // this.sidenav.toggle();
  }

  public get getIsHelpWanted() {
    return this.helpWanted;
  }

  public set setIsBigScreen(bool:any) {
    this.isBigScreen = bool;
  }

  public get getIsBigScreen(): boolean {
    return this.isBigScreen;
  }

  public get getNavSticky() {
    return this.navSticky;
  }

  public get sidenavOver(): boolean {
    return this.sidenav!! ? (this.sidenav.mode === 'over') : false
  };

  public setNavSticky(event:boolean): void {
    this.navSticky = event;
    if (event && !this.isBigScreen) this.sidenav.mode = 'side'
    else if (!event && !this.isBigScreen) this.sidenav.mode = 'over';
  };

  public openSwitchPanel(withHelp? :boolean) {
    if (this.navSticky) return;
    this.sidenavManualclose = true;
    withHelp ? this.setHelpWanted = true : this.setHelpWanted = false;
    if (!this.sidenav.opened) this.sidenav.toggle();
  }

  public color: ThemePalette = 'primary';

  constructor(private observer: BreakpointObserver, private router: Router, private mapService: MapService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.subscription.add(

      this.mapService.appTitle.subscribe((newTitle) => {
        this.appTitle = newTitle;
      })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1), untilDestroyed(this))
      .subscribe((res) => {
        if (res.matches) {
          this.setIsBigScreen = false;
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.setIsBigScreen = true;
          this.setNavSticky(false);
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.navSticky = false;
          this.sidenav.close();
        }
      });

      // this.sidenav.closedStart.subscribe(()=> {
      //   this.sidenavclosing = true;
      // });

      // this.sidenav.openedStart.subscribe(()=> {
      //   this.sidenavclosing = false;
      // });

      // this.sidenav._animationEnd.subscribe(()=> {
      //   if(this.sidenavclosing && (this.getIsHelpWanted || this.directionsWanted) && !this.sidenavManualclose) {
      //     this.sidenavManualclose = false;
      //     this.sidenav.toggle(true,'program');
      //   }
      // });
  }
}
