## mock은 stub과 다르다.

저는 테스트 코드를 작성시 mock과 stub의 차이를 생각하지 않고 써왔습니다.  
최근 마틴파울러의 블로그에서 [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html) 라는 글을 발견했습니다.

원문의 내용은 JAVA로 작성 되었지만, 본 포스팅에서는 **Typescript + jest**로 정리하며 작성해보겠습니다.

## Test Double

마틴파울러는 **Test Doble**을 테스트계의 스턴트맨이라고 소개합니다.  
스턴트맨은 배우 대신 위험을 무릅쓰고 대역을 합니다. 테스트 코드에서 대역을 쓰는 것에 착안하여 이름을 이렇게 지었고,  
영화를 찍기 위해 위험한 액션을 대신 해주는 것이 스턴트맨이라면  
테스트를 통과하기 위해 액션을 대신 해주는 것이 **Test Double**입니다.

![1](./1.gif)

즉, 테스트를 목적으로 실제 대신 사용되는 모든 종류의 가상 객체에 대해 **Test Double**이라는 용어를 사용합니다.

#### 더미 객체 (Dummy Object)

Dummy Object는 전달되지만 실제로는 사용되지 않습니다.  
일반적으로 파라미터를 전달하기 위한 용도로만 사용됩니다.

#### 가짜 객체 (Fake Object)

Fake Object는 실제로 동작하는 객체를 의미합니다.  
실제 프로덕션 환경에 적합하지 않지만 지름길의 역할을 합니다.  
(인메모리 데이터베이스가 좋은 예시입니다.)

#### 스텁 (Stub)

Stub은 테스트 중 호출된 경우에 대해 미리 만들어진 결과물을 응답하게 합니다.  
보통 테스트를 위해 만들어지며 테스트 이외에 사용되지 않습니다.

#### 스파이 (Spy)

Spy는 그들이 어떻게 호출되었는지에 따라 일부 정보를 기록하는 스텁입니다.  
주로 어떤 동작이 이루어졌는지 검증하는 용도로 사용됩니다.

#### 모의 (Mock)

Mock은 호출했을 때 사전에 정의된 명세대로의 결과를 돌려주도록 미리 프로그래밍되어있습니다.   
예상치 못한 호출이 있을 경우 예외를 던질 수 있으며, 모든 호출이 예상된 것이었는지 확인할 수 있습니다.

이렇게 많은 종류의 Test Double이 있습니다.**  
우리가 주의 깊게 봐야 할 점은 Test Double 중 Mock만 행동(올바른 호출을 했는지)을 검증합니다.**  
보통 다른 Test Double들은 일반적으로 상태(최종 결과물)를 검증을 위해 사용합니다.

## 예제

앞서 소개해드린 다섯 가지의 Test Double 중  
Stub, Spy, Mock 세 가지를 설명할 수 있는 예제를 보겠습니다.  
이 예제는 위에서 언급한 마틴 파울러 블로그를 일부 참고하였습니다.

#### MailService.ts

```
class MailService {
  send(message: string): void {
    // 메일 전송 로직
    console.log(message);
  }
}
```

#### Order.ts

```
class Order {
  private readonly name: string;
  private readonly price: number;
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
```

**Order**는 상품의 이름과 가격을 가지고 생성됩니다.  
만약 Order가 확인(confirm) 된다면, 구매자에게 주문의 정보가 메일로 발송되는 코드입니다.  
이제 위 예제를 테스트하며 몇 가지 Test Doble의 차이점을 비교해보겠습니다.

## Mock vs Stub

두 가지 테스트 방식으로 'Order가 confirm 될 경우 메일을 발송한다.'를 테스트해보겠습니다.

Stub

```
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
```

```
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
```

Mock

```
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
```

두 가지의 경우 모두 실제 mailService를 사용하지 않고, Test Double을 사용하고 있습니다.  
Stub은 상태 검증 (최종 결과)  
Mock은 행동 검증 (올바른 호출)

Stub을 이용한 테스트를 수행하기 위해 추가적인 메소드를 선언해야 합니다.  
위에서는 **numberSent** 라는 메소드를 추가적으로 선언했습니다.

사실 두 가지의 테스트는 검증하고자 하는 것이 정확히 일치합니다.  
다만, 방식이 다를 뿐입니다.

마틴 파울러의 포스팅에서는  
Stub을 사용하는 테스트 방식을 **classic**이라 하고,  
Mock을 사용하는 테스트 방식을 **Mockist**라고 칭합니다.

둘 중 어떤 방식의 테스트를 해야 할지는 context를 고려하라고 조언했습니다.  
만약 Test Double이 필요 없는 심플한 테스트는 실제 객체를 사용하여 상태를 검증하는 방식도 있다고 첨언했습니다.  
그리고 어떤 Test Double을 사용하는지는 중요하지 않고,  
각각 상황에서 가장 쉬운 방식을 선택하는 것을 추천했습니다.

## Mock vs Spy

Test Double의 종류를 정리하던 중 Mock과 Spy의 차이점이 모호하여 따로 정리해보겠습니다.  
우리가 아는 스파이는 어딘가 몰래 잠입하여, 무엇인가를 훔쳐봅니다.  
때로는 미션을 수행하기도 합니다.

**mock과 spy의 차이점은 실제 메소드가 수행되는지에 따라 나뉘게 됩니다.**  
아주 간단한 예시로 알아보겠습니다.

```
class Car {
  drive() {
    console.log('부릉');
    return '부릉';
  }
}
```

Mock은 실제 내부 구현체가 수행되지 않습니다.

```
it('mock', async () => {
  // given
  const car = new Car();
  car.drive = jest.fn().mockImplementationOnce(() => {
    console.log('hello');
    return 'hello';
  });

  // when
  const result = car.drive();

  // then
  expect(result).toBe('hello');
});
```

결과물이 '부릉'으로 나왔어야 했는데, Mock을 해버리자 내부 구현체가 아예 바뀌어 버렸습니다.  
  

Spy는 실제 내부 구현체가 수행됩니다.

```
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
```

하지만 몇 번 호출이 되었는지, 어떤 인자를 받았는지 검증할 수 있습니다.

## 마치며

TDD에 대한 관심이 많아지면서, 많은 Test Double을 접하게 되었습니다.  
하지만 이에 대한 정확한 차이점을 모르고 사용하였는데, 이번 기회에 정리하게 되어 너무 좋습니다.  
이 포스팅이 Test Double 간의 정확한 차이점을 알고,  
최적의 절충안을 찾는 것에 도움이 되었으면 좋겠습니다.
