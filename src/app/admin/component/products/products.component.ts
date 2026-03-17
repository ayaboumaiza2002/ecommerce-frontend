import { Component, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebare/sidebar.component'; 
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../service/Contact.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SidebarComponent, RouterModule, FormsModule, CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  @ViewChild(SidebarComponent) sidebarComp!: SidebarComponent;

  // متغيرات المنتجات
  produits: any[] = [];
  filteredProduits: any[] = [];
  searchTerm: string = '';
 private apiUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app/api/produits';

  // متغيرات الرسائل
  showMessagesModal: boolean = false;
  messages: any[] = [];
  unreadCount: number = 0;

  // متغيرات النماذج
  newSize: string = '';
  newColor: string = '';
  editSize: string = '';
  editColor: string = '';
  showModal: boolean = false;
  
  newProduct: any = { 
    nom: '', 
    description: '', 
    prix: 0, 
    quantiteStock: 0, 
    categorie: '', 
    tailleDisponible: [], 
    couleurDisponible: [] 
  };
  
  previewImages: any[] = []; // لمعاينة الصور قبل الرفع
  selectedFiles: File[] = []; // لتخزين الملفات الحقيقية
  
  showUpdateModal = false;
  editProduct: any = {};
  updatePreviewImages: any[] = []; // لمعاينة صور التعديل
  updateSelectedFiles: File[] = []; // لتخزين ملفات التعديل الجديدة
  
  showDeleteModal = false;
  productToDelete: any = null;
  deleteMessage: string | null = null;
  deleteMessageType: 'success' | 'error' | null = null;

  constructor(
    private router: Router, 
    private http: HttpClient,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.updateUnreadCount();
  }

  // --- منطق الرسائل ---
  updateUnreadCount() {
    this.contactService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
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

  // --- منطق المنتجات ---
  loadProducts() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.produits = data;
        this.filteredProduits = data;
      },
      error: (err) => console.error("Error loading products:", err)
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProduits = [...this.produits];
    } else {
      this.filteredProduits = this.produits.filter(p => 
        (p.nom?.toLowerCase().includes(term)) || 
        (p.categorie?.toLowerCase().includes(term))
      );
    }
  }

  // التحكم في المقاسات والألوان
  addSize() { if (this.newSize.trim()) { this.newProduct.tailleDisponible.push(this.newSize.trim().toUpperCase()); this.newSize = ''; } }
  removeSize(index: number) { this.newProduct.tailleDisponible.splice(index, 1); }
  addColor() { if (this.newColor.trim()) { this.newProduct.couleurDisponible.push(this.newColor.trim()); this.newColor = ''; } }
  removeColor(index: number) { this.newProduct.couleurDisponible.splice(index, 1); }
  
  addEditSize() { if (this.editSize.trim()) { if (!this.editProduct.tailleDisponible) this.editProduct.tailleDisponible = []; this.editProduct.tailleDisponible.push(this.editSize.trim().toUpperCase()); this.editSize = ''; } }
  removeEditSize(index: number) { this.editProduct.tailleDisponible.splice(index, 1); }
  addEditColor() { if (this.editColor.trim()) { if (!this.editProduct.couleurDisponible) this.editProduct.couleurDisponible = []; this.editProduct.couleurDisponible.push(this.editColor.trim()); this.editColor = ''; } }
  removeEditColor(index: number) { this.editProduct.couleurDisponible.splice(index, 1); }

  // فتح وإغلاق Modal الإضافة
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.resetForm(); }
  resetForm() { 
    this.newProduct = { nom: '', description: '', prix: 0, quantiteStock: 0, categorie: '', tailleDisponible: [], couleurDisponible: [] }; 
    this.previewImages = []; 
    this.selectedFiles = []; 
  }

 onImagesSelected(event: any) {
  const files = event.target.files; // هذه تحتوي على كل الصور اللي اخترتهم
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 1. نزيدو الملف الحقيقي للمصفوفة اللي تروح للـ Backend
      this.selectedFiles.push(file); 

      // 2. نقرأو الصورة باش نظهروها في المعاينة (Preview)
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages.push(e.target.result); // نزيدو الصورة للمعاينة
      };
      reader.readAsDataURL(file);
    }
  }
}
  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  addProduct(form: NgForm) {
    if (!form.valid) return;
    const formData = new FormData();
    formData.append("produit", new Blob([JSON.stringify(this.newProduct)], { type: "application/json" }));
    this.selectedFiles.forEach(file => formData.append("image", file));

    this.http.post(this.apiUrl, formData).subscribe({
      next: () => { 
        this.loadProducts(); 
        this.closeModal(); 
      },
      error: (err) => console.error("Error adding product:", err)
    });
  }

  // منطق التحديث (Update)
openUpdateModal(product: any) { 
  // 1. أخذ نسخة من المنتج للتعديل
  this.editProduct = { ...product }; 
  
  // 2. تحضير معاينة الصور باستعمال رابط Railway أونلاين
  if (product.imageUrls && product.imageUrls.length > 0) {
    this.updatePreviewImages = product.imageUrls.map((url: string) => 
      'https://ecommerce-backend-production-3ebb.up.railway.app' + url
    );
  } else {
    this.updatePreviewImages = [];
  }
  
  // 3. تصفير مصفوفة الملفات المختارة الجديدة
  this.updateSelectedFiles = []; 
  
  // 4. فتح النافذة
  this.showUpdateModal = true; 
}

  onUpdateImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.updateSelectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.updatePreviewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeUpdateImage(index: number) {
    this.updatePreviewImages.splice(index, 1);
    // إذا كانت الصورة الممسوحة هي ملف جديد تم اختياره الآن
    if (this.updateSelectedFiles.length > 0) {
       this.updateSelectedFiles.splice(index, 1);
    }
  }

  updateProduct(form: NgForm) {
    const formData = new FormData();
    formData.append("produit", new Blob([JSON.stringify(this.editProduct)], { type: "application/json" }));
    // إرسال الملفات الجديدة فقط
    this.updateSelectedFiles.forEach(file => formData.append("image", file));

    this.http.put(`${this.apiUrl}/${this.editProduct.id}`, formData).subscribe({
      next: () => { 
        this.loadProducts(); 
        this.closeUpdateModal(); 
      },
      error: (err) => console.error("Update error:", err)
    });
  }

  closeUpdateModal() { this.showUpdateModal = false; this.updatePreviewImages = []; this.updateSelectedFiles = []; }

  // منطق الحذف
  openDeleteModal(product: any) { this.productToDelete = product; this.showDeleteModal = true; }
  closeDeleteModal() { this.showDeleteModal = false; }
  confirmDelete() {
    this.http.delete(`${this.apiUrl}/${this.productToDelete.id}`).subscribe({
      next: () => { this.loadProducts(); this.closeDeleteModal(); },
      error: () => { this.deleteMessage = "Error deleting!"; this.deleteMessageType = 'error'; }
    });
  }

  toggleSidebar() { if (this.sidebarComp) this.sidebarComp.toggle(); }
}