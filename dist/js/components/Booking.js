import { select, templates, settings } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element) {
        this.render(element);
        this.initWidgets();
        this.initFlatpickr();
        this.initRangeSlider();
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
}

export default Booking;
