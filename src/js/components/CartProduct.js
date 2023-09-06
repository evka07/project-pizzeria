import {select} from "../settings.js";
import {app} from "../app.js";


class CartProduct {
    constructor(menuProduct, element) {
        this.menuProduct = menuProduct;

        if (element) {
            this.element = element;
            this.dom = {};
            this.prepareDOMRefs(element);
            this.initAmountAdjustment();
            this.initRemoveButton()
        }
    }

    prepareDOMRefs(element) {
        this.dom.wrapper = element;
        this.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
        this.dom.price = element.querySelector(select.cartProduct.price);
        this.dom.edit = element.querySelector(select.cartProduct.edit);
        this.dom.remove = element.querySelector(select.cartProduct.remove);
        this.dom.quantityDecrease = element.querySelector(select.widgets.amount.linkDecrease);
        this.dom.quantityIncrease = element.querySelector(select.widgets.amount.linkIncrease);
    }

    initAmountAdjustment() {
        const cartProduct = this;

        cartProduct.dom.quantityDecrease.addEventListener('click', function (event) {
            event.preventDefault();
            cartProduct.decreaseQuantity();
        });

        cartProduct.dom.quantityIncrease.addEventListener('click', function (event) {
            event.preventDefault();
            cartProduct.increaseQuantity();
        });
    }

    decreaseQuantity() {
        const currentValue = parseInt(this.dom.amountWidget.querySelector('input').value);
        if (currentValue > 1) {
            this.dom.amountWidget.querySelector('input').value = currentValue - 1;
            this.updateProductPrice(currentValue - 1);
        }
    }

    increaseQuantity() {
        const currentValue = parseInt(this.dom.amountWidget.querySelector('input').value);
        this.dom.amountWidget.querySelector('input').value = currentValue + 1;
        this.updateProductPrice(currentValue + 1);
    }

    updateProductPrice(newQuantity) {
        const thisCartProduct = this;
        const singleProductPrice = thisCartProduct.menuProduct.price / thisCartProduct.menuProduct.amount;

        const oldAmount = thisCartProduct.menuProduct.amount;
        thisCartProduct.menuProduct.amount = newQuantity;
        thisCartProduct.menuProduct.price = singleProductPrice * newQuantity;


        thisCartProduct.dom.price.textContent = `${thisCartProduct.menuProduct.price.toFixed(2)}`;


        app.cart.updateCart();
        app.cart.updateTotalPrice();


        if (oldAmount !== newQuantity) {
            app.cart.updateTotalPrice();
        }
    }

    initRemoveButton() {
        const cartProduct = this

        cartProduct.dom.remove.addEventListener('click', function (event) {
            event.preventDefault()
            cartProduct.remove()
        })
    }

    remove() {
        const cartProduct = this
        const cart = app.cart

        const productIndex = cart.products.indexOf(cartProduct.menuProduct)
        if (productIndex !== -1) {
            cart.products.splice(productIndex, 1)
            cart.update();
            cart.updateCart();
            cart.updateTotalPrice();
        }
    }

}

export default CartProduct