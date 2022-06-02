import { assert } from "common_js_builtin/dist/utils/assert";
import { is } from "common_js_builtin/dist/utils/typeInferernce";
import CryptoJS from "crypto-js";

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
    fontSize?: string | none;
    fillStyle?: string | none;
    textAlign?: CanvasTextAlign | none;
    textBaseline?: CanvasTextBaseline | none;
  };
}

function _setCanvas($el: Element, options: CaptchaOptions){
  // const lastChild = $el.children[$el.children.length -1];
  // if (lastChild.constructor.name == "HTMLCanvasElement")
  //   $el.removeChild(lastChild);
  const child: HTMLElement = document.createElement("section");
  child.innerHTML = `<canvas 
      class="${options.canvasClass}"
      width="${options.canvasStyle.width}" 
      height="${options.canvasStyle.height}">
    </canvas>`;
  $el.innerHTML = "";
  $el.appendChild(child.children[0]);
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

const SOLID = "POSITIVE_NEGATIVE";

export
const enc = (text:string) => {
  return CryptoJS.AES.encrypt(text, SOLID).toString();
};

export
const dec = (ciphertext:string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SOLID);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    throw e;
  }
};

function transformFont(font: string, fontSize: string){
  return `${fontSize} ${font}`;
}
export
class Captcha{
  $el?: Element | none;
  $captchaEl?: HTMLCanvasElement | none;
  $captchaTextContext?: CanvasRenderingContext2D | none;
  currentRetries: number = 0;

  constructor(public options: CaptchaOptions = defaultOption) {
    this.options = Object.assign(defaultOption, options);
    this.options.canvasStyle.font = transformFont(this.options.canvasStyle.font!, this.options.canvasStyle.fontSize!);

    document.querySelector(this.options.el!);
    this.$el = document.querySelector(this.options.el!);
    assert(is.not.empty(this.$el), `unexpect null dom, selector: ${this.options.el}`);
    this.options.beforeGenerateCaptcha(this);
    this.setCaptcha(false);
  }

  clearText(){
    this.$captchaTextContext!.clearRect(0, 0, this.options.canvasStyle.width, this.options.canvasStyle.height);
  }

  fillText(text: string, x?:number, y?:number){
    x ??= this.$captchaEl!.clientWidth! / 2 - 20;
    y ??= this.$captchaEl!.clientHeight! / 2;
    this.$captchaTextContext!.fillText(text, x, y);
    this.$captchaTextContext!.font = ""
    this.$captchaTextContext!.textAlign = this.options.canvasStyle.textAlign!;
    this.$captchaTextContext!.textBaseline = this.options.canvasStyle.textBaseline!
  }

  resize(width: number, height: number){
    this.options.canvasStyle.width = width
    this.options.canvasStyle.height = height
    this.setCaptcha(true);
  }

  setCaptcha(shouldReset: boolean) {
    const $el = this.$el!;
    const options = this.options;
    if (!shouldReset) {
      _setCanvas($el, options);

      this.$captchaEl = $el.querySelector(`.${options.canvasClass}`) as HTMLCanvasElement;
      this.$captchaTextContext = this.$captchaEl.getContext('2d');
      this.$captchaTextContext = Object.assign(this.$captchaTextContext, options.canvasStyle);
    }
    this.options.onRenderCaptcha(this);
  }

  validate() {
    this.currentRetries++;
    console.log(1);
    if (this.options.numbersOfTries < this.currentRetries){

      console.log(2);
      if(this.options.onMaxRetries(this)){
        this.currentRetries = 0;
        this.reset();
        return;
      }else{
      }
    }
    console.log(3);
    if (this.options.onValidate(this)) {
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

