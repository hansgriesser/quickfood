import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ForumService } from '../../forum.service';
import { ForumThreadListItem } from '../../forum.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-forum-thread-list',
    templateUrl: './forum-thread-list.component.html',
    styleUrls: ['./forum-thread-list.component.css'],
    imports: [CommonModule, FormsModule, RouterModule]
})
export class ForumThreadListComponent implements OnInit {
    restaurantId!: string;

    loading = true;
    error: string | null = null;

    threads: ForumThreadListItem[] = [];

    title = '';
    content = '';

    constructor(
        private route: ActivatedRoute,
        private forum: ForumService,
        private auth: AuthService,
    ) {}

    get isLoggedIn(): boolean {
        return !!this.auth.getToken();
    }

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        if (!id || id === 'undefined' || id === 'null') {
            this.error = 'Restaurant-ID fehlt in der URL (Forum-Link ist falsch).';
            this.loading = false;
            return;
        }

        this.restaurantId = id;
        await this.reload();
    }

    async reload() {
        this.loading = true;
        this.error = null;

        try {
            const data = await this.forum.listThreads(this.restaurantId);
            console.log('[Forum] listThreads OK', { restaurantId: this.restaurantId, data });

            this.threads = Array.isArray(data) ? data : [];
        } catch (e: any) {
            console.error('[Forum] listThreads ERROR', e);
            this.error = e?.error?.message ?? e?.message ?? 'Fehler beim Laden der Threads';
            this.threads = [];
        } finally {
            this.loading = false;
            console.log('[Forum] loading=false');
        }
    }

    async createThread() {
        try {
            this.error = null;
            await this.forum.createThread(this.restaurantId, this.title, this.content);
            this.title = '';
            this.content = '';
            await this.reload();
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Fehler beim Erstellen des Threads';
        }
    }
}