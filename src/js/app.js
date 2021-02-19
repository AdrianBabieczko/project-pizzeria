import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = 
  {
    init: function()
    {
      const thisApp = this;
    
      thisApp.initData();
      thisApp.initCart();
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
    },
  };

app.init();
