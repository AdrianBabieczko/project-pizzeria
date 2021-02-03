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
      cartButton: '[href="#add-to-cart"]',
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
      totalPrice: '.cart__total-price strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      totalSpan: '.cart__order-total .cart__order-price-sum strong',
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

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom = {
        accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
        form: thisProduct.element.querySelector(select.menuProduct.form),
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
        imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget)
      };   

      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    }

    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
        
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        var activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct && activeProduct != thisProduct.element){
          activeProduct.classList.toggle(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (const input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param) ...
      for(let paramId in thisProduct.data.params){
        // determine param value, e.g. paramId = 'topping', param = {label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {
          //determine option valie, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];

          const optionSelectetd = formData[paramId] && formData[paramId].includes(optionId);

          //find img with specific class
          const img = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if(img) 
          {
            if(optionSelectetd)
            {
              img.classList.add(classNames.menuProduct.imageVisible);
            }
            else
            {
              img.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          
          // check if optionId of paramId is selected in formData
          if(optionSelectetd)
          {
            // check if the option is not default
            if(!option['default']) 
            {
              //add option price to price variable
              price += option['price'];
            }
          }
          else 
          {
            //check if the option is default
            if(option['default'])
            {
              //reduce price variable
              price -= option['price'];
            }
          }
        }
      }

      thisProduct.priceSingle = price;

      //multiply price by product quantity
      price *= thisProduct.amountWidget.value;

      //update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget()
    {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });
    }

    addToCart()
    {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct()
    {
      const thisProduct = this;

      const productSummary = 
      {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };

      return productSummary;
    }

    prepareCartProductParams()
    {
      const thisProduct = this;

      const productParams = {};
      
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // for every category (param) ...
      for(let paramId in thisProduct.data.params){
        // determine param value, e.g. paramId = 'topping', param = {label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId];

        productParams[paramId]= {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          //determine option valie, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];

          const optionSelectetd = formData[paramId] && formData[paramId].includes(optionId);

          // check if optionId of paramId is selected in formData
          if(optionSelectetd)
          {
            productParams[paramId].options[optionId] = option.label;
          }          
        }
      }

      return productParams;
    }
  }

  class AmountWidget 
  {
    constructor (element)
    {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element)
    {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value)
    {
      const thisWidget = this;
      
      const newValue = parseInt(value);

      //quantity validation
      if(!isNaN(newValue) && newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)
      {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions()
    {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();

        const currentInputValue = parseInt(thisWidget.input.value);
        thisWidget.setValue(currentInputValue - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();

        const currentInputValue = parseInt(thisWidget.input.value);
        thisWidget.setValue(currentInputValue + 1);
      });
    }

    announce()
    {
      const thisWidget = this;

      const event = new CustomEvent('update', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart
  {
    constructor(element)
    {
      const thisCart = this;

      thisCart.products= [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element)
    {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice);
      thisCart.dom.totalSpan = document.querySelector(select.cart.totalSpan);
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    }

    initActions()
    {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('update', function(){
        thisCart.update();
      });
    }

    add(menuProduct) 
    {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    update()
    {
      const thisCart = this;

      var deliveryFee = settings.cart.defaultDeliveryFee;
      var totalNumber = 0;
      var subtotalPrice = 0;

      for (const product of thisCart.products) 
      {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if(subtotalPrice != 0)
      {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      }
      else
      {
        thisCart.totalPrice = 0;
        deliveryFee = 0;
      }

      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = subtotalPrice + deliveryFee;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.totalSpan.innerHTML = subtotalPrice + deliveryFee;
    }
  }

  class CartProduct 
  {
    constructor(menuProduct, element)
    {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }

    getElements(element)
    {
      const thisCartProduct = this;

      thisCartProduct.dom = {
        wrapper: element
      };

      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.edit);
      thisCartProduct.dom.remove = element.querySelector(select.remove);
    }

    initAmountWidget() 
    {
      const thisCartProduct = this;
      thisCartProduct.dom.amountWidget.addEventListener('update', thisCartProduct.update);
    }

    update() 
    {
      const thisCartProduct = this;

      thisCartProduct.amount =this.amountWidget.value;
      thisCartProduct.price =this.priceSingle * this.amount;
      thisCartProduct.dom.price.innerHTML =this.price;
    }
  }

  const app = 
  {
    init: function()
    {
      const thisApp = this;
    
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initData: function() 
    {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function()
    {
      const thisApp = this;

      for (const productData in thisApp.data.products) 
      {
        new Product(productData, thisApp.data.products[productData]);
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
}
