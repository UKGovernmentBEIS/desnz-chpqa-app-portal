import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
