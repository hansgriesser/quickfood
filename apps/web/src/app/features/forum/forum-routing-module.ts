import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForumThreadDetailComponent } from './pages/forum-thread-detail/forum-thread-detail.component';
import { ForumThreadListComponent } from './pages/forum-thread-list/forum-thread-list.component';


const routes: Routes = [
    { path: 'restaurant/:id', component: ForumThreadListComponent },
    { path: 'thread/:id', component: ForumThreadDetailComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ForumRoutingModule {}