import {select, templates, settings} from "../settings.js";
import AmountWidget from "./AmountWidget.js";
// import datePicker from "./DatePicker";
// import DatePicker from "./DatePicker.js";
// import HourPicker from "./HourPicker.js";
// import booking from "../../../dist/js/components/Booking.js";



class Booking{
    constructor(element) {
        this.render(element);
        this.initWidgets();
        this.initFlatpickr()
        this.initRangeSlider()
    }

//  class Booking{
//         constructor(wrapper) {
//             const thisBooking = this;
//
//             thisBooking.render(wrapper);
//             thisBooking.initWidgets;
//             thisBooking.getData();
//         }
// } module 11.2

    // render(wrapper){
    //
    // }

    // getData(){
    //     const thisBooking = this;
    //
    //     const params {
    //         booking: [
    //
    //         ],
    //         eventsCurrent: [
    //
    //         ],
    //
    //         eventsRepeat: [
    //
    //         ]
    //     }
    //
    //     const urls = {
    //         booking:        settings.db.url + '/' + settings.db.booking + '?' +,
    //         eventsCurrent:  settings.db.url + '/' + settings.db.event   + '?' +,
    //         eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' +,
    //     };
    //
    // } module 11.2

    render(element) {
        const thisBooking = this
        const generateHTML = templates.bookingWidget()
        this.dom = {}
        this.dom.wrapper = element
        this.dom.wrapper.innerHTML = generateHTML
        this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount)
        this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount)
        this.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper)
        this.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper)
    }

    initWidgets(){
        const thisBooking = this
        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount)
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount)
    }
    initFlatpickr() {
        const dateInput = this.dom.datePicker.querySelector(select.widgets.datePicker.input)

        flatpickr(dateInput, {
            enableTime: false,
            dateFormat: 'Y-m-d',
            minDate: 'today',
            maxDate: new Date().fp_incr(14)
        })
    }
    // initRangeSlider() {
    //     const thisBooking = this;
    //
    //     const sliderElement = thisBooking.dom.wrapper.querySelector(
    //         select.widgets.hourPicker.input
    //     );
    //     const selectedHourElement = thisBooking.dom.wrapper.querySelector(
    //         ".selected-hour"
    //     );
    //
    //     sliderElement.addEventListener("input", function () {
    //         const selectedHour = parseFloat(this.value);
    //         selectedHourElement.textContent = thisBooking.formatHour(selectedHour);
    //     });
    // }
    //
    // formatHour(hour) {
    //     const isAM = hour < 12;
    //     const meridiem = isAM ? "AM" : "PM";
    //     const formattedHour = hour % 12 || 12;
    //
    //     return `${formattedHour.toFixed(1)} ${meridiem}`;
    // }

    initRangeSlider() {
        const thisBooking = this

        const sliderElement = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.input)

        const minHours = settings.hours.open
        const maxHours = settings.hours.close

        noUiSlider.create(sliderElement, {
            start: [minHours, maxHours],
            step: 0.5,
            range: {
                'min': minHours,
                'max': maxHours
            },
            format: {
                to: function (value) {
                    return value.toFixed(1)
                },
                from: function (value) {
                    return parseFloat(value)
                }
            }
        })

        sliderElement.noUiSlider.on("update", function (values, handle) {
            if (handle === 0) {
                thisBooking.hoursAmountWidget.setValue(values[0])
            } else {
                thisBooking.hoursAmountWidget.setValue(values[1])
            }
        })
    }
}

export default Booking;