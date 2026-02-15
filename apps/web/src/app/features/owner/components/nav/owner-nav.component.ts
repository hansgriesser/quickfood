import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-owner-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-nav.component.html',
  styleUrls: ['./owner-nav.component.css'],
})
export class OwnerNavComponent {}
