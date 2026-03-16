import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // أضيفي RouterLinkActive
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../../service/commande.service'; // استيراد الخدمة

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild('sidebar') sidebar!: ElementRef;
  
  pendingCount: number = 0; // متغير لحفظ عدد الطلبات الجديدة

  constructor(private router: Router, private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.updateNotificationCount();
    
    // اختياري: تحديث العدد كل دقيقة تلقائياً
    setInterval(() => this.updateNotificationCount(), 60000);
  }

  updateNotificationCount() {
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        // حساب الطلبات اللي الحالة تاعها Pending فقط
        this.pendingCount = data.filter((cmd: any) => cmd.etat === 'Pending').length;
      },
      error: (err) => console.error('Error fetching count', err)
    });
  }

  logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
isMobileMenuOpen: boolean = false;
 toggle() {
    // إذا كنت في الموبايل، نبدل حالة الـ active فقط
    if (window.innerWidth <= 768) {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        // إضافة أو إزالة كلاس active
        if (this.isMobileMenuOpen) {
            this.sidebar.nativeElement.classList.add('active');
        } else {
            this.sidebar.nativeElement.classList.remove('active');
        }
    } else {
        // إذا كنت في الديسك توب، نبدل حالة الـ collapsed
        this.sidebar.nativeElement.classList.toggle('collapsed');
    }
}
}