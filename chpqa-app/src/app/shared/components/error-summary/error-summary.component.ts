import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPageScrollCoreModule, PageScrollService } from 'ngx-page-scroll-core';

@Component({
  selector: 'app-error-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPageScrollCoreModule],
  templateUrl: './error-summary.component.html',
  styleUrl: './error-summary.component.scss'
})
export class ErrorSummaryComponent {

  //TODO: Finish this and put it in all forms
  constructor(
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: Document
  ){}

  errors: {field: string, error: string}[] = [];

  @Input() formUpdated: any;
  @Input() form: FormGroup;

  ngOnChanges(changes: SimpleChanges){
    if(changes['formUpdated']){
      this.errors = [];
      if(this.form.touched){
        for (const field in this.form.controls) {
          const errors = this.form.get(field).errors;
          if(!errors) continue;
          Object.keys(errors).forEach(e => {
            this.errors.push({field, error: e});
          })
        }
      }
    }
  }

  @Input() validationMessages: {[key: string]: string};

  @ViewChild('errorsummary')
  errorSummaryElementRef: ElementRef;

  onClick(anchor: string): void {
    this.pageScrollService.scroll({
      document: this.document,
      duration: 100,
      interruptible: false,
      scrollTarget: `#${anchor}`,
    });

    setTimeout(() => {
      document.getElementById(anchor).focus();
    }, 100);

    setTimeout(() => {
      this.errorSummaryElementRef.nativeElement.blur();
    });
  }

}
