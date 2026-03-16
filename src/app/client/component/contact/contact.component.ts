import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ضروري جداً لعمل Form
import { CartService } from '../../../service/cart.service';
import { ContactService } from '../../../service/Contact.service'; // تأكدي من إنشاء الخدمة

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // أضفنا FormsModule هنا
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  cartCount: number = 0;

  constructor(
    private cartService: CartService,
    private contactService: ContactService // حقن خدمة الرسائل
  ) { }

  ngOnInit(): void {
    this.cartService.getCartObservable().subscribe(items => {
      this.cartCount = items.length;
    });
  }

  // دالة إرسال الرسالة
  onSubmit(contactForm: any) {
    if (contactForm.valid) {
      this.contactService.sendMessage(contactForm.value).subscribe({
        next: (response) => {
          alert("Message sent successfully!");
          contactForm.reset(); // تفريغ الحقول بعد الإرسال
        },
        error: (err) => {
          console.error("Error sending message:", err);
          alert("Failed to send message. Please try again.");
        }
      });
    }
  }
}