import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ForumRoutingModule } from './forum-routing-module';
import { ForumThreadListComponent } from './pages/forum-thread-list/forum-thread-list.component';
import { ForumThreadDetailComponent } from './pages/forum-thread-detail/forum-thread-detail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ForumRoutingModule,
        ForumThreadListComponent,
        ForumThreadDetailComponent
    ],
})
export class ForumModule {}