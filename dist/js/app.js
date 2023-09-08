import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import {settings, select, classNames} from "./settings.js";
import Booking from "./components/Booking.js";

export const app = {

    initPages: function () {
        const thisApp = this;

        thisApp.pages = document.querySelector(select.containerOf.pages).children;
        thisApp.navLinks = document.querySelectorAll(select.nav.links);

        const idFromHash = window.location.hash.replace('#/', '');
        let pageMatchingHash = thisApp.pages[0].id;

        for(let page of thisApp.pages){
            if(page.id == idFromHash){
                pageMatchingHash = page.id;
                break;
            }
        }

        thisApp.activatePage(pageMatchingHash);

        for(let link of thisApp.navLinks){
            link.addEventListener('click', function(event){
                const clickedElement = this;
                event.preventDefault();

                /* get page id from href attribute */
                const id = clickedElement.getAttribute('href').replace('#', '');

                /* run thisApp.activatePage with that id */
                thisApp.activatePage(id);
                /* run URL hash */
                window.location.hash = '#/' + id;

            })
        }
    },

    activatePage: function(pageId) {
        const thisApp = this;

        /* add class "active" to matching pages, remove from non-matching */
        for(let page of thisApp.pages){
            // if(page.id == page.Id){
            //     page.classList.add(classNames.pages.active);
            // } else {
            //     page.classList.remove(classNames.pages.active);
            // }

            page.classList.toggle(classNames.pages.active, page.id === pageId);

        }
        /* add class "active" to matching links, remove from non-matching */

        for(let link of thisApp.navLinks){
            link.classList.toggle(
                classNames.nav.active,
                link.getAttribute('href') === '#' + pageId
            );
        }

    },

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
        thisApp.initPages()
        thisApp.initBooking()
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
    initBooking: function () {
        const thisApp = this
        const bookingContainer = document.querySelector(select.containerOf.booking)
        new Booking(bookingContainer)
    }
};

app.init();