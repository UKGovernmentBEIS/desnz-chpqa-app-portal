import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { APP_ROUTES_TITLES } from '@shared/enums/page-title.enum';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private DEFAULT_PAGE_TITLE = 'CHPQA';

  updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitles = APP_ROUTES_TITLES;
    const pageUrl = snapshot.url.split('/').pop().split('#')[0];
    const allUrls = pageTitles.map(t => t.path.split('/').pop());

    let pageTitle = this.DEFAULT_PAGE_TITLE;
    if (pageUrl) {
      const isUrlValid = allUrls.includes(pageUrl);
      if (isUrlValid) {
        pageTitle = APP_ROUTES_TITLES
          .find(route => route.path.split('/').pop() === pageUrl)?.title;
      }
    }
    this.title.setTitle(pageTitle);
  }
  constructor(private title: Title) {
    super();
  }
}
