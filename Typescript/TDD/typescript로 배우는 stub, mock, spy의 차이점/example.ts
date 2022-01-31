class Order {
  readonly name: string;
  readonly price: number;
  mailer: MailService;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }

  setMailer(mailer: MailService) {
    this.mailer = mailer;
  }

  confirm() {
    this.mailer.send(`상품 이름:${this.name} 상품 가격:${this.price}`);
  }
}

class MailService {
  send(message: string): void {
    // 메일 전송 로직
    console.log(message);
  }

  numberSent(): number {
    // DB에서 메일 전송한 횟수 불러오는 로직
    const result = 10;

    return result;
  }
}

class MailServiceStub extends MailService {
  readonly messages: Array<string>;

  constructor() {
    super();
    this.messages = new Array<string>();
  }

  override send(message: string) {
    this.messages.push(message);
  }

  override numberSent(): number {
    return this.messages.length;
  }
}

describe('Order', function () {
  // confirm 했을 때 메일을 발송한다.
  // confirm 했을 때 메일을 발송한다.
});
