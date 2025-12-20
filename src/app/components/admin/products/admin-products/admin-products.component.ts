// admin-products.component.ts - FIXED FOR PRODUCTION
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { Product, ProductImage, CreateProductDto } from '../../../../models/product.model';
import { environment } from '../../../../../environments/environment'; // ✅ ADDED

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // ✅ ADDED: Backend URL from environment
  private readonly backendUrl = environment.apiUrl.replace('/api', '');
  
  // Modal states
  showModal = false;
  showImageModal = false;
  isEditMode = false;
  
  // Form data
  productForm: Partial<Product> = this.getEmptyProduct();
  
  // Image management
  currentProductId?: number;
  currentProductName?: string;
  productImages: ProductImage[] = [];
  imageForm: Partial<ProductImage> = {
    imageUrl: '',
    altText: '',
    displayOrder: 0,
    isPrimary: false
  };
  selectedFile?: File;
  imagePreviewUrl?: string;
  
  // UI state
  loading = true;
  searchQuery = '';
  selectedCategory = '';
  successMessage = '';
  errorMessage = '';
  uploadLoading = false;
  activeTab: 'info' | 'images' = 'info';

  categories = [
    'Miel Naturel',
    'Miel Bio',
    'Propolis',
    'Gelée Royale',
    'Pollen',
    'Cire d\'Abeille'
  ];

  constructor(private productService: ProductService) {
    console.log('🌐 Backend URL configured:', this.backendUrl);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loadImagesForAllProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });
  }

  loadImagesForAllProducts(): void {
    this.products.forEach(product => {
      this.productService.getProductImages(product.productId).subscribe({
        next: (images) => {
          product.productImages = images;
          const index = this.filteredProducts.findIndex(p => p.productId === product.productId);
          if (index !== -1) {
            this.filteredProducts[index].productImages = images;
          }
        },
        error: (error) => {
          console.error(`Error loading images for product ${product.productId}:`, error);
          product.productImages = [];
        }
      });
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category?.name === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openImageModal(product: Product): void {
    this.currentProductId = product.productId;
    this.currentProductName = product.name;
    this.showImageModal = true;
    this.loadProductImages(product.productId);
    this.clearMessages();
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.currentProductId = undefined;
    this.currentProductName = undefined;
    this.productImages = [];
    this.resetImageForm();
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = undefined;
    }
  }

  loadProductImages(productId: number): void {
    this.productService.getProductImages(productId).subscribe({
      next: (images) => {
        this.productImages = images.sort((a, b) => a.displayOrder - b.displayOrder);
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.errorMessage = 'Erreur lors du chargement des images';
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl);
      }
      this.imagePreviewUrl = URL.createObjectURL(file);
      
      if (!this.imageForm.altText) {
        this.imageForm.altText = file.name.replace(/\.[^/.]+$/, "");
      }
    }
  }

  uploadImage(): void {
    if (!this.currentProductId) {
      this.errorMessage = 'Aucun produit sélectionné';
      return;
    }

    if (!this.selectedFile && !this.imageForm.imageUrl?.trim()) {
      this.errorMessage = 'Veuillez sélectionner une image ou entrer une URL';
      return;
    }

    this.uploadLoading = true;

    if (this.selectedFile) {
      this.productService.uploadProductImage(
        this.currentProductId,
        this.selectedFile,
        this.imageForm
      ).subscribe({
        next: (response: any) => {
          this.successMessage = 'Image uploadée avec succès !';
          this.loadProductImages(this.currentProductId!);
          this.refreshProductImages(this.currentProductId!);
          this.resetImageForm();
          this.uploadLoading = false;
          this.autoHideMessage();
          
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
          const fileInput2 = document.getElementById('fileInput2') as HTMLInputElement;
          if (fileInput2) fileInput2.value = '';
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de l\'upload de l\'image';
          this.uploadLoading = false;
        }
      });
    } 
    else if (this.imageForm.imageUrl?.trim()) {
      const newImage: ProductImage = {
        imageId: 0,
        productId: this.currentProductId,
        imageUrl: this.imageForm.imageUrl!,
        altText: this.imageForm.altText || '',
        displayOrder: this.imageForm.displayOrder || 0,
        isPrimary: this.imageForm.isPrimary || false,
        createdAt: new Date().toISOString()
      };

      this.productService.addProductImage(this.currentProductId, newImage).subscribe({
        next: (image) => {
          this.successMessage = 'Image ajoutée avec succès !';
          this.loadProductImages(this.currentProductId!);
          this.refreshProductImages(this.currentProductId!);
          this.resetImageForm();
          this.uploadLoading = false;
          this.autoHideMessage();
        },
        error: (error) => {
          console.error('Error adding image:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de l\'ajout de l\'image';
          this.uploadLoading = false;
        }
      });
    }
  }

  refreshProductImages(productId: number): void {
    this.productService.getProductImages(productId).subscribe({
      next: (images) => {
        const productIndex = this.products.findIndex(p => p.productId === productId);
        if (productIndex !== -1) {
          this.products[productIndex].productImages = images;
        }
        
        const filteredIndex = this.filteredProducts.findIndex(p => p.productId === productId);
        if (filteredIndex !== -1) {
          this.filteredProducts[filteredIndex].productImages = images;
        }
      },
      error: (error) => {
        console.error(`Error refreshing images for product ${productId}:`, error);
      }
    });
  }

  setAsPrimary(image: ProductImage): void {
    if (image.isPrimary) return;
    
    const updatedImage = { ...image, isPrimary: true };
    
    this.productService.updateProductImage(image.productId, image.imageId, updatedImage).subscribe({
      next: () => {
        this.successMessage = 'Image principale mise à jour !';
        this.loadProductImages(this.currentProductId!);
        this.refreshProductImages(this.currentProductId!);
      },
      error: (error) => {
        console.error('Error updating image:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }

  deleteImage(image: ProductImage): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    this.productService.deleteProductImage(image.productId, image.imageId).subscribe({
      next: () => {
        this.successMessage = 'Image supprimée avec succès !';
        this.loadProductImages(this.currentProductId!);
        this.refreshProductImages(this.currentProductId!);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
      }
    });
  }

  resetImageForm(): void {
    this.imageForm = {
      imageUrl: '',
      altText: '',
      displayOrder: 0,
      isPrimary: false
    };
    this.selectedFile = undefined;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = undefined;
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.productForm = this.getEmptyProduct();
    this.showModal = true;
    this.activeTab = 'info';
    this.clearMessages();
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.productForm = { ...product };
    this.showModal = true;
    this.activeTab = 'info';
    this.clearMessages();
    
    if (product.productId) {
      this.currentProductId = product.productId;
      this.loadProductImages(product.productId);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.productForm = this.getEmptyProduct();
    this.activeTab = 'info';
    this.productImages = [];
    this.currentProductId = undefined;
  }

  onSubmit(): void {
    this.clearMessages();

    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct(): void {
    if (!this.productForm.name || !this.productForm.price) {
      this.errorMessage = 'Nom et prix sont obligatoires';
      return;
    }

    if (!this.productForm.slug && this.productForm.name) {
      this.productForm.slug = this.createSlug(this.productForm.name);
    }

    const productDto: CreateProductDto = {
      categoryId: this.productForm.categoryId,
      name: this.productForm.name!,
      slug: this.productForm.slug!,
      description: this.productForm.description || '',
      shortDescription: this.productForm.shortDescription || '',
      price: this.productForm.price!,
      compareAtPrice: this.productForm.compareAtPrice || 0,
      cost: this.productForm.cost || 0,
      stockQuantity: this.productForm.stockQuantity || 0,
      lowStockThreshold: this.productForm.lowStockThreshold || 10,
      sku: this.productForm.sku || '',
      weight: this.productForm.weight || 0,
      origin: this.productForm.origin || '',
      harvestDate: this.productForm.harvestDate || undefined,
      expiryDate: this.productForm.expiryDate || undefined,
      isActive: this.productForm.isActive !== false,
      isFeatured: this.productForm.isFeatured === true
    };

    this.productService.createProduct(productDto).subscribe({
      next: (response) => {
        this.successMessage = 'Produit créé avec succès !';
        this.loadProducts();
        this.closeModal();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.errorMessage = error.error?.message || error.error?.title || 'Erreur lors de la création du produit';
      }
    });
  }

  updateProduct(): void {
    if (!this.productForm.productId) return;

    this.productService.updateProduct(this.productForm.productId, this.productForm as Product).subscribe({
      next: (response) => {
        this.successMessage = 'Produit modifié avec succès !';
        this.loadProducts();
        this.closeModal();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.errorMessage = error.error?.message || error.error?.title || 'Erreur lors de la modification du produit';
      }
    });
  }

  deleteProduct(productId: number, productName: string): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.successMessage = 'Produit supprimé avec succès !';
        this.loadProducts();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression du produit';
      }
    });
  }

  getEmptyProduct(): Partial<Product> {
    return {
      productId: 0,
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: 0,
      compareAtPrice: 0,
      cost: 0,
      stockQuantity: 0,
      lowStockThreshold: 10,
      categoryId: undefined,
      sku: '',
      weight: 0,
      origin: '',
      harvestDate: undefined,
      expiryDate: undefined,
      isActive: true,
      isFeatured: false,
      viewCount: 0,
      saleCount: 0,
      createdAt: new Date().toISOString()
    };
  }

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  autoHideMessage(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) {
      return '0.00 TND';
    }
    return `${amount.toFixed(2)} TND`;
  }

  // ✅ FIXED: Use environment variable for backend URL
  getPrimaryImageUrl(product: Product): string {
    const primaryImage = product.productImages?.find(img => img.isPrimary);
    
    if (primaryImage?.imageUrl) {
      return this.getImageUrl(primaryImage.imageUrl);
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  getImagePreview(): string {
    if (this.imagePreviewUrl) {
      return this.imagePreviewUrl;
    }
    return this.imageForm.imageUrl || '';
  }

  // ✅ FIXED: Dynamic URL construction based on environment
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise, prepend the backend URL
    return `${this.backendUrl}${imageUrl}`;
  }
}