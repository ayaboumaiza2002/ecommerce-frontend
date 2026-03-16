import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebare/sidebar.component'; 
import { CommandeService } from '../../../service/commande.service';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../service/Contact.service'; 

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterModule, CommonModule, SidebarComponent, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebarComp!: SidebarComponent;

  commandes: any[] = [];
  filteredCommandes: any[] = [];
  searchTerm: string = '';
  
  unreadCount: number = 0; 
  showMessagesModal: boolean = false;
  messages: any[] = [];

  popupVisible = false;     
  showDetailsModal = false;  
  showDeleteModal = false; 

  selectedCommande: any = null;
  orderToDelete: any = null;
  nouvelEtat: string = '';

  constructor(
    private router: Router, 
    private commandeService: CommandeService,
    private contactService: ContactService 
  ) {}

  ngOnInit(): void {
    this.getCommandes();
    this.updateUnreadCount();

    // --- الإضافة الوحيدة لنظام الإشعارات ---
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setInterval(() => this.checkForNewOrders(), 30000); // فحص كل 30 ثانية
  }

  // --- دالة الإشعارات الجديدة ---
  checkForNewOrders() {
    this.commandeService.getAllCommandes().subscribe(data => {
      if (data.length > this.commandes.length) {
        if (Notification.permission === 'granted') {
           new Notification('Commande', { body: 'Nouvelle commande reçue !' });
        }
      }
      this.commandes = data.reverse(); 
      this.filteredCommandes = [...this.commandes]; 
    });
  }
  // ------------------------------------------

  getCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data.reverse(); 
        this.filteredCommandes = [...this.commandes]; 
      },
      error: (err) => console.error('Erreur loading orders', err)
    });
  }

  updateUnreadCount() {
    this.contactService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCommandes = [...this.commandes];
      return;
    }
    this.filteredCommandes = this.commandes.filter(cmd => {
      const matchId = cmd.id?.toString().includes(term);
      const clientName = (cmd.client?.nom || '') + ' ' + (cmd.client?.prenom || '');
      const matchName = clientName.toLowerCase().includes(term);
      const matchPhone = cmd.client?.telephone?.toString().includes(term);
      return matchId || matchName || matchPhone;
    });
  }

  openMessages() {
    this.showMessagesModal = true;
    this.contactService.getAllMessages().subscribe(data => {
      this.messages = data;
    });
  }

  closeMessages() {
    this.showMessagesModal = false;
  }

  markAsRead(id: number) {
    this.contactService.markAsRead(id).subscribe(() => {
      this.openMessages(); 
      this.updateUnreadCount();
    });
  }

  openDetails(cmd: any) {
    this.selectedCommande = cmd;
    this.showDetailsModal = true;
  }

  closeDetails() {
    this.showDetailsModal = false;
  }

  openStatusPopup(event: Event, cmd: any) {
    event.stopPropagation(); 
    this.selectedCommande = cmd;
    this.nouvelEtat = cmd.etat;
    this.popupVisible = true;
  }

  fermerPopup() {
    this.popupVisible = false;
  }

  confirmerEtat() {
    if (this.selectedCommande && this.nouvelEtat) {
      this.commandeService.updateEtatCommande(this.selectedCommande.id, this.nouvelEtat)
        .subscribe(updated => {
          this.selectedCommande.etat = updated.etat;
          this.popupVisible = false;
        });
    }
  }

  deleteOrder(event: Event, cmd: any): void {
    event.stopPropagation(); 
    this.orderToDelete = cmd;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.orderToDelete = null;
  }

  confirmDelete(): void {
    if (this.orderToDelete) {
      this.commandeService.deleteCommande(this.orderToDelete.id).subscribe({
        next: () => {
          this.commandes = this.commandes.filter(c => c.id !== this.orderToDelete.id);
          this.onSearchChange(); 
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting order', err);
          this.cancelDelete();
        }
      });
    }
  }

  toggleSidebar() { this.sidebarComp.toggle(); }
}