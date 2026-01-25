import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ForumService } from '../../forum.service';
import { ForumThreadDetail } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-forum-thread-detail',
    templateUrl: './forum-thread-detail.component.html',
    styleUrls: ['./forum-thread-detail.component.css'],
    imports: [CommonModule, FormsModule, RouterModule]
})
export class ForumThreadDetailComponent implements OnInit {
    threadId!: number;
    
    loading = true;
    error: string | null = null;
    
    thread: ForumThreadDetail | null = null;

    reply = '';

    constructor(
        private route: ActivatedRoute,
        private forum: ForumService,
        private auth: AuthService,
    ) {}

    get isLoggedIn(): boolean {
        return !!this.auth.getToken();
    }

    get isOwner(): boolean {
        return this.auth.getUserRole() === 'OWNER';
    }

    async ngOnInit() {
        this.threadId = Number(this.route.snapshot.paramMap.get('id'));
        await this.reload();
    }
    
    async reload() {
        try {
            this.loading = true;
            this.error = null;
            this.thread = await this.forum.getThread(this.threadId);
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim Laden des Threads';
        } finally {
            this.loading = false;
        }
    }

    async sendReply() {
        if (!this.reply.trim()) return;

        try {
            this.error = null;
            await this.forum.createPost(this.threadId, this.reply);
            this.reply = '';
            await this.reload();
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim Posten';
        }
    }

    async closeThread() {
        try {
            this.error = null;
            await this.forum.closeThread(this.threadId);
            await this.reload();
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim Schließen';
        }
    }

    async deleteThread() {
        try {
            this.error = null;
            await this.forum.deleteThread(this.threadId);
                //zurück zu restaurant seite(gehört vlt noch geändert)
            if (this.thread) {
                location.href = `/forum/restaurant/${this.thread.restaurantId}`;
            }
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim löschen';
        }
    }

    async deletePost(postId: number) {
        try {
            this.error = null;
            await this.forum.deletePost(postId);
            await this.reload();
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim Löschen des Posts';
        }
    }
    
}