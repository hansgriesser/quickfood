import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
})
export class AdminOverviewComponent {}
