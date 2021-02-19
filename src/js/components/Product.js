class Product 
{
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

export default Product;