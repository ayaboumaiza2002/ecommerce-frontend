import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'   // 🔥 هذي كانت ناقصة
})
export class AdminLoginService {
// استبدلي السطر 13 في ملفك بهذا الكود
private apiURL = 'https://ecommerce-backend-production-f47b.up.railway.app/api/admin/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    const body = { username, password };
    return this.http.post(this.apiURL, body, { responseType: 'text' });
  }
}
