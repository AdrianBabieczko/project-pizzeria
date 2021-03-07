import {templates, select} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

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

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

    thisBooking.dom.date = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.time = element.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets()
  {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dateWidget = new DatePicker(thisBooking.dom.date);
    thisBooking.timeWidget = new HourPicker(thisBooking.dom.time);

    thisBooking.dom.peopleAmount.addEventListener('update', function(){
    });

    thisBooking.dom.hoursAmount.addEventListener('update', function(){
    });

    thisBooking.dom.date.addEventListener('update', function(){
    });

    thisBooking.dom.time.addEventListener('update', function(){
    });
  }
}

export default Booking;