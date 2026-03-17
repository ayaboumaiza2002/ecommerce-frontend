import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProduiteService } from '../../../service/produite.service';
import { CartService } from '../../../service/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  newProducts: any[] = [];
  categories: string[] = [];
  categoryImages: { [key: string]: string } = {}; 
  // بدلي هاد السطر بالضبط
backendUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app';
  cartCount: number = 0;
  currentIndex: number = 0;

  constructor(
    private produitService: ProduiteService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // 1. جلب المنتجات الجديدة
    this.produitService.getNewArrivals().subscribe({
      next: (data) => this.newProducts = data,
      error: (err) => console.error('Error fetching new arrivals:', err)
    });

    // 2. جلب الفئات وصورها مباشرة من الـ Backend المحدث
    this.produitService.getCategoriesWithImages().subscribe({
      next: (data: any) => {
        this.categoryImages = data; // يحتوي على { "Abaya": "/uploads/name.jpg", ... }
        this.categories = Object.keys(data); 
      },
      error: (err) => console.error('Error fetching categories:', err)
    });

    // 3. تحديث عداد السلة
    this.cartService.getCartObservable().subscribe(items => {
      this.cartCount = items.length;
    });
  }

  // دالة لجلب الرابط الكامل للصورة
  getCategoryImg(cat: string): string {
    const relativePath = this.categoryImages[cat];
    if (!relativePath) return 'assets/images/placeholder.jpg';
    
    // دمج الرابط الأساسي مع المسار القادم من الـ Backend
    return `${this.backendUrl}${relativePath}`;
  }

  // دالة لجلب رابط الصورة للمنتجات (للـ New Arrivals)
  getImgUrl(imageUrls: any): string {
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const path = imageUrls[0];
      return path.startsWith('http') ? path : `${this.backendUrl}${path}`;
    }
    return 'assets/images/placeholder.jpg';
  }

  get visibleCategories() {
    // التحقق من عرض الشاشة (أقل من 768px يعني موبايل)
    const isMobile = window.innerWidth < 768;

    if (this.categories.length === 0) return [];

    if (isMobile) {
      // في الموبايل: نرجع عنصر واحد فقط
      return [this.categories[this.currentIndex % this.categories.length]];
    } else {
      // في الديسكتوب: نرجع عنصرين كما كان الحال سابقاً
      const firstIndex = this.currentIndex % this.categories.length;
      const secondIndex = (this.currentIndex + 1) % this.categories.length;
      return [this.categories[firstIndex], this.categories[secondIndex]];
    }
  }
  nextCategory() {
    if (this.categories.length <= 2) return;
    this.currentIndex = (this.currentIndex + 1) % this.categories.length;
  }

  prevCategory() {
    if (this.categories.length <= 2) return;
    this.currentIndex = (this.currentIndex - 1 + this.categories.length) % this.categories.length;
  }
}