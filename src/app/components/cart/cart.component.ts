import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error = '';
  promoCode: string = '';
  discount: number = 0;
  shippingCost: number = 15.00;

  constructor(
    private cartService: CartService,
    private router: Router // Add Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = '';

    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        console.log('Cart loaded:', cart);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.error = 'Erreur lors du chargement du panier';
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
      return;
    }

    // Vérifier le stock disponible
    if (newQuantity > item.product.stockQuantity) {
      alert(`Stock insuffisant. Seulement ${item.product.stockQuantity} disponible(s)`);
      return;
    }

    this.cartService.updateCartItem(item.cartItemId, newQuantity).subscribe({
      next: () => {
        this.loadCart(); // Recharger le panier
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        alert('Erreur lors de la mise à jour de la quantité');
      }
    });
  }

  removeItem(cartItemId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet article ?')) {
      return;
    }

    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        this.loadCart(); // Recharger le panier
      },
      error: (error) => {
        console.error('Error removing item:', error);
        alert('Erreur lors de la suppression');
      }
    });
  }

  clearCart(): void {
    if (!confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      return;
    }

    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        alert('Erreur lors du vidage du panier');
      }
    });
  }

  getSubtotal(): number {
    if (!this.cart || !this.cart.cartItems) return 0;
    return this.cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discountAmount = (subtotal * this.discount) / 100;
    return subtotal - discountAmount + this.shippingCost;
  }

  applyPromoCode(): void {
    const code = this.promoCode.toUpperCase().trim();
    
    if (code === 'SAVE10') {
      this.discount = 10;
      alert('Code promo appliqué : -10%');
    } else if (code === 'SAVE20') {
      this.discount = 20;
      alert('Code promo appliqué : -20%');
    } else if (code === 'WELCOME10') {
      this.discount = 10;
      alert('Code promo appliqué : -10% (Bienvenue)');
    } else {
      this.discount = 0;
      alert('Code promo invalide');
    }
  }

  checkout(): void {
    // Validate cart is not empty
    if (!this.cart || this.cart.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Check stock availability before proceeding
    const outOfStockItems = this.cart.cartItems.filter(
      item => item.quantity > item.product.stockQuantity
    );

    if (outOfStockItems.length > 0) {
      alert('Certains articles dans votre panier ne sont plus disponibles en quantité suffisante. Veuillez mettre à jour votre panier.');
      return;
    }

    // Navigate to checkout page
    console.log('Navigating to checkout...');
    this.router.navigate(['/checkout']);
  }

  getProductImage(item: CartItem): string {
    if (item.product.productImages && item.product.productImages.length > 0) {
      const imageUrl = item.product.productImages[0].imageUrl;
      
      if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:5198${imageUrl}`;
      }
      
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      return `http://localhost:5198/uploads/products/${imageUrl}`;
    }
    
    return 'assets/images/placeholder.jpg';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  }
}