import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signed-out',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sign-out.page.component.html',
})
export class SignedOutComponent {}
