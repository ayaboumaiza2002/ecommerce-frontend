import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../service/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: any[] = [];
  total: number = 0;
  // بدلي هاد السطر بالضبط
backendUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app';
  cartCount: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.items = this.cartService.getItems();
    this.total = this.cartService.getTotalAmount();
    this.cartCount = this.items.length;
    
    // لتحديث المجموع والعدد إذا تم حذف عنصر
    this.cartService.getCartObservable().subscribe(updatedItems => {
      this.items = updatedItems;
      this.total = this.cartService.getTotalAmount();
      this.cartCount = updatedItems.length;
    });
  }

  // دالة لجلب السعر الصحيح (العادي أو البرومو)
  getPrice(item: any): number {
    return (item.produit.prixPromo && item.produit.prixPromo > 0) 
           ? item.produit.prixPromo 
           : item.produit.prix;
  }

  // دالة معالجة مصفوفة الصور الجديدة لحل مشكلة الصورة المكسورة
  getImgUrl(imageUrls: any): string {
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const path = imageUrls[0];
      return path.startsWith('http') ? path : `${this.backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return 'assets/images/placeholder.jpg';
  }

  remove(index: number) {
    this.cartService.removeItem(index);
  }
}