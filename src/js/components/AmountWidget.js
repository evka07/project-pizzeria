import {select, settings} from "../settings.js";

class AmountWidget {
    constructor(element) {
        const thisWidget = this;

        thisWidget.getElements(element);
        thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
        thisWidget.initActions();
    }

    getElements(element) {
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = element;
        thisWidget.dom.input = element.querySelector(select.widgets.amount.input);
        thisWidget.dom.linkDecrease = element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.dom.linkIncrease = element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
        const thisWidget = this;

        const newValue = parseInt(value);

        if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
            thisWidget.value = newValue;
            thisWidget.dom.input.value = newValue;
            thisWidget.announce();
        }
    }

    initActions() {
        const thisWidget = this;

        thisWidget.dom.input.addEventListener('change', function () {
            thisWidget.setValue(thisWidget.dom.input.value);
        });

        thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value - 1);
        });

        thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value + 1);
        });
    }

    announce() {
        const thisWidget = this;

        const event = new Event('updated');
        thisWidget.dom.input.dispatchEvent(event);
    }
}

export default AmountWidget;

