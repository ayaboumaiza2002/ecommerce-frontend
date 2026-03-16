import { Component } from '@angular/core';
import { AdminLoginService } from '../../../service/admin-login.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'] // ✅ تصحيح هنا (styleUrls بدل styleUrl)
})
export class AdminLoginComponent {
  username = '';
  password = '';
  message = '';
  loading = false;

  showModal = false;
  email = '';

  constructor(private adminService: AdminLoginService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.message = 'Please fill in both fields.';
      return;
    }

    this.loading = true;

    this.adminService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;

        if (res === 'Connexion réussie') {
          localStorage.setItem('token', 'true');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.message = 'Invalid username or password.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error || 'Login failed.';
      }
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  resetPassword() {
    if (this.email.trim()) {
      alert(`Password reset link sent to ${this.email}`);
      this.closeModal();
    } else {
      alert('Please enter your email.');
    }
  }
}
