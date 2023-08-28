/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product', // CODE ADDED
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
            cartButton: '.btn-primary[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input.amount', // CODE CHANGED
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
        // CODE ADDED START
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            totalPrices:'.cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },
        // CODE ADDED END
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
        // CODE ADDED START
        cart: {
            wrapperActive: 'active',
        },
        // CODE ADDED END
    };

    const settings = {
        db: {
            url: '//localhost:3131',
            products: 'products',
            orders: 'orders',
        },
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }, // CODE CHANGED
        // CODE ADDED START
        cart: {
            defaultDeliveryFee: 20,
        },
        // CODE ADDED END
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        // CODE ADDED START
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
        // CODE ADDED END
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
            thisProduct.price = typeof data.price === 'number' ? data.price: 0;
            console.log("Price : ", thisProduct.price)
            thisProduct.renderInMenu();
            thisProduct.initOrderForm();
            thisProduct.initAmountWidget();
            thisProduct.processOrder();
            thisProduct.prepareCartProductParams()
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

            const addToCartButton = thisProduct.formElement.querySelector(select.menuProduct.cartButton)

            for (const input of thisProduct.formInputs) {
                input.addEventListener('change', function () {
                    thisProduct.processOrder();
                });
            }

            addToCartButton.addEventListener('click', function (event) {
                event.preventDefault();
                console.log('Add to cart button clicked');
                thisProduct.addToCart();
            });

        }

        prepareCartProductParams() {
            const thisProduct = this
            const formData = utils.serializeFormToObject(thisProduct.formElement)

            const cartProductParams = {}

            for (const param in thisProduct.data.params) {
                cartProductParams[param] = {
                    label: thisProduct.data.params[param].label,
                    options: {}
                }

                for (const option in thisProduct.data.params[param].options) {
                    const optionData = thisProduct.data.params[param].options[option];
                    const optionSelected = formData[param] && formData[param].includes(option)

                    if (optionSelected) {
                        cartProductParams[param].options[option] = optionData.label
                    }
                }
            }
            return cartProductParams
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
                element: thisProduct.element,
            };

            app.cart.add(cartProduct);
            app.cart.updateSubtotal();
            app.cart.updateTotalPrice();
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

    class Cart {
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


    const app = {
        initMenu: function () {
            const thisApp = this;

            for (const productData in thisApp.data.products) {
                console.log('Product ID:', productData);
                console.log('Product Data:', thisApp.data.products[productData]);

                new Product(productData, thisApp.data.products[productData]);
            }
            thisApp.initAccordion();
        },
        initData: function () {
            const thisApp = this;
            thisApp.data = {};

            const url = settings.db.url + '/' + settings.db.products;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    thisApp.data.products = data;
                    thisApp.initMenu();
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        },
        initCart: function () {
            const thisApp = this;
            const cartElement = document.querySelector(select.containerOf.cart);
            thisApp.cart = new Cart(cartElement);

            const orderForm  = cartElement.querySelector(select.cart.form)
            orderForm.addEventListener('submit', function (event){
                event.preventDefault()

                const formData = new FormData(orderForm)
                const orderData = {
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    products:thisApp.cart.products.map(product => ({
                        id: product.id,
                        amount: product.amount
                    }))
                }
                fetch(`${settings.db.url}/${settings.db.orders}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                })
                    .then(response => response.data)
                    .then(data => {
                        console.log('Ok', data)
                    })
                    .catch(error => {
                        console.error("Error", error)
                    })
            })
        },
        init: function () {
            const thisApp = this;
            thisApp.initData();
            thisApp.initMenu();
            thisApp.initCart();
            thisApp.initAccordion();
        },
        initAccordion: function () {
            const productHeaders = document.querySelectorAll(select.menuProduct.clickable);

            for (const header of productHeaders) {
                header.addEventListener('click', function () {
                    console.log('Product header clicked:', header);
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