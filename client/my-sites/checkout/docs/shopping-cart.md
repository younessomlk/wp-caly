# Shopping Cart

A significant amount of the shopping cart workflow takes place through hooks in Composite Checkout.

## Display Cart 

![Display cart](get-cart.svg)

## Add to Cart

When on a shopping cart page, renewals may be added to the cart by directly modifying the store.

![Add to cart via user interaction](set-cart-via-button.svg)

Outside of the shopping cart, items are added through the controller with item details extracted from the URL path.

![Add to cart via routing](set-cart-via-routing.svg)

## Save Cart

![Set cart](set-cart.svg)
