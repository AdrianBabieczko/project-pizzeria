import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
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
    thisBooking.getData();

    thisBooking.selectedTableNumber = null;
    thisBooking.starters = [];
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:          settings.db.url + '/' + settings.db.booking 
                                        + '?' + params.booking.join('&'),

      eventsCurrent:    settings.db.url + '/' + settings.db.event   
                                        + '?' + params.eventsCurrent.join('&'),

      eventsRepeat:     settings.db.url + '/' + settings.db.event   
                                        + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrentResponse, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrentResponse, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.dateWidget.minDate;
    const maxDate = thisBooking.dateWidget.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){  
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+=0.5){
      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.dateWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.timeWidget.value);

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = this.parseTableId(table);

      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

    thisBooking.resetSelectedTables();
  }  

  parseTableId(table) {
    let tableId = table.getAttribute(settings.booking.tableIdAttribute);
    if (!isNaN(tableId)) {
      tableId = parseInt(tableId);
    }
    return tableId;
  }

  render(wrapper)
  {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = wrapper;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.time = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets()
  {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dateWidget = new DatePicker(thisBooking.dom.date);
    thisBooking.timeWidget = new HourPicker(thisBooking.dom.time);

    thisBooking.dom.wrapper.addEventListener('update', function(){
      thisBooking.updateDOM();
    });

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        thisBooking.initTables(table);
      });
    }

    const bookTableButton = thisBooking.dom.wrapper.getElementsByClassName('btn-secondary');
    bookTableButton[0].addEventListener('click', function(event){
      event.preventDefault();

      thisBooking.sendBooking();
    });
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);

    thisBooking.dom.starterWater = document.querySelector(select.booking.starterWater);
    thisBooking.dom.starterBread = document.querySelector(select.booking.starterBread);

    let payload = {
      date: thisBooking.dateWidget.correctValue,
      hour: thisBooking.timeWidget.correctValue,
      table: thisBooking.selectedTableNumber,
      duration: thisBooking.hoursAmountWidget.correctValue,
      ppl: thisBooking.peopleAmountWidget.correctValue,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    if(thisBooking.dom.starterBread.checked == true){
      thisBooking.starters.push(thisBooking.dom.starterWater.value);
      thisBooking.starters.push(thisBooking.dom.starterBread.value);
    } else if(thisBooking.dom.starterWater.checked == true){
      thisBooking.starters.push(thisBooking.dom.starterWater.value);
    }

    payload.starters = thisBooking.starters;

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
      })
      .then(function(parsedResponse){
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
      });
  }

  initTables(table){
    const thisBooking = this;

    const tableId = thisBooking.parseTableId(table);

    if(!table.classList.contains(classNames.booking.tableBooked)){
      if(thisBooking.selectedTableNumber != 'undefined' && thisBooking.selectedTableNumber == tableId){
        table.classList.toggle(classNames.booking.selected);
      } else {
        const selectedTable = thisBooking.dom.wrapper.getElementsByClassName(classNames.booking.selected);

        if(selectedTable.length > 0){
          selectedTable[0].classList.toggle(classNames.booking.selected);
        }

        thisBooking.selectedTableNumber = tableId;
        table.classList.toggle(classNames.booking.selected);
      }
    } else {
      alert('Table is booked already');
    }
  }


  resetSelectedTables(){
    const thisBooking = this;

    const selectedTable = thisBooking.dom.wrapper.getElementsByClassName(classNames.booking.selected);
    if(selectedTable.length > 0){
      if(selectedTable[0].classList.contains(classNames.booking.selected)){
        selectedTable[0].classList.remove(classNames.booking.selected);
        thisBooking.selectedTableNumber = null;
      }
    }
  }
}

export default Booking;