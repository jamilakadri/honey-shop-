// product-detail.component.ts - VERSION AVEC ACHETER MAINTENANT + FULL FR

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product, ProductImage } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  productImages: ProductImage[] = [];
  loading = false;
  errorMessage = '';
  selectedImageIndex = 0;
  quantity = 1;
  addedToCart = false;
  addingToCart = false;

  private readonly defaultImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIi...'; // je laisse réduit

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const slug = params['slug'];

      if (id) {
        this.loadProductById(+id);
      } else if (slug) {
        this.loadProductBySlug(slug);
      }
    });
  }

  // ---------------------------------------------
  // 🔵 Chargement du produit
  // ---------------------------------------------
  loadProductById(id: number) {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        if (product.productId) this.loadProductImages(product.productId);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Échec du chargement du produit.';
        this.loading = false;
      }
    });
  }

  loadProductBySlug(slug: string) {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product = product;
        if (product.productId) this.loadProductImages(product.productId);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Échec du chargement du produit.';
        this.loading = false;
      }
    });
  }

  loadProductImages(productId: number) {
    this.productService.getProductImages(productId).subscribe({
      next: (images) => {
        this.productImages = images.sort((a, b) => a.displayOrder - b.displayOrder);
      },
      error: () => {
        this.productImages = [];
      }
    });
  }

  // ---------------------------------------------
  // 🔵 Gestion images
  // ---------------------------------------------
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return this.defaultImage;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `http://localhost:5198${imageUrl}`;
    return `http://localhost:5198/uploads/products/${imageUrl}`;
  }

  get mainImageUrl(): string {
    const img = this.productImages[this.selectedImageIndex];
    return img?.imageUrl ? this.getImageUrl(img.imageUrl) : this.defaultImage;
  }

  get hasMultipleImages(): boolean {
    return this.productImages.length > 1;
  }

  selectImage(index: number) {
    if (index >= 0 && index < this.productImages.length) {
      this.selectedImageIndex = index;
    }
  }

  nextImage() {
    if (this.productImages.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.productImages.length;
    }
  }

  prevImage() {
    if (this.productImages.length > 1) {
      this.selectedImageIndex =
        (this.selectedImageIndex - 1 + this.productImages.length) %
        this.productImages.length;
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
  }

  // ---------------------------------------------
  // 🔵 Infos stock et prix
  // ---------------------------------------------
  get isInStock(): boolean {
    return (this.product?.stockQuantity || 0) > 0;
  }

  get discountPercentage(): number {
    if (this.product?.compareAtPrice && this.product.price < this.product.compareAtPrice) {
      return Math.round(
        ((this.product.compareAtPrice - this.product.price) / this.product.compareAtPrice) * 100
      );
    }
    return 0;
  }

  // ---------------------------------------------
  // 🔵 Quantité
  // ---------------------------------------------
  incrementQuantity() {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // ---------------------------------------------
  // 🔵 Ajouter au panier
  // ---------------------------------------------
  addToCart() {
    if (!this.product || !this.isInStock || this.addingToCart) return;

    this.addingToCart = true;

    const request = {
      productId: this.product.productId,
      quantity: this.quantity
    };

    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.addedToCart = true;
        setTimeout(() => this.router.navigate(['/cart']), 800);
      },
      error: (error) => {
        this.addingToCart = false;

        if (error.status === 401) {
          alert('Veuillez vous connecter pour ajouter un produit au panier.');
          this.router.navigate(['/login']);
        } else {
          alert('Impossible d\'ajouter au panier.');
        }
      }
    });
  }

  // ---------------------------------------------
  // 🔵 ACHETER MAINTENANT
  // ---------------------------------------------
  buyNow() {
    if (!this.product || !this.isInStock) return;

    const request = {
      productId: this.product.productId,
      quantity: this.quantity
    };

    this.cartService.addToCart(request).subscribe({
      next: () => {
        // ⚡ Ajouté → direction paiement
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        if (error.status === 401) {
          alert('Vous devez vous connecter pour commander.');
          this.router.navigate(['/login']);
        } else {
          alert('Erreur lors de l\'achat.');
        }
      }
    });
  }

  // ---------------------------------------------
  // 🔵 Retour
  // ---------------------------------------------
  goBack() {
    this.router.navigate(['/products']);
  }
  // Miniature optimisée
  getThumbnailUrl(imageUrl: string): string {
    return this.getImageUrl(imageUrl); // même logique que l’image principale
  }

}
