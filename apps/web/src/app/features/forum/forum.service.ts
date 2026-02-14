import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ForumThreadDetail, ForumThreadListItem, ForumPost } from './forum.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);

  listThreads(restaurantId: string) {
    return firstValueFrom(
      this.http.get<ForumThreadListItem[]>(`/api/forum/restaurants/${restaurantId}/threads`),
    );
  }

  getThread(threadId: number) {
    return firstValueFrom(this.http.get<ForumThreadDetail>(`/api/forum/threads/${threadId}`));
  }

  createThread(restaurantId: string, title: string, content: string) {
    return firstValueFrom(
      this.http.post<ForumThreadListItem>(`/api/forum/restaurants/${restaurantId}/threads`, {
        title,
        content,
      }),
    );
  }

  createPost(threadId: number, content: string) {
    return firstValueFrom(
      this.http.post<ForumPost>(`/api/forum/threads/${threadId}/posts`, { content }),
    );
  }

  closeThread(threadId: number) {
    return firstValueFrom(this.http.patch(`/api/forum/threads/${threadId}/close`, {}));
  }

  deleteThread(threadId: number) {
    return firstValueFrom(this.http.delete(`/api/forum/threads/${threadId}`));
  }

  deletePost(postId: number) {
    return firstValueFrom(this.http.delete(`/api/forum/posts/${postId}`));
  }
}
