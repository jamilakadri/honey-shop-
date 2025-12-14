import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Products & Categories
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Loading & Error States
  loading = true;
  error = '';
  
  // Search & Filter
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'featured';
  priceRange: { min: number; max: number } = { min: 0, max: 1000 };
  priceSlider: number = 1000;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Mobile Filters
  showMobileFilters: boolean = false;
  
  // Category counts
  categoryCounts: Map<string, number> = new Map();
  
  // Subscriptions
  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.productService.getActiveProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = [...products];
          this.calculateCategoryCounts();
          this.updatePagination();
          this.loading = false;
          console.log('Products loaded:', products.length);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.error = 'Erreur lors du chargement des produits';
          this.loading = false;
        }
      })
    );
  }

  calculateCategoryCounts(): void {
    this.categoryCounts.clear();
    this.categoryCounts.set('all', this.products.length);
    
    for (const product of this.products) {
      if (product.category?.slug) {
        const currentCount = this.categoryCounts.get(product.category.slug) || 0;
        this.categoryCounts.set(product.category.slug, currentCount + 1);
      }
    }
  }

  getCategoryCount(slug: string): number {
    return this.categoryCounts.get(slug) || 0;
  }

  // Helper methods with safe handling
  calculateDiscount(product: Product): number {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round((1 - product.price / product.compareAtPrice) * 100);
    }
    return 0;
  }

  getAverageRating(product: Product): number {
    // Check if product has reviews property (optional property)
    const reviews = (product as any).reviews;
    if (reviews && Array.isArray(reviews) && reviews.length > 0) {
      const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
      return Math.round(sum / reviews.length);
    }
    return 0;
  }

  getReviewCount(product: Product): number {
    // Check if product has reviews property (optional property)
    const reviews = (product as any).reviews;
    return reviews?.length || 0;
  }

  loadCategories(): void {
    this.subscriptions.add(
      this.categoryService.getActiveCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          console.log('Categories loaded:', categories.length);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      })
    );
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.shortDescription?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.slug === this.selectedCategory ||
        product.category?.name.toLowerCase() === this.selectedCategory
      );
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price <= this.priceSlider
    );

    // Sorting
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn) {
      alert('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    this.cartService.addToCart({
      productId: product.productId,
      quantity: 1
    }).subscribe({
      next: () => {
        this.showNotification('Produit ajoutÃ© au panier !');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Erreur lors de l\'ajout au panier');
      }
    });
  }

  showNotification(message: string): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  getProductImage(product: Product): string {
    if (product.productImages && product.productImages.length > 0) {
      const imageUrl = product.productImages[0].imageUrl;
      
      if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:5198${imageUrl}`;
      }
      
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      return `http://localhost:5198/uploads/products/${imageUrl}`;
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNMTUwIDEwMEMxNjYuNTQzIDEwMCAxODAgODYuNTQyNiAxODAgNzBDMTgwIDUzLjQ1NzQgMTY2LjU0MyA0MCAxNTAgNDBDMTMzLjQ1NyA0MCAxMjAgNTMuNDU3NCAxMjAgNzBDMTIwIDg2LjU0MjYgMTMzLjQ1NyAxMDAgMTUwIDEwMFoiIGZpbGw9IiNCM0IzQjMiLz48cGF0aCBkPSJNNzAgMTYwSDE1MEwyMzAgMTYwQzI0Ni41NDMgMTYwIDI2MCAxNDYuNTQzIDI2MCAxMzBWMTAwQzI2MCA4My40NTc0IDI0Ni41NDMgNzAgMjMwIDcwSDE1MEMxMzMuNDU3IDcwIDEyMCA4My40NTc0IDEyMCAxMDBWMTMwQzEyMCAxNDYuNTQzIDEzMy40NTcgMTYwIDE1MCAxNjBaIiBmaWxsPSIjQjNCM0IzIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzc3IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.sortBy = 'featured';
    this.priceSlider = 1000;
    this.filterProducts();
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  }
  getCurrentUser() {
    const user = this.authService.currentUserValue;
    console.log('getCurrentUser called:', user);
    return user;
  }
  logout(): void {
    if (confirm('ÃŠtes-vous sÃ»r de vouloir vous dÃ©connecter ?')) {
      this.authService.logout();
    }
  }
  // product-list.component.ts
  mobileDropdownOpen = false;

  toggleMobileDropdown() {
    this.mobileDropdownOpen = !this.mobileDropdownOpen;
  }

}