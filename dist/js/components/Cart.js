import {classNames, select, settings, templates} from "../settings.js";
import utils from '../utils.js';
import CartProduct from "./CartProduct.js";

export default class Cart {
    constructor(element) {
        this.products = [];
        this.getElements(element);
        this.initActions();
        this.initRemoveButton();
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
        this.dom.totalPrices = element.querySelector(select.cart.totalPrices);
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
        const deliveryFee = settings.cart.defaultDeliveryFee;
        const totalPrice = this.products.reduce((total, product) => total + product.price, 0) + deliveryFee;
        this.dom.totalPrice.textContent = `${totalPrice.toFixed(2)}`;

        if (this.dom.deliveryFee) {
            this.dom.deliveryFee.textContent = `${deliveryFee.toFixed(2)}`;
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
        if (this.dom.totalPrice) {
            this.dom.totalPrice.textContent = `${this.totalPrices.toFixed(2)}`;
        }
    }

    add(menuProduct) {
        const thisCart = this;

        /* generate HTML based on template */
        const generatedHTML = templates.cartProduct(menuProduct);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        /* add DOM elements to thisCart.dom.productList */
        thisCart.dom.productList.appendChild(generatedDOM);

        thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

        thisCart.update();
    }

    remove(cartProduct) {
        const thisCart = this;

        const indexOfCartProduct = thisCart.products.findIndex(
            product => product.id === cartProduct.id
        );

        if (indexOfCartProduct !== -1) {
            cartProduct.dom.wrapper.remove();
            thisCart.products.splice(indexOfCartProduct, 1);
            thisCart.update();
        }
    }

    initRemoveButton() {
        const thisCart = this;

        thisCart.dom.productList.addEventListener('remove', function (event) {
            thisCart.remove(event.detail.cartProduct);
        });
    }
}
