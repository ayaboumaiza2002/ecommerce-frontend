import { Routes } from '@angular/router';
import { AdminLoginComponent } from './admin/component/admin-login/admin-login.component';
import { DashbordComponent } from './admin/component/dashbord/dashbord.component';

import {OrdersComponent} from './admin/component/orders/orders.component';
import{ProductsComponent} from './admin/component/products/products.component';
import { HomeComponent } from './client/component/home/home.component';
import{ShopComponent} from './client/component/shop/shop.component';
import{AboutComponent} from './client/component/about/about.component';
import { ContactComponent } from './client/component/contact/contact.component';
import{ProductDetailsComponent} from './client/component/product-details/product-details.component';
import{CartComponent} from'./client/component/cart/cart.component'
import{CheckoutComponent} from'./client/component/checkout/checkout.component'
export const routes: Routes = [
  // Admin routes
  { path: 'login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: DashbordComponent  },
   {path : 'admin/orders' , component:OrdersComponent},
   {path : 'admin/products' , component: ProductsComponent},

  { path: '', redirectTo: 'client', pathMatch: 'full' },

// client routes
 { path: 'client', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
 { path: 'about', component: AboutComponent },
 {path : 'contact', component:ContactComponent},
 { path: 'product/:id', component: ProductDetailsComponent },
 { path: 'cart', component: CartComponent },
 { path: 'checkout', component: CheckoutComponent }
];
