import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, from, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ForumService } from '../../forum.service';
import { ForumThreadListItem } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-forum-thread-list',
  templateUrl: './forum-thread-list.component.html',
  styleUrls: ['./forum-thread-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ForumThreadListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  restaurantId!: string;

  loading = true;
  error: string | null = null;

  threads: ForumThreadListItem[] = [];

  title = '';
  content = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly forum: ForumService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        distinctUntilChanged(),
        tap((id) => {
          if (!id || id === 'undefined' || id === 'null') {
            this.error = 'Restaurant-ID fehlt in der URL (Forum-Link ist falsch).';
            this.restaurantId = '';
            this.threads = [];
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          this.restaurantId = id;
        }),
        switchMap((id) => {
          if (!id || id === 'undefined' || id === 'null') return of([] as ForumThreadListItem[]);

          this.loading = true;
          this.error = null;
          this.cdr.detectChanges();

          return from(this.forum.listThreads(id)).pipe(
            catchError((e: any) => {
              console.error('[Forum] listThreads ERROR', e);
              this.error = e?.error?.message ?? e?.message ?? 'Fehler beim Laden der Threads';
              return of([] as ForumThreadListItem[]);
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        console.log('[Forum] listThreads OK', { restaurantId: this.restaurantId, data });
        this.threads = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async createThread() {
    try {
      this.error = null;
      await this.forum.createThread(this.restaurantId, this.title, this.content);
      this.title = '';
      this.content = '';

      // “reload” ist jetzt automatisch über param subscription abgedeckt,
      // aber wir können optional die Liste direkt neu holen:
      this.loading = true;
      this.cdr.detectChanges();
      this.threads = await this.forum.listThreads(this.restaurantId);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Fehler beim Erstellen des Threads';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
