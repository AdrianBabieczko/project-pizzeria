import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = 
  {
    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;

      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      thisApp.activatePage(thisApp.pages[0].id);
    },

    activatePage: function(pageId){
      const thisApp = this;

      /* add class activ to maching apges , remove from non matching*/
      for(let page of thisApp.pages){
        page.classList.toggle(classNames.pages.active, page.id == pageId);
      }

      /* add class activ to maching links , remove from non matching*/
      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active, 
          link.getAttribute('href') == '#' + pageId
        );
      }
    },

    initMenu: function()
    {
      const thisApp = this;

      for (const productData in thisApp.data.products) 
      {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initCart: function() 
    {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){

        app.cart.add(event.detail.product);
      });
    },

    initData: function() 
    {
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){

          thisApp.data.products = parsedResponse;

          thisApp.initMenu();

        });
    },

    init: function()
    {
      const thisApp = this;
      
      thisApp.initPages();

      thisApp.initData();
      thisApp.initCart();
    },
  };

app.init();