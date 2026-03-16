import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // استبدلي السطر 9 في ملفك بهذا الكود
private apiUrl = 'https://ecommerce-backend-production-3ebb.up.railway.app/api/contact';// تأكدي من نفس بورت الباك أند

  constructor(private http: HttpClient) {}

  // لإرسال رسالة من الزبون
  sendMessage(message: any): Observable<any> {
    return this.http.post(this.apiUrl, message);
  }

  // لجلب كل الرسائل للأدمن
  getAllMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // لجلب عدد الرسائل غير المقروءة
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  // الدالة التي كانت تنقصكِ: لتحديث حالة الرسالة كمقروءة
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }
}