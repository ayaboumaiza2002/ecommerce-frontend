import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CommandeService {
  private comUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app/api/commandes/total';
private apiURL = 'https://ecommerce-backend-production-3ebb.up.railway.app/api/commandes';
    constructor (private http : HttpClient){}

    getTotalCommandes(): Observable<number>{
        return this.http.get<number>(this.comUrl);
    }

    getAllCommandes(): Observable<any[]>{
        return this.http.get<any[]>(`${this.apiURL}`);
    }

    // تأكدي من استدعاء هذا الاسم بالضبط في ملف الـ TS
    updateEtatCommande(id: number, nouvelEtat: string): Observable<any> {
        return this.http.post(`${this.apiURL}/${id}/etat`, nouvelEtat, {
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    // دالة الحذف المطلوبة
    deleteCommande(id: number): Observable<any> {
        return this.http.delete(`${this.apiURL}/${id}`);
    }
    // أضفها داخل CommandeService class
getTopLoyalClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/loyal`);
}
}