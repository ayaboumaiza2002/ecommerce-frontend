import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProduiteService {
    // الرابط الأساسي
    // استبدلي السطر 10 في ملفك بهذا الكود
private apiUrl = 'https://ecommerce-backend-production-f47b.up.railway.app/api/produits';

    constructor(private http: HttpClient) { }

    getTotalProducts(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/total`);
    }

    // جلب جميع المنتجات
    getAllProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getNewArrivals(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/new-arrivals`);
    }

    getProduitById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateStock(id: number, quantityToSubtract: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/update-stock`, { quantity: quantityToSubtract });
    }

    // التعديل هنا: قمت بحذف التكرار في الرابط ليصبح صحيحاً
    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/categories`);
    }
// في ملف ProduiteService
getCategoriesWithImages(): Observable<Map<string, string>> {
    return this.http.get<Map<string, string>>(`${this.apiUrl}/categories-with-images`);
}
}