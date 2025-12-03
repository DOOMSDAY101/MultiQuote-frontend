import { Component, OnInit } from '@angular/core';
import { BasicStatus, PaginatedUsers, UserRole, User } from '../../../models/user.model';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: false,
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  paginatedUsers: User[] = [];
  totalPages: number = 0;


  selectedUser: User | null = null;
  constructor(private apiService: ApiService,
    private toastr: ToastrService
  ) { }


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res: PaginatedUsers) => {
        this.users = res.users;
        this.filteredUsers = [...res.users];
        this.totalPages = res.pagination.totalPages;

        if (res.users.length === 0) {
          this.toastr.info('No users found', 'Info');
        }

        this.updatePagination();
      },
      error: (err) => {
        console.error('Error fetching users:', err)

        this.toastr.error(
          err?.error?.message || 'Failed to fetch users',
          'Error'
        );
        // Clear table if fetch fails
        this.users = [];
        this.filteredUsers = [];
        this.paginatedUsers = [];
        this.totalPages = 0;
      }
    });
  }

  searchUsers() {
    this.currentPage = 1; // reset to first page
    this.loadUsers();
  }


  updatePagination() {
    this.paginatedUsers = [...this.filteredUsers];
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  addUser() {
    alert('Add User clicked (mock)');
  }

  editUser(user: User) {
    alert(`Edit ${user.firstName} clicked (mock)`);
  }


  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.firstName}?`)) {
      this.users = this.users.filter((u) => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
    }
  }

  viewUser(user: User) {
    this.selectedUser = user;

    // Show Bootstrap modal
    const modalEl = document.getElementById('userDetailModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }
}

