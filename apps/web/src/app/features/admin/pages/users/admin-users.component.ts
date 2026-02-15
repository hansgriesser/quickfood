import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import { UserRole, AdminUser } from '../../model/admin-user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  private readonly adminUsers = inject(AdminUsersService);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: (UserRole | 'ALL')[] = ['ALL', 'USER', 'OWNER', 'ADMIN'];
  suspendedFilters: ('ALL' | 'SUSPENDED' | 'NOT_SUSPENDED')[] = [
    'ALL',
    'SUSPENDED',
    'NOT_SUSPENDED',
  ];

  selectedRole: UserRole | 'ALL' = 'ALL';
  selectedSuspended: 'ALL' | 'SUSPENDED' | 'NOT_SUSPENDED' = 'ALL';

  loading = false;
  error: string | null = null;
  users: AdminUser[] = [];

  warnReason: Record<number, string> = {};
  suspendReason: Record<number, string> = {};
  suspendUntil: Record<number, string> = {};

  userActionModalOpen = false;
  modalUser: AdminUser | null = null;
  modalAction: 'WARN' | 'SUSPEND' = 'WARN';
  modalReason = '';
  modalUntil = ''; // datetime-local
  modalSubmitting = false;
  modalError: string | null = null;
  minSuspendDate = '';

  ngOnInit(): void {
    void this.load();
  }

  async onFilterChange(): Promise<void> {
    this.minSuspendDate = new Date().toISOString().slice(0, 10);
    await this.load();
  }

  private toSuspendParam(): boolean | undefined {
    if (this.selectedSuspended === 'ALL') return undefined;
    return this.selectedSuspended === 'SUSPENDED';
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      const role = this.selectedRole === 'ALL' ? undefined : this.selectedRole;
      const suspended = this.toSuspendParam();

      this.users = await this.adminUsers.list(role, suspended);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err.message || err?.message || 'Failed to load users';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openUserActionModal(u: AdminUser): void {
    if (u.role === 'ADMIN') return;
    this.modalUser = u;
    this.modalAction = 'WARN';
    this.modalReason = '';
    this.modalUntil = '';
    this.modalError = null;
    this.userActionModalOpen = true;
  }

  closeUserActionModal(): void {
    this.userActionModalOpen = false;
    this.modalUser = null;
    this.modalSubmitting = false;
    this.modalError = null;
  }

  async confirmUserAction(): Promise<void> {
    if (!this.modalUser) return;

    this.modalSubmitting = true;
    this.modalError = null;
    this.cdr.detectChanges();

    const untilLocal = this.modalUntil.trim();

    if (untilLocal) {
      const picked = new Date(untilLocal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today) {
        this.modalError = 'Suspend until date cannot be in the past';
        this.modalSubmitting = false;
        this.cdr.detectChanges();
        return;
      }
    }

    try {
      const reason = this.modalReason.trim() || undefined;

      if (this.modalAction === 'WARN') {
        await this.adminUsers.warn(this.modalUser.id, reason);
        this.closeUserActionModal();
        return;
      }

      const untilLocal = this.modalUntil.trim();
      const until = untilLocal ? new Date(untilLocal).toISOString() : undefined;

      await this.adminUsers.suspend(this.modalUser.id, until, reason);
      this.closeUserActionModal();
      await this.load();
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.modalError = err?.error?.message || err?.message || 'Action failed';
    } finally {
      this.modalSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async warn(user: AdminUser): Promise<void> {
    try {
      const reason = (this.warnReason[user.id] || '').trim() || undefined;
      await this.adminUsers.warn(user.id, reason);
      alert('User warned successfully');
      this.warnReason[user.id] = '';
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err.message || err?.message || 'Failed to warn user';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async suspend(user: AdminUser): Promise<void> {
    try {
      const reason = (this.suspendReason[user.id] || '').trim() || undefined;
      const untilRaw = (this.suspendUntil[user.id] || '').trim();
      const until = untilRaw ? new Date(untilRaw).toISOString() : undefined;

      await this.adminUsers.suspend(user.id, until, reason);
      alert('User suspended successfully');
      this.suspendReason[user.id] = '';
      this.suspendUntil[user.id] = '';
      await this.load();
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err.message || err?.message || 'Failed to suspend user';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async unsuspend(user: AdminUser): Promise<void> {
    try {
      await this.adminUsers.unsuspend(user.id);
      alert('User unsuspended successfully');
      await this.load();
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error = err.message || err?.message || 'Failed to unsuspend user';
    } finally {
      this.cdr.detectChanges();
    }
  }
}
