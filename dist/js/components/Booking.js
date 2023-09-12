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
        this.initFlatpickr();
        this.initRangeSlider();
        this.getData();
        this.initTables()
        this.initActions()

    }

//      class Booking{
//         constructor(wrapper) {
//             const thisBooking = this;
//
//             thisBooking.render(wrapper);
//             thisBooking.initWidgets;
//             thisBooking.getData();
//         }
// }
// module 11.2


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
            eventsCurrent:  settings.db.url + '/' + settings.db.event
                                            + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:   settings.db.url + '/' + settings.db.event
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
                // console.log(bookings);
                // console.log(eventsCurrent);
                // console.log(eventsRepeat);
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
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.date, item.hour, item.duration, item.table);
                }
            }
        }
        thisBooking.updateDOM();
    }

    updateDOM(){I
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

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
                    thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
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
    }

    initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

        thisBooking.datePickerWidget = new DatePicker(this.dom.datePicker);
        thisBooking.hourPickerWidget = new HourPicker(this.dom.wrapper);

        thisBooking.dom.wrapper.addEventListener('updated', function (){
            thisBooking.updateDOM();
        });
    }

    initFlatpickr() {
        const thisBooking = this;
        const dateInput = thisBooking.dom.datePicker.querySelector(select.widgets.datePicker.input);

        flatpickr(dateInput, {
            enableTime: false,
            dateFormat: "Y-m-d",
            minDate: "today",
            maxDate: new Date().fp_incr(14),
            onChange: function (selectedDates, dateStr) {

            },
        });
    }

    initRangeSlider() {
        const thisBooking = this;
        const sliderElement = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.input);
        const minHours = settings.hours.open;
        const maxHours = settings.hours.close;

        noUiSlider.create(sliderElement, {
            start: [minHours, maxHours],
            step: 0.5,
            range: {
                min: minHours,
                max: maxHours,
            },
            format: {
                to: function (value) {
                    return value.toFixed(1);
                },
                from: function (value) {
                    return parseFloat(value);
                },
            },
        });

        sliderElement.noUiSlider.on("update", function (values, handle) {
            if (handle === 0) {
                thisBooking.hoursAmountWidget.setValue(values[0]);
            } else {
                thisBooking.hoursAmountWidget.setValue(values[1]);
            }
        });

    }
    // initTables() {
    //     const thisBooking = this
    //     const tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables)
    //
    //     tables.forEach((table) => {
    //         table.addEventListener('click', function () {
    //             if (!table.classList.contains(classNames.booking.tableBooked)) {
    //                 thisBooking.selectTable(table)
    //             }
    //         })
    //     })
    // }
    //
    // selectTable(table) {
    //     const thisBooking = this
    //
    //     if (thisBooking.selectedTable) {
    //         thisBooking.selectedTable.classList.remove(classNames.booking.tableBooked)
    //     }
    //     thisBooking.selectedTable = table
    //     thisBooking.selectedTable.classList.add(classNames.booking.tableBooked)
    // }
    //
    // sendBooking() {
    //     const thisBooking = this
    //
    //     if (!thisBooking.selectedTable) {
    //         alert("Viberi stol")
    //         return
    //     }
    //     const bookingData = {
    //         date: thisBooking.datePickerWidget.value,
    //         hour: thisBooking.hourPickerWidget.value,
    //         table: thisBooking.selectedTable.getAttribute("data-table"),
    //         duration: thisBooking.hourPickerWidget.value,
    //         ppl: thisBooking.peopleAmountWidget.value,
    //         phone: thisBooking.dom.phone.value,
    //         address: thisBooking.dom.address.value,
    //     }
    //
    //     fetch("http://localhost:3131/bookings", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(bookingData)
    //     })
    //         .then((response => {
    //             if (response.status === 200) {
    //                 console.log("Good")
    //             } else  {
    //                 console.log("error bad")
    //             }
    //         })
    //             .catch((error) => {
    //                 console.error("Error", error)
    //             })
    //         )
    // }
    //
    // initActions() {
    //     const thisBooking = this
    //     const bookButton = thisBooking.dom.wrapper.querySelector(select.booking.bookTable)
    //
    //     bookButton.addEventListener("click", function (event) {
    //         event.preventDefault()
    //         thisBooking.sendBooking()
    //     })
    // }
}

export default Booking;
