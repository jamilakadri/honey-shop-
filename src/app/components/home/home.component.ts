// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  private readonly apiUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService
  ) {
    console.log('🏠 HomeComponent Constructor');
  }

  ngOnInit(): void {
    console.log('🏠 HomeComponent ngOnInit');
    console.log('📦 localStorage token:', localStorage.getItem('token'));
    console.log('📦 localStorage user:', localStorage.getItem('currentUser'));
    console.log('👤 currentUserValue:', this.authService.currentUserValue);
    console.log('🔍 isLoggedIn:', this.authService.isLoggedIn);
    console.log('👑 isAdmin:', this.authService.isAdmin);
    
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Charger les produits en vedette
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        console.log('Featured products loaded:', products);
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });

    // Charger les catégories
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categories loaded:', categories);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  // ✅ Get category image URL with production support
  getCategoryImage(category: Category): string {
    console.log('🗂️ Getting image for category:', category.name);
    console.log('📸 Category imageUrl:', category.imageUrl);
    
    if (category.imageUrl) {
      const imageUrl = category.imageUrl;
      
      // ✅ If it's a relative path starting with /uploads/
      if (imageUrl.startsWith('/uploads/')) {
        const fullUrl = `${this.apiUrl}${imageUrl}`;
        console.log('✅ Constructed category full URL:', fullUrl);
        return fullUrl;
      }
      
      // ✅ If it's already a full URL (starts with http)
      if (imageUrl.startsWith('http')) {
        console.log('✅ Already full category URL:', imageUrl);
        return imageUrl;
      }
      
      // ✅ Otherwise, assume it's just the filename
      const fullUrl = `${this.apiUrl}/uploads/categories/${imageUrl}`;
      console.log('✅ Constructed category URL from filename:', fullUrl);
      return fullUrl;
    }
    
    console.log('❌ No category image found, using placeholder');
    return 'assets/images/category-placeholder.jpg';
  }

  // ✅ Add to cart method
  addToCart(product: Product): void {
    console.log('🛒 Add to cart clicked for product:', product);
    console.log('👤 Is user logged in?', this.authService.isLoggedIn);
    console.log('🔍 Current user:', this.authService.currentUserValue);
    console.log('🔑 Token exists:', !!this.authService.getToken());
    
    if (!this.authService.isLoggedIn) {
      alert('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    this.cartService.addToCart({
      productId: product.productId,
      quantity: 1
    }).subscribe({
      next: (response) => {
        console.log('✅ Add to cart SUCCESS - Response:', response);
        alert('Produit ajouté au panier !');
      },
      error: (error) => {
        console.error('❌ Add to cart ERROR:', error);
        console.error('Error details:', error.status, error.message, error.error);
        alert(`Erreur lors de l'ajout au panier: ${error.message || 'Erreur inconnue'}`);
      }
    });
  }

  // Calculate discount percentage
  calculateDiscount(currentPrice: number, comparePrice: number): number {
    if (!comparePrice || comparePrice <= currentPrice) return 0;
    return Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
  }

  // ✅ Get product image URL with production support
  getProductImage(product: Product): string {
    console.log('🖼️ Getting image for product:', product.name);
    console.log('📸 Product images array:', product.productImages);
    
    if (product.productImages && product.productImages.length > 0) {
      const imageUrl = product.productImages[0].imageUrl;
      console.log('🔗 Raw image URL from database:', imageUrl);
      
      // ✅ If it's a relative path starting with /uploads/
      if (imageUrl.startsWith('/uploads/')) {
        const fullUrl = `${this.apiUrl}${imageUrl}`;
        console.log('✅ Constructed full URL:', fullUrl);
        return fullUrl;
      }
      
      // ✅ If it's already a full URL (starts with http)
      if (imageUrl.startsWith('http')) {
        console.log('✅ Already full URL:', imageUrl);
        return imageUrl;
      }
      
      // ✅ Otherwise, assume it's just the filename
      const fullUrl = `${this.apiUrl}/uploads/products/${imageUrl}`;
      console.log('✅ Constructed URL from filename:', fullUrl);
      return fullUrl;
    }
    
    console.log('❌ No images found, using placeholder');
    return 'assets/images/placeholder.jpg';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  }
  
  getCurrentUser() {
    const user = this.authService.currentUserValue;
    console.log('getCurrentUser called:', user);
    return user;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}