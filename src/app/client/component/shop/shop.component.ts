import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProduiteService } from '../../../service/produite.service';
import { CartService } from '../../../service/cart.service';
@Component({
  selector: 'app-shop',
  standalone: true,
   imports: [CommonModule, RouterModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent {
produits: any[] = [];
  // هذا الرابط لعرض الصور من الـ backend
  backendUrl = 'http://localhost:8081';
cartCount: number = 0;
  constructor(private produitService: ProduiteService ,private cartService: CartService) { }

  ngOnInit(): void {
    this.loadProducts();

  this.cartService.getCartObservable().subscribe(items => {
    this.cartCount = items.length;
  });
  }

 // لا تغييرات كبيرة هنا، الكود الخاص بكِ سليم
loadProducts() {
  this.produitService.getAllProducts().subscribe(
    (data) => {
      this.produits = data; // البيانات هنا تحتوي الآن على imageUrls (مصفوفة)
    },
    (error) => {
      console.error('Error fetching products', error);
    }
  );
}
}
