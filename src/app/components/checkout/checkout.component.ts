import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../models/cart.model';
import { CreateOrderRequest } from '../../models/order.model';
import { CreateAddressRequest } from '../../models/address.model';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  processing = false;
  currentStep = 1;

  // Forms
  shippingForm!: FormGroup;
  notesForm!: FormGroup;

  // Payment
  paymentMethod: 'card' | 'paypal' | 'cod' = 'cod';
  
  // Promo
  promoCode = '';
  promoApplied = false;
  discount = 0;
  
  // Costs
  shippingCost = 15.00;
  taxRate = 0.19; // 19% VAT
  
  // Options
  billingSameAsShipping = true;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadCart();
    this.prefillUserData();
  }

  initForms(): void {
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['Tunisia', [Validators.required]]
    });

    this.notesForm = this.fb.group({
      notes: ['']
    });
  }

  prefillUserData(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.shippingForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        console.log('Cart loaded in checkout:', cart);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
        alert('Failed to load cart');
        this.router.navigate(['/cart']);
      }
    });
  }

  // Payment Methods
  selectPaymentMethod(method: 'card' | 'paypal' | 'cod'): void {
    this.paymentMethod = method;
  }

  // Promo Code
  applyPromoCode(): void {
    const code = this.promoCode.toUpperCase().trim();
    
    if (!code) {
      alert('Please enter a promo code');
      return;
    }

    // Simulate promo code validation (replace with actual API call)
    const validCodes: { [key: string]: number } = {
      'SAVE10': 10,
      'SAVE20': 20,
      'HONEY15': 15,
      'WELCOME10': 10,
      'SUMMER25': 25
    };

    if (validCodes[code]) {
      this.discount = validCodes[code];
      this.promoApplied = true;
      alert(`✓ Promo code applied! You save ${this.discount}%`);
    } else {
      this.discount = 0;
      this.promoApplied = false;
      alert('Invalid promo code');
    }
  }

  removePromoCode(): void {
    this.promoCode = '';
    this.promoApplied = false;
    this.discount = 0;
  }

  // Billing Options
  toggleBillingSameAsShipping(): void {
    this.billingSameAsShipping = !this.billingSameAsShipping;
  }

  // Calculations
  getSubtotal(): number {
    if (!this.cart?.cartItems) return 0;
    return this.cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscountAmount(): number {
    return (this.getSubtotal() * this.discount) / 100;
  }

  getTax(): number {
    const subtotal = this.getSubtotal();
    const afterDiscount = subtotal - this.getDiscountAmount();
    return afterDiscount * this.taxRate;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discountAmount = this.getDiscountAmount();
    const tax = this.getTax();
    return subtotal - discountAmount + this.shippingCost + tax;
  }

  // Place Order - UPDATED with Address Creation
  placeOrder(): void {
    // Validate form
    if (this.shippingForm.invalid) {
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
      alert('Please fill in all required fields');
      return;
    }

    if (!this.cart || this.cart.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!this.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.processing = true;

    const formValue = this.shippingForm.value;
    const fullName = `${formValue.firstName} ${formValue.lastName}`;

    // Step 1: Create Shipping Address
    const shippingAddressRequest: CreateAddressRequest = {
      addressType: 'Shipping',
      fullName: fullName,
      addressLine1: formValue.address,
      addressLine2: undefined,
      city: formValue.city,
      state: undefined,
      postalCode: formValue.postalCode,
      country: formValue.country,
      phoneNumber: formValue.phone,
      isDefault: true
    };

    // Step 2: Create Billing Address (or use same as shipping)
    const billingAddressRequest: CreateAddressRequest = this.billingSameAsShipping 
      ? { ...shippingAddressRequest, addressType: 'Billing' }
      : { ...shippingAddressRequest, addressType: 'Billing' }; // In real app, you'd have separate billing form

    console.log('Creating addresses...');
    console.log('Shipping:', shippingAddressRequest);
    console.log('Billing:', billingAddressRequest);

    // Create both addresses simultaneously using forkJoin
    forkJoin({
      shipping: this.addressService.createAddress(shippingAddressRequest),
      billing: this.addressService.createAddress(billingAddressRequest)
    }).subscribe({
      next: (addresses) => {
        console.log('✅ Addresses created:', addresses);
        
        // Step 3: Create Order with the address IDs
        const orderRequest: CreateOrderRequest = {
          shippingAddressId: addresses.shipping.addressId,
          billingAddressId: addresses.billing.addressId,
          promoCode: this.promoApplied ? this.promoCode : undefined,
          notes: this.notesForm.get('notes')?.value || undefined
        };

        console.log('Creating order with request:', orderRequest);

        this.orderService.createOrder(orderRequest).subscribe({
          next: (order) => {
            console.log('✅ Order created successfully:', order);
            
            // Clear cart after successful order
            this.cartService.clearCart().subscribe({
              next: () => {
                console.log('Cart cleared');
              },
              error: (error) => {
                console.error('Error clearing cart:', error);
              }
            });

            this.processing = false;

  
            
            // Redirect to order details or orders list
            // Dans placeOrder(), remplacer l'alerte par la redirection :
            this.router.navigate(['/order-success'], {
              state: {
                orderNumber: order.orderNumber,
                orderId: order.orderId,
                totalAmount: order.totalAmount,
                items: this.cart?.cartItems.map(item => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.price
                })) || [],
                shippingAddress: this.shippingForm.value,
                paymentMethod: this.getPaymentMethodName(),
                orderDate: new Date().toISOString()
              }
            });
          },
          error: (error) => {
            console.error('❌ Error creating order:', error);
            this.processing = false;
            this.handleOrderError(error);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error creating addresses:', error);
        this.processing = false;
        
        let errorMessage = 'Failed to save delivery address. Please try again.';
        
        if (error.status === 400 && error.error?.errors) {
          // Validation errors from backend
          const errors = error.error.errors;
          errorMessage = 'Please check your address:\n';
          Object.keys(errors).forEach(key => {
            errorMessage += `- ${errors[key][0]}\n`;
          });
        } else if (error.status === 401) {
          errorMessage = 'Please log in to place an order.';
          this.router.navigate(['/login']);
          return;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        alert(errorMessage);
      }
    });
  }

  private handleOrderError(error: any): void {
    let errorMessage = 'Failed to place order. Please try again.';
    
    if (error.status === 400) {
      if (error.error?.errors) {
        errorMessage = 'Order validation failed:\n';
        Object.keys(error.error.errors).forEach(key => {
          errorMessage += `- ${error.error.errors[key][0]}\n`;
        });
      } else {
        errorMessage = 'Invalid order data. Please check your information.';
      }
    } else if (error.status === 401) {
      errorMessage = 'Please log in to place an order.';
      this.router.navigate(['/login']);
      return;
    } else if (error.status === 404) {
      errorMessage = 'Some items in your cart are no longer available.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    alert(errorMessage);
  }

  private getPaymentMethodName(): string {
    switch (this.paymentMethod) {
      case 'card': return 'Credit/Debit Card';
      case 'paypal': return 'PayPal';
      case 'cod': return 'Cash on Delivery';
      default: return 'Unknown';
    }
  }

  // Helper Methods
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
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  }
}