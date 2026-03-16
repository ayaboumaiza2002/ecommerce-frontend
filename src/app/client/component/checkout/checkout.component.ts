import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../service/cart.service';
import { ALGERIA_DATA, SHIPPING_FEES } from '../algeria-cities'; 

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  @ViewChild('orderForm') orderForm!: NgForm;

  backendUrl = 'http://localhost:8081'; // الرابط الأساسي للصور
  wilayas = Object.keys(ALGERIA_DATA);
  communesMapping = ALGERIA_DATA;
  filteredCommunes: string[] = [];

  cartItems: any[] = [];
  totalAmount: number = 0; 
  shippingFee: number = 0; 
  isLoading: boolean = false;
  deliveryType: 'home' | 'bureau' = 'home'; 
  
  clientData = {
    nom: '', prenom: '', telephone: '', email: '', 
    wilaya: '', commune: '', adresseExacte: ''
  };

  constructor(private cartService: CartService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const rawItems = this.cartService.getItems();
    this.cartItems = rawItems.map(item => {
      const activePrice = (item.produit.prixPromo && item.produit.prixPromo > 0) 
                          ? item.produit.prixPromo 
                          : item.produit.prix;
      return {
        ...item,
        currentPrice: activePrice,
        calculatedSousTotal: activePrice * item.quantite
      };
    });

    this.totalAmount = this.cartItems.reduce((acc, item) => acc + item.calculatedSousTotal, 0);

    if (this.cartItems.length === 0) {
      this.router.navigate(['/shop']);
    }
  }

  // دالة لتوليد رابط الصورة بشكل صحيح
  getImgUrl(imageUrls: string[]): string {
    if (imageUrls && imageUrls.length > 0) {
      const path = imageUrls[0];
      return path.startsWith('http') ? path : `${this.backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return 'assets/images/placeholder.jpg';
  }

  onWilayaChange() {
    this.filteredCommunes = this.communesMapping[this.clientData.wilaya] || [];
    this.clientData.commune = ''; 
    this.calculateShipping();
  }

  setDeliveryType(type: 'home' | 'bureau') {
    this.deliveryType = type;
    this.calculateShipping();
  }

  calculateShipping() {
    const selected = this.clientData.wilaya;
    if (selected && SHIPPING_FEES[selected]) {
      this.shippingFee = this.deliveryType === 'home' 
                         ? SHIPPING_FEES[selected].home 
                         : SHIPPING_FEES[selected].bureau;
    } else {
      this.shippingFee = 0;
    }
  }

  getFinalTotal(): number {
    return this.totalAmount + this.shippingFee;
  }

  placeOrder() {
    if (this.cartItems.length === 0) return;
    this.isLoading = true;

    const commandeRequest = {
      client: this.clientData,
      items: this.cartItems.map(item => ({
        produit: { id: item.produit.id },
        quantite: item.quantite,
        taille: item.taille,
        couleur: item.couleur
      })),
      typeLivraison: this.deliveryType === 'home' ? 'À Domicile' : 'Stop Desk',
      fraisLivraison: this.shippingFee,
      totalPayer: this.getFinalTotal() 
    };

    this.http.post(`${this.backendUrl}/api/commandes/passer`, commandeRequest)
      .subscribe({
        next: () => {
          alert('Commande réussie! Total: ' + this.getFinalTotal() + ' DZ');
          this.cartService.clearCart();
          this.router.navigate(['/shop']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la validation de la commande.');
          this.isLoading = false;
        }
      });
  }
}