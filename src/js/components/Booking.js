 import {templates} from '../settings.js';

class Booking
{
  constructor (element)
  {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element)
  {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    console.log(thisBooking.dom.wrapper);
  }

  initWidgets()
  {

  }
}

export default Booking;