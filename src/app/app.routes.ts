// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public routes
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    canActivate: [guestGuard],
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    canActivate: [guestGuard],
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  // ✅ NOUVELLES ROUTES AJOUTÉES - Vérification d'email
  
  
  // CORRECTION: Retirer guestGuard et ajouter authGuard pour order-success
  { 
    path: 'order-success', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/order-success/order-success.component').then(m => m.OrderSuccessComponent)
  },
  { 
    path: 'products', 
    loadComponent: () => import('./components/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  { 
    path: 'products/:slug', 
    loadComponent: () => import('./components/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  { 
    path: 'categories/:slug', 
    loadComponent: () => import('./components/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },

  // Protected routes (Authentification requise)
  { 
    path: 'cart', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  { 
    path: 'checkout', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  { 
    path: 'orders', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/orders/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  { 
    path: 'orders/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
  },
  { 
    path: 'profile', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  },
  { 
    path: 'wishlist', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },

  // Admin routes
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin/users', 
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'admin/categories', 
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
  },
  { 
    path: 'admin/products', 
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/products/admin-products/admin-products.component').then(m => m.AdminProductsComponent)
  },
  { 
    path: 'admin/orders', 
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/orders/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
  },

  // 404
  { 
    path: '**', 
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];