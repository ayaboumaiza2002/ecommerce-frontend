import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommandeService } from '../../../service/commande.service';
import { ProduiteService } from '../../../service/produite.service';
import { ContactService } from '../../../service/Contact.service'; 
import { SidebarComponent } from '../sidebare/sidebar.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [RouterModule, CommonModule, SidebarComponent],
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css']
})
export class DashbordComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebarComp!: SidebarComponent;
  @ViewChild('statusChart') statusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wilayaChart') wilayaChart!: ElementRef<HTMLCanvasElement>;

  totalCommandes: number = 0;
  totalProduct: number = 0;
  totalRevenue: number = 0;
  totalCustomers: number = 0;
  unreadCount: number = 0; 

  pendingOrders: any[] = [];
  bestSellingProducts: any[] = [];
  
  // --- الجزء الجديد الخاص بالنافذة المنبثقة ---
  messages: any[] = []; 
  showMessagesModal: boolean = false; 
  // ---------------------------------------

  private statusChartObj: any;
  private wilayaChartObj: any;

  constructor(
    private commandeService: CommandeService,
    private produiteService: ProduiteService,
    private contactService: ContactService 
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.loadUnreadMessagesCount();
  }

  // --- الدوال الجديدة للتحكم في النافذة ---
  openMessages(): void {
    this.showMessagesModal = true;
    this.contactService.getAllMessages().subscribe(data => {
      this.messages = data;
    });
  }

  closeMessages(): void {
    this.showMessagesModal = false;
  }

  markAsRead(id: number): void {
    this.contactService.markAsRead(id).subscribe(() => {
      const msg = this.messages.find(m => m.id === id);
      if (msg) msg.read = true;
      this.loadUnreadMessagesCount(); // لتحديث رقم الجرس مباشرة
    });
  }
  // ---------------------------------------

  loadAllData(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (orders) => {
        this.produiteService.getTotalProducts().subscribe(count => {
          this.totalProduct = count;
          this.calculateStats(orders);
          
          setTimeout(() => {
            this.initStatusChart(orders);
            this.initWilayaChart(orders);
          }, 0);
        });
      },
      error: (err) => console.error('Error loading dashboard data:', err)
    });
  }

  loadUnreadMessagesCount(): void {
    this.contactService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (err) => console.error('Error fetching unread count:', err)
    });
  }

  calculateStats(orders: any[]): void {
    this.totalCommandes = orders.length;

    this.totalRevenue = orders
      .filter(o => o.etat === 'Confirmed' || o.etat === 'Confirmées')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    this.totalCustomers = new Set(orders.map(o => o.client?.id)).size;

    this.pendingOrders = orders.filter(o => o.etat === 'Pending' || o.etat === 'En attente');

    const sales: any = {};
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const name = item.produit?.nom || 'Produit';
        sales[name] = (sales[name] || 0) + (item.quantite || 1);
      });
    });

    this.bestSellingProducts = Object.keys(sales)
      .map(name => ({ nom: name, sales: sales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }

  initStatusChart(orders: any[]): void {
    if (this.statusChartObj) this.statusChartObj.destroy();
    
    const confirmed = orders.filter(o => o.etat === 'Confirmed' || o.etat === 'Confirmées').length;
    const pending = orders.filter(o => o.etat === 'Pending' || o.etat === 'En attente');
    const pendingCount = pending.length;
    const cancelled = orders.filter(o => o.etat === 'Canceled' || o.etat === 'Cancelled' || o.etat === 'Annulées').length;

    const ctx = this.statusChart.nativeElement.getContext('2d');
    if (ctx) {
      this.statusChartObj = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Confirmées', 'En attente', 'Annulées'],
          datasets: [{ 
            data: [confirmed, pendingCount, cancelled], 
            backgroundColor: ['#000000', '#737373', '#E5E5E5'],
            borderWidth: 0
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  initWilayaChart(orders: any[]): void {
    if (this.wilayaChartObj) this.wilayaChartObj.destroy();
    
    const wilayaMap: any = {};
    orders.forEach(o => {
      const w = o.client?.wilaya || 'Autre';
      wilayaMap[w] = (wilayaMap[w] || 0) + 1;
    });

    const ctx = this.wilayaChart.nativeElement.getContext('2d');
    if (ctx) {
      this.wilayaChartObj = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(wilayaMap),
          datasets: [{ 
            label: 'Commandes', 
            data: Object.values(wilayaMap), 
            backgroundColor: '#000000' 
          }]
        },
        options: { 
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false 
        }
      });
    }
  }

  toggleSidebar() { 
    if (this.sidebarComp) this.sidebarComp.toggle(); 
  }
}