
type none = null | undefined;
type CaptchaCallback = (response: "success" | "error", captcha: Element, numberOfTries: number) => void;

export type CaptchaOptions = {
  el: string;
  canvasClass?: string | none;
  numbersOfTries: number;
  beforeGenerateCaptcha: (captcha: Captcha)=>void;
  onRenderCaptcha: (captcha: Captcha)=>void;
  onValidate: (c: Captcha)=>boolean;
  onValidateSuccess: (c: Captcha)=>void;
  onValidateError: (c: Captcha)=>void;
  onMaxRetries: (c: Captcha)=>boolean;

  canvasStyle: {
    width: number ;
    height: number ;
    font?: string | none;
    fillStyle?: string | none;
    textAlign?: string | none;
    textBaseline?: string | none;
  };
}

function _setCanvas($el: Element, options: CaptchaOptions){
  const child: HTMLCanvasElement = new HTMLCanvasElement();
  child.innerHTML = `<canvas 
        class="${options.canvasClass}"
        width="${options.canvasStyle.width}" 
        height="${options.canvasStyle.height}">
      </canvas>`;
  $el.innerHTML = '';
  $el.appendChild(child);
}

const defaultOption: CaptchaOptions = {
  el: '.jCaptcha',
  canvasClass: 'jCaptchaCanvas',
  beforeGenerateCaptcha: (c)=>null,
  onRenderCaptcha: (c)=>{
    const text: string = "captcha text";
    c.clearText();
    c.fillText(text);
  },
  onValidate: (c: Captcha)=>true,
  onMaxRetries: (c: Captcha)=>true,
  onValidateSuccess: (c: Captcha)=>null,
  onValidateError: (c: Captcha)=>null,
  numbersOfTries: 3,
  canvasStyle: {
    width: 100,
    height: 100,
  }
};

class Captcha{
  $el?: Element | none;
  $captchaEl?: HTMLCanvasElement | none;
  $captchaTextContext?: CanvasRenderingContext2D | none;
  currentRetries: number = 0;

  constructor(public options: CaptchaOptions = defaultOption) {
    this.options = Object.assign(options, defaultOption);
    document.querySelector(this.options.el!);
    this.$el = document.querySelector(this.options.el!);
    this.options.beforeGenerateCaptcha(this);
    this.setCaptcha(false);
  }

  clearText(){
    this.$captchaTextContext!.clearRect(0, 0, this.options.canvasStyle.width, this.options.canvasStyle.height);
  }

  fillText(text: string, {x, y} = {x:0, y:0}){
    this.$captchaTextContext!.fillText(text, x, y);
  }

  setCaptcha(shouldReset: boolean) {
    const $el = this.$el!;
    const options = this.options;
    if (!shouldReset) {
      _setCanvas($el, options);

      this.$captchaEl = document.querySelector(`.${options.canvasClass}`) as HTMLCanvasElement;
      this.$captchaTextContext = this.$captchaEl.getContext('2d');
      this.$captchaTextContext = Object.assign(this.$captchaTextContext, options.canvasStyle);
    }
    this.options.onRenderCaptcha(this);
  }

  validate() {
    this.currentRetries++;
    if (this.options.numbersOfTries < this.currentRetries){
      if(this.options.onMaxRetries(this)){
        this.currentRetries = 0;
        this.reset();
        return;
      }else{
      }
    }
    if (!this.options.onValidate(this)) {
      this.options.onValidateSuccess(this);
    } else {
      this.options.onValidateError(this);
    }
  }

  reset() {
    this.options.beforeGenerateCaptcha(this);
    this.setCaptcha(true);
  }
}


