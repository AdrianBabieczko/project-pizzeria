// import {settings, select} from '../settings.js';

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

    console.log(element, thisBooking);
  }

  initWidgets()
  {

  }
}

export default Booking;