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