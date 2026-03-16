import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);

  constructor() { }

  addToCart(product: any, quantity: number, size: string, color: string) {
    const activePrice = (product.prixPromo && product.prixPromo > 0) 
                        ? product.prixPromo 
                        : product.prix;

    const cartItem = {
      quantite: quantity,
      taille: size,
      couleur: color,
      produit: { 
        id: product.id, 
        nom: product.nom, 
        prix: product.prix,
        prixPromo: product.prixPromo,
        // تأكدي من تمرير المصفوفة كاملة هنا
        imageUrls: product.imageUrls 
      },
      sousTotal: activePrice * quantity 
    };
    
    this.items.push(cartItem);
    this.cartSubject.next(this.items);
  }

  getCartObservable() {
    return this.cartSubject.asObservable();
  }

  getItems() {
    return this.items;
  }

  getTotalAmount(): number {
    return this.items.reduce((acc, item) => {
      const price = (item.produit.prixPromo && item.produit.prixPromo > 0) 
                    ? item.produit.prixPromo 
                    : item.produit.prix;
      return acc + (price * item.quantite);
    }, 0);
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);
    return this.items;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.cartSubject.next(this.items);
  }
}