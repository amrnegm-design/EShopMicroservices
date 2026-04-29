export interface ShoppingCartItem {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  price: number;
}

export interface ShoppingCart {
  userName: string;
  items: ShoppingCartItem[];
  totalPrice?: number;
}

export interface GetBasketResponse {
  cart: ShoppingCart;
}

export interface StoreBasketResponse {
  userName: string;
}

export interface DeleteBasketResponse {
  isSuccess: boolean;
}

export interface BasketCheckoutDto {
  userName: string;
  customerId: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}

export interface CheckoutBasketResponse {
  isSuccess: boolean;
}
