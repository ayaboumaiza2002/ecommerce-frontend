import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduiteService } from '../../../service/produite.service';
import { CartService } from '../../../service/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  
  produit: any = null; // نضعه null في البداية
 // بدلي هاد السطر بالضبط
backendUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app';
  mainImageUrl: string = '';

  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produiteService: ProduiteService,
    private cartService: CartService 
  ) {
    // هذا السطر مهم جداً: يجبر Angular على إعادة بناء المكون عند تغيير الـ ID في الرابط
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    // جلب الـ ID من الرابط
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const id = Number(idParam); // تحويل آمن للرقم
      
      this.produiteService.getProduitById(id).subscribe({
        next: (data) => {
          console.log('Product loaded:', data);
          this.produit = data;
          
          // إعداد الصور (التأكد من المصفوفة الجديدة imageUrls)
          if (data.imageUrls && data.imageUrls.length > 0) {
            this.mainImageUrl = this.backendUrl + data.imageUrls[0];
          } else if (data.imageUrl) { 
            // fallback في حال كان الباك آند يرسل الاسم القديم أحياناً
            this.mainImageUrl = this.backendUrl + data.imageUrl;
          }

          // إعداد الخيارات الافتراضية
          if (data.tailleDisponible?.length > 0) this.selectedSize = data.tailleDisponible[0];
          if (data.couleurDisponible?.length > 0) this.selectedColor = data.couleurDisponible[0];
        },
        error: (err) => {
          console.error('Error fetching product details:', err);
          // إذا لم يجد المنتج، يمكننا إرجاع المستخدم للمتجر
          // this.router.navigate(['/shop']);
        }
      });
    }
  }

  updateMainImage(url: string) {
    this.mainImageUrl = this.backendUrl + url;
  }

  changeQty(val: number): void {
    if (this.produit) {
      const newQty = this.quantity + val;
      if (newQty >= 1 && newQty <= this.produit.quantiteStock) {
        this.quantity = newQty;
      }
    }
  }

  addToCart(): void {
    if (!this.selectedSize || !this.selectedColor) {
      alert('Please select size and color');
      return;
    }
    this.cartService.addToCart(this.produit, this.quantity, this.selectedSize, this.selectedColor);
    this.router.navigate(['/cart']);
  }

  confirmOrder(): void {
    if (!this.selectedSize || !this.selectedColor) {
      alert('Please select size and color');
      return;
    }
    this.cartService.addToCart(this.produit, this.quantity, this.selectedSize, this.selectedColor);
    this.router.navigate(['/checkout']);
  }
}