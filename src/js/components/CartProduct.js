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
    thisCartProduct.initActions();
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

  remove()
  {
    const thisCartProduct = this;

    const event = new CustomEvent('remove',
      {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions()
  {
    const thisCartProduct = this;

    if(thisCartProduct.dom.edit)
    {
      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
      });
    }

    if(thisCartProduct.dom.remove)
    {
      thisCartProduct.dom.remove.addEventListener('click', function(event) {
      
        event.preventDefault();

        thisCartProduct.remove();
      });
    }
  }

  getData()
  {
    const thisCartProduct = this;

    const product = 
    {
      id: thisCartProduct.id,
      amout: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    };

    return product;
  }
}