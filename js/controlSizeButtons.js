class SizeButtonsController {
    disableButtonsFunction = () => null;

    buttons = [];

    highLightSizeButton(size) {
      this.disableButtonsFunction();
      const b = this.buttons.find((v) => v.id === `size-${size}`);
      b.classList.add('tool-btn-chosen');
    }
}

const sizeButtonController = new SizeButtonsController();
export default sizeButtonController;
