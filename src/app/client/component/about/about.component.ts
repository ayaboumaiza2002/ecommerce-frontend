import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../service/cart.service';

@Component({
  selector: 'app-about',
   imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  constructor(private cartService: CartService) { }

  cartCount: number = 0;

  
ngOnInit(): void {
 
     this.cartService.getCartObservable().subscribe(items => {
    this.cartCount = items.length;
  });
}

}
