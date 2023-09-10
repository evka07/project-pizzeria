
class BaseWidget{
    constructor(wrapperElement, initialValue) {
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.value = initialValue;
    }
    setValue(value) {
        const thisWidget = this;

        const newValue = thisWidget.parseInt(value);

        if (thisWidget.isValid(newValue)) {
            thisWidget.value = newValue;
            thisWidget.renderValue();
            thisWidget.announce();

        }
    }

    parseValue(value){
        return parseInt(value);
    }

    isValid(value){
        return !isNaN(value)
    }

    renderValue(){
        const thisWidget = this;
        thisWidget.dom.wrapper.innerHTML = newValue;
    }

    announce() {
        const thisWidget = this;

        const event = new Event('updated');
        thisWidget.dom.input.dispatchEvent(event);
    }
}
export default BaseWidget