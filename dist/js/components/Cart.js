import {classNames, select, settings, templates} from "../settings.js";
import utils from '../utils.js';
import CartProduct from "./CartProduct.js";

export default class Cart {
    constructor(element) {
        this.products = [];
        this.getElements(element);
        this.initActions();
        this.initRemoveButton()
    }

    getElements(element) {
        this.dom = {};
        this.dom.wrapper = element;
        this.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
        this.dom.productList = element.querySelector(select.cart.productList);
        this.dom.totalNumber = element.querySelector(select.cart.totalNumber);
        this.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
        this.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
        this.dom.totalPrice = element.querySelector(select.cart.totalPrice);
        this.dom.totalPrices = element.querySelector(select.cart.totalPrices)
    }

    initActions() {
        this.dom.toggleTrigger.addEventListener('click', () => {
            this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
    }

    updateSubtotal() {
        const subtotalPrice = this.products.reduce((total, product) => total + product.price, 0);
        this.dom.subtotalPrice.textContent = `${subtotalPrice.toFixed(2)}`;
    }

    updateTotalPrice() {
        const deliveryFee = settings.cart.defaultDeliveryFee
        const totalPrice = this.products.reduce((total, product) => total + product.price, 0) + deliveryFee
        this.dom.totalPrice.textContent = `${totalPrice.toFixed(2)}`

        if (this.dom.deliveryFee) {
            this.dom.deliveryFee.textContent = `${deliveryFee.toFixed(2)}`
        }
    }



    update() {
        const deliveryFee = settings.cart.defaultDeliveryFee;

        let totalNumber = 0;
        let subtotalPrice = 0;

        for (const product of this.products) {
            totalNumber += product.amount;
            subtotalPrice += product.price;
        }

        this.totalPrices = subtotalPrice + deliveryFee;

        if (this.dom.totalNumber) {
            this.dom.totalNumber.textContent = totalNumber;
        }
        if (this.dom.subtotalPrice) {
            this.dom.subtotalPrice.textContent = `${subtotalPrice.toFixed(2)}`;
        }
        if (this.dom.deliveryFee) {
            this.dom.deliveryFee.textContent = `${deliveryFee.toFixed(2)}`;
        }
        if (this.dom.totalPrices) {
            this.dom.totalPrices.textContent = `${this.totalPrices.toFixed(2)}`;
        }
    }

    add(cartProduct) {
        this.products.push(cartProduct);
        this.update();
        this.updateCart();

        const cartProductElement = templates.cartProduct(cartProduct);
        const cartProductDOM = utils.createDOMFromHTML(cartProductElement);
        const cartProductInstance = new CartProduct(cartProduct, cartProductDOM);
    }

    updateCart() {
        this.dom.productList.innerHTML = '';

        for (const product of this.products) {
            const generateHTML = templates.cartProduct(product);
            const productElement = utils.createDOMFromHTML(generateHTML);
            const cartProductInstance = new CartProduct(product, productElement);

            this.dom.productList.appendChild(productElement);
        }

        const totalPrice = this.products.reduce((total, product) => total + product.price, 0);
        this.dom.totalPrice.textContent = `${totalPrice.toFixed(2)}`;

        this.update();
    }
    initRemoveButton() {
        const cart = this
        cart.dom.productList.addEventListener('click', function (event) {
            const clickedElement = event.target

            if (clickedElement.matches(select.cartProduct.remove)) {
                const cartProductElement = clickedElement.closest(select.cartProduct.wrapper)
                if (cartProductElement) {
                    const cartProductInstance = cartProductElement.cartProduct
                    cartProductInstance.remove()
                }
            }
        })
    }
}
