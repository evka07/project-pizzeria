import AmountWidget from './AmountWidget.js';
import {classNames, select, templates} from "../settings.js";
import utils from '../utils.js';


export default class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.price = typeof data.price === 'number' ? data.price : 0;

        thisProduct.renderInMenu();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }

    renderInMenu() {
        const thisProduct = this;
        const generatedHTML = templates.menuProduct(thisProduct.data);
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        const menuContainer = document.querySelector(select.containerOf.menu);
        menuContainer.appendChild(thisProduct.element);

        thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initOrderForm() {
        const thisProduct = this;
        thisProduct.formElement = thisProduct.element.querySelector(select.menuProduct.form);
        thisProduct.formInputs = thisProduct.formElement.querySelectorAll(select.all.formInputs);

        const addToCartButton = thisProduct.formElement.querySelector(select.menuProduct.cartButton);

        for (const input of thisProduct.formInputs) {
            input.addEventListener('change', function () {
                thisProduct.processOrder();
            });
        }

        addToCartButton.addEventListener('click', function (event) {
            event.preventDefault();
            thisProduct.addToCart();
        });
    }

    initAmountWidget() {
        const thisProduct = this;
        const amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

        thisProduct.amountWidget = new AmountWidget(amountWidgetElem);

        thisProduct.amountWidget.element.addEventListener('updated', function () {
            thisProduct.processOrder();
        });
    }

    prepareCartProductParams() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.formElement);

        const cartProductParams = {};

        for (const param in thisProduct.data.params) {
            cartProductParams[param] = {
                label: thisProduct.data.params[param].label,
                options: {}
            };

            for (const option in thisProduct.data.params[param].options) {
                const optionData = thisProduct.data.params[param].options[option];
                const optionSelected = formData[param] && formData[param].includes(option);

                if (optionSelected) {
                    cartProductParams[param].options[option] = optionData.label;
                }
            }
        }

        return cartProductParams;
    }

    addToCart() {
        const thisProduct = this;

        const cartProduct = {
            id: thisProduct.id,
            data: thisProduct.data,
            price: thisProduct.price,
            amount: thisProduct.getAmount(),
            name: thisProduct.data.name,
            params: thisProduct.prepareCartProductParams(),
            element: thisProduct.element
        };

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: cartProduct
            }
        });

        thisProduct.element.dispatchEvent(event);
    }

    processOrder() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.formElement);

        let price = thisProduct.data.price;
        let optionImageVisible = false;

        for (const param in thisProduct.data.params) {
            for (const option in thisProduct.data.params[param].options) {
                const optionData = thisProduct.data.params[param].options[option];
                const optionSelected = formData[param] && formData[param].includes(option);

                if (optionSelected) {
                    if (!optionData.default) {
                        price += optionData.price;
                    }
                } else {
                    if (optionData.default) {
                        price -= optionData.price;
                    }
                }

                const optionImage = thisProduct.imageWrapper.querySelector(`.${param}-${option}`);
                if (optionImage) {
                    if (optionSelected) {
                        optionImage.classList.add(classNames.menuProduct.imageVisible);
                        optionImageVisible = true;
                    } else {
                        optionImage.classList.remove(classNames.menuProduct.imageVisible);
                    }
                }
            }
        }

        thisProduct.priceSingle = price;
        thisProduct.price = thisProduct.priceSingle * thisProduct.getAmount();
        thisProduct.priceElem.innerHTML = thisProduct.price.toFixed(2);

        if (!optionImageVisible) {
            thisProduct.imageWrapper.classList.remove(classNames.menuProduct.imageVisible);
        } else {
            thisProduct.imageWrapper.classList.add(classNames.menuProduct.imageVisible);
        }
    }

    getAmount() {
        const thisProduct = this;
        const amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
        const input = amountWidgetElem.querySelector(select.widgets.amount.input);
        return parseInt(input.value);
    }
}

