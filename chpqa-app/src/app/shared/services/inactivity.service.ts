import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { KeycloakService } from "keycloak-angular";
import { fromEvent, merge, Observable, switchMap, takeUntil, tap, timer } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private warningTime = 11 * 60 * 1000; // 11 minute for testing inactivity warning
  private logoutTime = 13 * 60 * 1000; // 13 minutes for testing logout
  private tokenRefreshWarningTime = 2 * 60 * 1000; // 2 minutes before token expiration
  public showWarning = false;
  public countdown: string = '2:00'; // Displayed as MM:SS
  public isDebugMode = false;
  private isWarningShown = false; // Flag to ensure single warning
  private isLogoutInProgress = false; // Flag to ensure single logout process

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private keycloak: KeycloakService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public initInactivityTimer(): void {
    const activityEvents: Observable<any>[] = [
      fromEvent(this.document, 'mousemove'),
      fromEvent(this.document, 'click'),
      fromEvent(this.document, 'keydown'),
    ];

    merge(...activityEvents)
      .pipe(
        tap(() => {
          const currentTime = new Date().toLocaleTimeString();
          if (this.isDebugMode) {
            console.log(`User activity detected at ${currentTime}`);
          }
        }),
        switchMap(() =>
          timer(this.warningTime).pipe(
            tap(() => {
              if (!this.isWarningShown) {
                this.isWarningShown = true;
                if (this.isDebugMode) {
                  console.log('Inactivity Warning: You will be signed out soon.');
                }
                this.showWarningModal(true);
              }
            }),
            switchMap(() => timer(this.logoutTime - this.warningTime)),
            takeUntil(merge(...activityEvents)) // Reset timer if user becomes active again
          )
        )
      )
      .subscribe(() => {
        if (!this.isLogoutInProgress) {
          this.isLogoutInProgress = true;
          if (this.isDebugMode) {
            console.log('User has been logged out due to inactivity.');
          }
          this.logout();
        }
      });

    this.startTokenExpirationCheck();
  }

  public startTokenExpirationCheck(): void {
    if (this.keycloak.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      const tokenExpiryTimeInSeconds = tokenParsed?.exp;
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      const timeRemainingInSeconds = tokenExpiryTimeInSeconds - currentTimeInSeconds;

      if (this.isDebugMode) {
        console.log(`Token expires in ${timeRemainingInSeconds} seconds`);
      }

      const timeUntilWarning = timeRemainingInSeconds - this.tokenRefreshWarningTime / 1000;

      if (timeUntilWarning > 0) {
        timer(timeUntilWarning * 1000)
          .pipe(
            tap(() => {
              if (this.isDebugMode) {
                console.log('Token will expire in 2 minutes, showing modal...');
              }
              this.showWarningModal(true);
            })
          )
          .subscribe();
      } else {
        this.showWarningModal(false);
      }
    }
  }

  private showWarningModal(showWarning: boolean): void {
    this.ngZone.run(() => {
      this.showWarning = showWarning;
      this.startCountdown();
    });
  }

  private hideWarningModal(): void {
    this.ngZone.run(() => {
      this.showWarning = false;
    });
  }

  private startCountdown(): void {
    let timer = 120;

    const interval = setInterval(() => {
      if (timer > 0) {
        this.countdown = this.formatTime(timer); // Display countdown in MM:SS
        timer--;
      } else {
        clearInterval(interval);
        if (!this.isLogoutInProgress) {
          this.isLogoutInProgress = true;
          this.logout();
        }
      }
    }, 1000);
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  public logout(): void {
    this.ngZone.run(() => {
      this.keycloak.logout().then(data => {
        this.router.navigate(['/sign-out']);
      });
    });
  }

  public staySignedIn(): void {
    this.hideWarningModal();
    this.keycloak.updateToken(1200).then(tokenUpdated => {
      if (tokenUpdated) {
        if (this.isDebugMode) {
          console.log('Token updated');
        }
        this.startTokenExpirationCheck();
      } else {
        if (this.isDebugMode) {
          console.log('Failed to update token');
        }
        this.logout();
      }
    });
  }
}
