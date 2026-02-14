import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { OwnerNavComponent } from '../../components/nav/owner-nav.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterModule, OwnerNavComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css'],
})
export class OwnerDashboardComponent {}
