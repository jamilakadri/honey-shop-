import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { environment } from '../../../../environments/environment'; // ✅ ADDED

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  
  // ✅ ADDED: Backend URL from environment
  private readonly backendUrl = environment.apiUrl.replace('/api', '');
  
  showModal = false;
  isEditMode = false;
  
  categoryForm: Partial<Category> = this.getEmptyCategory();
  
  selectedFile?: File;
  imagePreviewUrl?: string;
  currentImageUrl?: string;
  
  loading = true;
  searchQuery = '';
  successMessage = '';
  errorMessage = '';
  uploadLoading = false;

  constructor(private categoryService: CategoryService) {
    console.log('🌐 Backend URL configured:', this.backendUrl);
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.filteredCategories = this.categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Erreur lors du chargement des catégories';
        this.loading = false;
      }
    });
  }

  filterCategories(): void {
    this.filteredCategories = this.categories.filter(category => {
      const searchLower = this.searchQuery.toLowerCase();
      return category.name.toLowerCase().includes(searchLower) ||
             (category.description || '').toLowerCase().includes(searchLower);
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.categoryForm = this.getEmptyCategory();
    this.selectedFile = undefined;
    this.imagePreviewUrl = undefined;
    this.currentImageUrl = undefined;
    this.showModal = true;
    this.clearMessages();
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.categoryForm = { ...category };
    this.currentImageUrl = category.imageUrl;
    this.selectedFile = undefined;
    this.imagePreviewUrl = undefined;
    this.showModal = true;
    this.clearMessages();
  }

  closeModal(): void {
    this.showModal = false;
    this.categoryForm = this.getEmptyCategory();
    this.selectedFile = undefined;
    this.currentImageUrl = undefined;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = undefined;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Format non autorisé. Utilisez JPG, PNG, GIF ou WebP';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier est trop volumineux. Taille maximale: 5MB';
        return;
      }

      this.selectedFile = file;
      
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl);
      }
      this.imagePreviewUrl = URL.createObjectURL(file);
      
      this.clearMessages();
    }
  }

  removeImage(): void {
    this.selectedFile = undefined;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = undefined;
    }
    
    const fileInput = document.getElementById('categoryImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getImagePreview(): string {
    if (this.imagePreviewUrl) {
      return this.imagePreviewUrl;
    }
    if (this.currentImageUrl) {
      return this.getImageUrl(this.currentImageUrl);
    }
    return '';
  }

  // ✅ FIXED: Use environment variable for backend URL
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise, prepend the backend URL
    return `${this.backendUrl}${imageUrl}`;
  }

  async onSubmit(): Promise<void> {
    this.clearMessages();

    if (!this.categoryForm.name?.trim()) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire';
      return;
    }

    if (!this.categoryForm.slug && this.categoryForm.name) {
      this.categoryForm.slug = this.createSlug(this.categoryForm.name);
    }

    if (this.selectedFile) {
      this.uploadLoading = true;
      
      try {
        const uploadResult = await this.uploadImage();
        this.categoryForm.imageUrl = uploadResult.imageUrl;
      } catch (error) {
        this.errorMessage = 'Erreur lors de l\'upload de l\'image';
        this.uploadLoading = false;
        return;
      }
      
      this.uploadLoading = false;
    }

    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  private uploadImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No file selected');
        return;
      }

      this.categoryService.uploadCategoryImage(this.selectedFile).subscribe({
        next: (response) => resolve(response),
        error: (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        }
      });
    });
  }

  createCategory(): void {
    this.categoryService.createCategory(this.categoryForm).subscribe({
      next: (response) => {
        this.successMessage = 'Catégorie créée avec succès !';
        this.loadCategories();
        this.closeModal();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la catégorie';
      }
    });
  }

  updateCategory(): void {
    if (!this.categoryForm.categoryId) return;

    this.categoryService.updateCategory(this.categoryForm.categoryId, this.categoryForm).subscribe({
      next: (response) => {
        this.successMessage = 'Catégorie modifiée avec succès !';
        this.loadCategories();
        this.closeModal();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la modification de la catégorie';
      }
    });
  }

  deleteCategory(categoryId: number, categoryName: string): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${categoryName}" ?`)) {
      return;
    }

    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.successMessage = 'Catégorie supprimée avec succès !';
        this.loadCategories();
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression de la catégorie';
      }
    });
  }

  getEmptyCategory(): Partial<Category> {
    return {
      categoryId: 0,
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      displayOrder: 0,
      isActive: true
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

  getCategoryImageUrl(category: Category): string {
    if (category.imageUrl) {
      return this.getImageUrl(category.imageUrl);
    }
    return 'assets/images/category-placeholder.jpg';
  }
}