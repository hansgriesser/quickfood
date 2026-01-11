import { ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AdminUsersService, AdminUser, UserRole } from "../../services/admin-users.service";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./admin-users.component.html",
  styleUrls: ["./admin-users.component.css"],
})
export class AdminUsersComponent {
    roles: (UserRole | 'ALL')[] = ['ALL', 'USER', 'OWNER', 'ADMIN'];
    suspendedFilters: ('ALL' | 'SUSPENDED' | 'NOT_SUSPENDED')[] = ['ALL', 'SUSPENDED', 'NOT_SUSPENDED'];

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

    constructor(
        private readonly adminUsers: AdminUsersService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        void this.load();
    }

    async onFilterChange(): Promise<void> {
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
        } catch (e: any) {
            this.error = e.message || e?.message || 'Failed to load users';
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    openUserActionModal(u: AdminUser): void {
        if(u.role === 'ADMIN') return;
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
        } catch (e: any) {
            this.modalError = e?.error?.message || e?.message || 'Action failed';
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
        } catch (e: any) {
            this.error = e.message || e?.message || 'Failed to warn user';
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
        } catch (e: any) {
            this.error = e.message || e?.message || 'Failed to suspend user';
        } finally {
            this.cdr.detectChanges();
        }
    }

    async unsuspend(user: AdminUser): Promise<void> {
        try {
            await this.adminUsers.unsuspend(user.id);
            alert('User unsuspended successfully');
            await this.load();
        } catch (e: any) {
            this.error = e.message || e?.message || 'Failed to unsuspend user';
        } finally {
            this.cdr.detectChanges();
        }
    }
}    