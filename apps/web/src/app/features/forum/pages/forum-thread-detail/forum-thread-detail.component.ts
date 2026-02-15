import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, from } from 'rxjs';
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
import { ForumThreadDetail } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forum-thread-detail',
  templateUrl: './forum-thread-detail.component.html',
  styleUrls: ['./forum-thread-detail.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ForumThreadDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly forum = inject(ForumService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  threadId: number | null = null;

  canModerate = false;

  loading = true;
  error: string | null = null;

  thread: ForumThreadDetail | null = null;
  reply = '';

  get isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  get isOwner(): boolean {
    return this.auth.getUserRole() === 'OWNER';
  }

  private recomputeModerationRights(thread: ForumThreadDetail | null) {
    if (!thread) {
      this.canModerate = false;
      return;
    }
    const role = this.auth.getUserRole();
    const userId = this.auth.getUserId();
    const ownerId = thread?.restaurant?.ownerId;

    this.canModerate = role === 'OWNER' && !!userId && !!ownerId && userId === ownerId;
  }

  // Hilfsfunktion (kann auch private Methode sein)
  private parseThreadId = (rawId: string | null): number | null => {
    const num = Number(rawId);
    return !rawId || Number.isNaN(num) || num <= 0 ? null : num;
  };

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => this.parseThreadId(params.get('id'))),
        distinctUntilChanged(),
        tap((id) => {
          this.error = null;
          this.loading = true;
          this.thread = null;

          this.threadId = id;

          if (!id) {
            this.error = 'Ungültige Thread-ID in der URL.';
            this.loading = false;
            this.canModerate = false;
          }
          this.cdr.detectChanges();
        }),
        filter((id): id is number => id !== null),
        switchMap((id) =>
          from(this.forum.getThread(id)).pipe(
            tap((thread) => {
              this.thread = thread;
              this.recomputeModerationRights(thread);
            }),
            catchError((e: HttpErrorResponse) => {
              console.error('[Forum] getThread ERROR', e);
              this.error = e?.error?.message ?? 'Fehler beim Laden des Threads';
              this.loading = false;
              this.cdr.detectChanges();
              return EMPTY;
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async sendReply() {
    if (!this.reply.trim()) return;
    if (!this.threadId) return;

    try {
      this.loading = true;
      this.error = null;
      this.cdr.detectChanges();

      await this.forum.createPost(this.threadId, this.reply);

      this.reply = '';

      this.thread = await this.forum.getThread(this.threadId);
      this.recomputeModerationRights(this.thread);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err?.error?.message ?? 'Fehler beim Posten';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async closeThread() {
    if (!this.threadId) return;

    try {
      this.loading = true;
      this.error = null;
      this.cdr.detectChanges();

      await this.forum.closeThread(this.threadId);

      this.thread = await this.forum.getThread(this.threadId);
      this.recomputeModerationRights(this.thread);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err?.error?.message ?? 'Fehler beim Schließen';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteThread() {
    if (!this.threadId) return;
    const restaurantId = this.thread?.restaurantId;

    try {
      this.loading = true;
      this.error = null;
      this.cdr.detectChanges();

      await this.forum.deleteThread(this.threadId);

      if (restaurantId) {
        await this.router.navigate(['/forum/restaurant', restaurantId]);
      } else {
        await this.router.navigate(['/restaurants']);
      }
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err?.error?.message ?? 'Fehler beim Löschen';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deletePost(postId: number) {
    if (!this.threadId) return;

    try {
      this.loading = true;
      this.error = null;
      this.cdr.detectChanges();

      await this.forum.deletePost(postId);
      this.thread = await this.forum.getThread(this.threadId);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err?.error?.message ?? 'Fehler beim Löschen des Posts';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
