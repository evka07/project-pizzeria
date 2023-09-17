import {select, templates, settings, classNames} from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element) {
        const thisBooking = this;

        this.render(element);
        this.initWidgets();
        this.getData();
        this.initTables()
        this.initActions()

    }


    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [
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
            ]
        }

        const urls = {
            bookings:       settings.db.url + '/' + settings.db.bookings
                + '?' + params.bookings.join('&'),
            eventsCurrent:  settings.db.url + '/' + settings.db.events
                + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:   settings.db.url + '/' + settings.db.events
                + '?' + params.eventsRepeat.join('&'),
        };
        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]){
                console.log(bookings);
                console.log(eventsCurrent);
                console.log(eventsRepeat);
                thisBooking.parseData(bookings,eventsCurrent, eventsRepeat);
            });

    }
    // module 11.2
    parseData(bookings,eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;


        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        thisBooking.updateDOM();
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
        console.log('date', thisBooking.date);
        console.log('hour', thisBooking.hour);
        console.log('thisBooking.booked', thisBooking.booked);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(!allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }
        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }



    render(element) {

        const thisBooking = this;
        const generateHTML = templates.bookingWidget();
        this.dom = {};
        this.dom.wrapper = element;
        this.dom.wrapper.innerHTML = generateHTML;
        this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
        this.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        this.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        this.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
        this.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        this.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    }

    initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

        thisBooking.datePicker = new DatePicker(this.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(this.dom.wrapper);

        thisBooking.dom.wrapper.addEventListener('updated', function (){
            console.log('updated');
            thisBooking.updateDOM();
        });

    }


    initTables() {
        const thisBooking = this
        const tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables)

        tables.forEach((table) => {
            table.addEventListener('click', function () {
                if (!table.classList.contains(classNames.booking.tableBooked)) {
                    thisBooking.selectTable(table)
                }
            })
        })
    }

    selectTable(table) {
        const thisBooking = this

        if (thisBooking.selectedTable) {
            thisBooking.selectedTable.classList.remove(classNames.booking.tableSelected)
        }

        if(!thisBooking.selectedTable || thisBooking.selectedTable != table){
            thisBooking.selectedTable = table;
            thisBooking.selectedTable.classList.add(classNames.booking.tableSelected)
        } else {
            thisBooking.selectedTable = null;
        }

    }

    sendBooking() {
        const thisBooking = this

        if (!thisBooking.selectedTable) {
            alert("Viberi stol")
            return
        }

        const bookingData = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: thisBooking.selectedTable.getAttribute("data-table"),
            duration: thisBooking.hoursAmountWidget.value,
            ppl: thisBooking.peopleAmountWidget.value,
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,
        }

        fetch("http://localhost:3131/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookingData)
        })
    }

    initActions() {
        const thisBooking = this

        thisBooking.dom.form.addEventListener("submit", function (event) {
            event.preventDefault()
            thisBooking.sendBooking()
        });
    }
}

export default Booking;