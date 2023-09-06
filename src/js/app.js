
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import {settings, select, classNames} from "./settings.js";

 export const app = {
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

            thisApp.productList = document.querySelector(select.containerOf.menu);
            thisApp.productList.addEventListener('add-to-cart', function (event){
                app.cart.add(event.detail.product);
            });

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