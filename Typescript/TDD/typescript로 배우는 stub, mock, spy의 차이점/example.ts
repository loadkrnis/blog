class MailService {
  send(message: string): void {
    // 메일 전송 로직
    console.log(message);
  }
}

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

class MailServiceStub extends MailService {
  messages: Array<string>;

  constructor() {
    super();
    this.messages = new Array<string>();
  }

  override send(message: string) {
    this.messages.push(message);
  }

  numberSent(): number {
    return this.messages.length;
  }
}

describe('Order (stub)', function () {
  it('confirm 했을 때 메일을 발송한다.', function () {
    // given
    const order = new Order('name', 15000);
    const mailService = new MailServiceStub();
    order.setMailer(mailService);

    // when
    order.confirm();

    // then
    expect(mailService.numberSent()).toBe(1);
  });
});

describe('Order (mock)', function () {
  beforeEach(() => jest.clearAllMocks());

  it('confirm 했을 때 메일을 발송한다.', function () {
    // given
    const mailService = new MailService();
    mailService.send = jest.fn();
    const mailServiceSend = mailService.send;
    const order = new Order('name', 15000);
    order.setMailer(mailService);

    // when
    order.confirm();

    // then
    expect(mailServiceSend).toBeCalledTimes(1);
  });
});

describe('Order (spy)', function () {
  beforeEach(() => jest.clearAllMocks());

  it('confirm 했을 때 메일을 발송한다.', function () {
    // given
    const mailService = new MailService();
    const spyMailService = jest.spyOn(mailService, 'send');
    const order = new Order('name', 15000);
    order.setMailer(mailService);

    // when
    order.confirm();

    // then
    expect(spyMailService).toBeCalledTimes(1);
  });
});

class Car {
  drive() {
    console.log('부릉');
    return '부릉';
  }
}

it('spy', async () => {
  // given
  const car = new Car();
  const spyCar = jest.spyOn(car, 'drive');

  // when
  const result = car.drive();

  // then
  expect(result).toBe('부릉');
  expect(spyCar).toBeCalledTimes(1);
});
