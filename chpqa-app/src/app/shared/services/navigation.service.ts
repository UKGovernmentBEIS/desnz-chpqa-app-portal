import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { filter, Observable, pairwise, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private routerSubscription: Subscription;
  private previousURl =  'task-list';

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {  
        this.previousURl = event.urlAfterRedirects;
      };
    });
  }

  getPreviousUrl(): string | null {
    return this.previousURl;
  }

  navigateToTaskList(): void {
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/');
    urlSegments[urlSegments.length - 1] = 'task-list';
    const newUrl = urlSegments.join('/');
    this.router.navigateByUrl(newUrl);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
