import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ThemePalette } from '@angular/material/core';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'distance-logger-mapbox';

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  @ViewChild('#sidenav2')
  sidenav2!: MatSidenav;

  public navSticky: boolean = false;
  public isBigScreen: boolean = false;

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

  public setNavSticky2(event:boolean): void{
    this.navSticky = event;
  };

  public color: ThemePalette = 'primary';

  constructor(private observer: BreakpointObserver, private router: Router) {}

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
  }
}
