import {select, templates} from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
    constructor(element) {
        this.render(element)
        this.initWidgets()
    }

    render(element) {
        const thisBooking = this
        const generateHTML = templates.bookingWidget()
        this.dom = {}
        this.dom.wrapper = element
        this.dom.wrapper.innerHTML = generateHTML
        this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount)
        this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount)
    }

    initWidgets(){
        const thisBooking = this
        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount)
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount)
    }
}

export default Booking