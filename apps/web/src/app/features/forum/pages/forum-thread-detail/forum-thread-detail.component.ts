import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { ForumThreadDetail } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-forum-thread-detail',
  templateUrl: './forum-thread-detail.component.html',
  styleUrls: ['./forum-thread-detail.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ForumThreadDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  threadId!: number;

  canModerate = false;

  loading = true;
  error: string | null = null;

  thread: ForumThreadDetail | null = null;
  reply = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly forum: ForumService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  private recomputeModerationRights(thread: ForumThreadDetail | null) {
    const role = this.auth.getUserRole();
    const userId = this.auth.getUserId();
    const ownerId = thread?.restaurant?.ownerId;

    this.canModerate = role === 'OWNER' && !!userId && !!ownerId && userId === ownerId;
  }

  get isOwner(): boolean {
    return this.auth.getUserRole() === 'OWNER';
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        distinctUntilChanged(),
        switchMap((id) => {
          const num = Number(id);
          if (!id || Number.isNaN(num) || num <= 0) {
            this.threadId = NaN as any;
            this.thread = null;
            this.canModerate = false;
            this.error = 'Ungültige Thread-ID in der URL.';
            this.loading = false;
            this.cdr.detectChanges();
            return of(null);
          }

          this.threadId = num;
          this.loading = true;
          this.error = null;
          this.thread = null;
          this.cdr.detectChanges();

          return from(this.forum.getThread(this.threadId)).pipe(
            catchError((e: any) => {
              console.error('[Forum] getThread ERROR', e);
              this.error = e?.error?.message ?? 'Fehler beim Laden des Threads';
              return of(null);
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((thread) => {
        this.thread = thread;
        this.recomputeModerationRights(thread);
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async sendReply() {
    this.thread = await this.forum.getThread(this.threadId);
    this.recomputeModerationRights(this.thread);
    if (!this.reply.trim() || !this.threadId || Number.isNaN(this.threadId)) return;

    try {
      this.error = null;
      await this.forum.createPost(this.threadId, this.reply);
      this.reply = '';
      // neu laden:
      this.loading = true;
      this.cdr.detectChanges();
      this.thread = await this.forum.getThread(this.threadId);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Fehler beim Posten';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async closeThread() {
    this.thread = await this.forum.getThread(this.threadId);
    this.recomputeModerationRights(this.thread);
    try {
      this.error = null;
      await this.forum.closeThread(this.threadId);
      this.loading = true;
      this.cdr.detectChanges();
      this.thread = await this.forum.getThread(this.threadId);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Fehler beim Schließen';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteThread() {
    this.thread = await this.forum.getThread(this.threadId);
    this.recomputeModerationRights(this.thread);
    try {
      this.error = null;
      await this.forum.deleteThread(this.threadId);

      // statt location.href (Full reload) sauber per Router navigieren
      if (this.thread) {
        await this.router.navigate(['/forum/restaurant', this.thread.restaurantId]);
      } else {
        await this.router.navigate(['/restaurants']);
      }
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Fehler beim Löschen';
      this.cdr.detectChanges();
    }
  }

  async deletePost(postId: number) {
    this.thread = await this.forum.getThread(this.threadId);
    this.recomputeModerationRights(this.thread);
    try {
      this.error = null;
      await this.forum.deletePost(postId);
      this.loading = true;
      this.cdr.detectChanges();
      this.thread = await this.forum.getThread(this.threadId);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Fehler beim Löschen des Posts';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
