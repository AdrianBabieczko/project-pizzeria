import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';
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
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);
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

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();

      thisCart.sendOrder();
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

    thisCart.deliveryFee = deliveryFee;
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.totalNumber = totalNumber;
  }

  sendOrder()
  {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    let payload = 
    {
      address: thisCart.dom.address.value, 
      phone: thisCart.dom.phone.value, 
      totalPrice: thisCart.totalPrice, 
      subTotalPrice: thisCart.subtotalPrice, 
      totalNumber: thisCart.totalNumber, 
      deliveryFee: thisCart.deliveryFee, 
      products: []
    };

    for(let prod of thisCart.products)
    {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;