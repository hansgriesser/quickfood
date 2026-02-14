import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, from, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ForumService } from '../../forum.service';
import { ForumThreadListItem } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forum-thread-list',
  templateUrl: './forum-thread-list.component.html',
  styleUrls: ['./forum-thread-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ForumThreadListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly forum = inject(ForumService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  restaurantId!: string;

  loading = true;
  error: string | null = null;

  threads: ForumThreadListItem[] = [];

  title = '';
  content = '';

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        distinctUntilChanged(),
        tap((id) => {
          this.error = null;
          this.loading = true;
          this.threads = [];

          const isValid = id && id !== 'undefined' && id !== 'null';

          if (!isValid) {
            this.error = 'Restaurant-ID fehlt oder ist ungültig.';
            this.restaurantId = '';
            this.loading = false;
          } else {
            this.restaurantId = id!;
          }
          this.cdr.detectChanges();
        }),
        filter((id): id is string => !!id && id !== 'undefined' && id !== 'null'),
        switchMap((id) =>
          from(this.forum.listThreads(id)).pipe(
            catchError((e: HttpErrorResponse) => {
              console.error('[Forum] listThreads ERROR', e);
              this.error = e?.error?.message ?? e?.message ?? 'Fehler beim Laden der Threads';
              return of([] as ForumThreadListItem[]);
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.threads = data;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async createThread() {
    try {
      this.loading = true;
      this.error = null;
      await this.forum.createThread(this.restaurantId, this.title, this.content);
      this.title = '';
      this.content = '';

      this.cdr.detectChanges();
      this.threads = await this.forum.listThreads(this.restaurantId);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.loading = false;
      this.cdr.detectChanges();
      this.error = err?.error?.message ?? 'Fehler beim Erstellen des Threads';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
