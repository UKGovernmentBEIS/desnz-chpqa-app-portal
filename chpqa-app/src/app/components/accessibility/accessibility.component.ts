import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [],
  templateUrl: './accessibility.component.html',
  styleUrl: './accessibility.component.scss',
})
export class AccessibilityComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
