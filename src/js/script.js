/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: "#template-menu-product",
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input[name="amount"]',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    };

    class AmountWidget {
        constructor(element) {
            const thisWidget = this

            thisWidget.getElement(element)
            thisWidget.setValue(thisWidget.input.value)
            thisWidget.initAction()
        }

        getElement(element) {
            const thisWidget = this
            thisWidget.element = element
            thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input)
            thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
            thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
        }

        setValue(value) {
            const thisWidget = this;

            const newValue = parseInt(value)

            if (
                newValue >= settings.amountWidget.defaultMin &&
                newValue <= settings.amountWidget.defaultMax
            ) {
                thisWidget.value = newValue
            } else {
                thisWidget.value = settings.amountWidget.defaultValue
            }

            thisWidget.input.value = thisWidget.value
            thisWidget.announce()
        }


        initAction() {
            const thisWidget = this;

            thisWidget.input.addEventListener('change', function () {
                thisWidget.setValue(thisWidget.input.value)
            });

            thisWidget.linkDecrease.addEventListener('click', function (event) {
                event.preventDefault()
                thisWidget.setValue(thisWidget.value - 1)
                thisWidget.input.dispatchEvent(new Event('change'))
            })

            thisWidget.linkIncrease.addEventListener('click', function (event) {
                event.preventDefault()
                thisWidget.setValue(thisWidget.value + 1)
                thisWidget.announce()
                thisWidget.input.dispatchEvent(new Event('change'))
            })
        }
        announce() {
            const thisWidget = this
            const event = new Event('updated');

            thisWidget.element.dispatchEvent(event)
        }
    }

    class Product {
        constructor(id, data) {
            const thisProduct = this;
            thisProduct.id = id;
            thisProduct.data = data;
            thisProduct.renderInMenu();
            thisProduct.initOrderForm();
            thisProduct.processOrder();
            thisProduct.initAmountWidget();
        }


        renderInMenu() {
            const thisProduct = this;
            const generatedHTML = templates.menuProduct(thisProduct.data)
            thisProduct.element = utils.createDOMFromHTML(generatedHTML);
            const menuContainer = document.querySelector(select.containerOf.menu)
            menuContainer.appendChild(thisProduct.element)
            thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem)
            thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper)
        }

        initOrderForm() {
            const thisProduct = this;
            thisProduct.formElement = thisProduct.element.querySelector(select.menuProduct.form);
            thisProduct.formInputs = thisProduct.formElement.querySelectorAll(select.all.formInputs);

            for (const input of thisProduct.formInputs) {
                input.addEventListener('change', function () {
                    thisProduct.processOrder();
                });
            }
        }

        processOrder() {
            const thisProduct = this;
            const formData = utils.serializeFormToObject(thisProduct.formElement);

            let price = thisProduct.data.price;
            let optionImageVisible = false;

            for (const param in thisProduct.data.params) {

                for (const option in thisProduct.data.params[param].options) {
                    const optionData = thisProduct.data.params[param].options[option];
                    const optionSelected = formData[param] && formData[param].includes(option)

                    if (optionSelected) {
                        if (!optionData.default) {
                            price += optionData.price;
                        }
                    } else {
                        if (optionData.default) {
                            price -= optionData.price;
                        }
                    }
                    const optionImage = thisProduct.imageWrapper.querySelector(`.${param}-${option}`)
                    if (optionImage) {
                        if (optionSelected) {
                            optionImage.classList.add(classNames.menuProduct.imageVisible)
                            optionImageVisible = true;
                        } else {
                            optionImage.classList.remove(classNames.menuProduct.imageVisible)
                        }
                    }
                }
            }

            thisProduct.priceSingle = price;
            thisProduct.price = thisProduct.priceSingle * thisProduct.getAmount();
            thisProduct.priceElem.innerHTML = thisProduct.price.toFixed(2);
            // thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value

            if (!optionImageVisible) {
                thisProduct.imageWrapper.classList.remove(classNames.menuProduct.imageVisible)
            } else {
                thisProduct.imageWrapper.classList.add(classNames.menuProduct.imageVisible)
            }
        }

        getAmount() {
            const thisProduct = this;
            const amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
            const input = amountWidgetElem.querySelector(select.widgets.amount.input);
            return parseInt(input.value);
        }
        initAmountWidget() {
            const thisProduct = this
            const amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget)

            thisProduct.amountWidget = new AmountWidget(amountWidgetElem)

            thisProduct.amountWidget.element.addEventListener("updated", function () {
                thisProduct.processOrder()
            })

        }

    }

    const app = {
        initMenu: function () {
            const thisApp = this;

            for (const productData in dataSource.products) {
                new Product(productData, dataSource.products[productData]);
            }
        },
        initData: function () {
            const thisApp = this;
            thisApp.data = dataSource;
        },

        init: function () {
            const thisApp = this;
            thisApp.initData();
            thisApp.initMenu();
            thisApp.initAccordion();
        },
        initAccordion: function () {
            const thisApp = this;
            const productHeaders = document.querySelectorAll(select.menuProduct.clickable);

            for (const header of productHeaders) {
                header.addEventListener('click', function () {
                    const productElement = this.parentElement;
                    const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

                    for (const activeProduct of activeProducts) {
                        if (activeProduct !== productElement) {
                            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
                        }
                    }

                    productElement.classList.toggle(classNames.menuProduct.wrapperActive);
                });
            }
        },
    };

    app.init();
}
