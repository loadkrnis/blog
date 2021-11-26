객체지향에서 대표적인 원칙이라고 할 수 있는 `SOLID 원칙`에 대해서 알아보고자 합니다. 설계가 올바르게 되었는지를 확인하는 하나의 기준과 가이드라인으로써 신뢰받고 있는 원칙에 대해 학습하여 제가 하고있는 프로젝트의 설계를 점검하고 재설계하는 과정에서 도움이 되기를 기대합니다.

`SOLID` 는 아래의 5가지 원칙으로 만들어진 단어입니다.

- **S**RP (Single segregation principle) 단일 책임 원칙
- **O**CP (Open/closed principle) 개방-폐쇄 원칙
- **L**SP (Liskov substitution principle) 리스코프 치환 원칙
- **I**SP (Interface segregation principle) 인터페이스 분리 원칙
- **D**IP (Dependency inversion principle) 의존관계 역전 원칙

### SRP - 단일 책임 원칙

`SRP`란 단일 책임 원칙을 의미로하며 말 그대로의 단 하나의 책임만을 가져야 한다는 것을 의미합니다. 여기서 말하는 책임의 기본 단위는 객체를 의미하며 하나의 객체가 하나의 책임을 가져야 한다는 의미입니다. 그렇다면 책임은 무엇일까요? 객체지향에 있어서 책임이란 하나의 객체가 **할 수 있는 것** 과 **해야 하는 것** 으로 나뉘어져 있습니다. 즉, 한 마디로 요약하자면 하나의 객체는 자신이 할 수 있는 것과 해야하는 것만 수행 할 수 있도록 설계되어야 한다는 법칙입니다.

그렇다면 왜 `SRP`를 지켜야하는지는 `응집도`와 `결합도`에 관련이 있습니다. 응집도란 한 프로그램이 얼마나 뭉쳐있는가를 나타내는 척도이며 결합도는 프로그램 구성 요소들 사이가 얼마나 의존적인지를 나타내는 척도입니다. 아래 예제를 보며 `SRP`가 필요한 이유에 대해 알아보겠습니다.  

```ts
class Student {
  getCourse(): Array<Course> {   }
  addCourse(): void {    }
  save(): void {   }
  load(): Array<Student> {    }
  printOnReportCard(): void {    }
  printOnAttendanceBook(): void {    }
}
```

위 예제에서 학생이라는 클래스는 수강과목을 조회하고, 추가하고, 데이터베이스에 저장하고, 수강중인 학생들을 불러오고 기록을 출력하는 책임을 담담하고 있습니다. 이렇게 하나의 클래스가 다양한 책임을 갖는 경우 `변경`이라는 관점에서 문제를 일으킵니다.

잘 설계된 프로그램은 새로운 요구사항이 있을 때 가능한 코드의 변경이 최소화가 되어야합니다. 하지만 위 `Student`클래스는 너무 많은 일을 수행하는 클래스이기 때문에 변화에 민감하게 대응해야하는 클래스가 됩니다.

뿐만 아니라 클래스 내부에서 서로 다른 역할을 수행하는 코드끼리 강하게 결합되는데 예를 들어 현재 수강과목을 조회하는 메소드(getCourse())와 데이터베이스에서 학생 정보를 가져오는 메소드(load())는 서로 연결될 확률이 높습니다. 이러한 코드끼리의 결합은 하나의 변화에 많은 변경사항을 발생시키고 관련된 모든 기능을 다시 테스트 해야하는 단점이 있습니다. 이는 결국 유지보수하기 어려운 대상이 됩니다. 따라서 각 객체는 하나의 책임만을 수행할 수 있도록 변경해야 합니다.

위의 문제를 요약하면 응집도는 낮고, 결합도는 높습니다. 따라서 위와 같은 클래스는 아래와 같이 수정하는 것이 좋습니다.

> 학생Class - 학생Repository
> 
> 성적표Class - 성적표Repository
> 
> 출석부Class - 출석부Repository
> 
> 비즈니스 로직을 담당하는 Service

이렇게 클래스를 쪼개어 관리하는 것이 변경에 유연하게 대처할 수 있는 설계라고 할 수 있습니다. 이렇게 단일 책임으로 적절하게 분리하게 되면 요구사항이 변동되어도 유연한 대처가 가능해집니다.  

AOP(Aspect Oriented Programming) 또한 SRP의 예제가 될 수 있습니다. 여러개의 클래스가 로깅이나 보안, 트랜잭션과 같은 부분은 공유하고 있을 수 있습니다. 이런 부분을 모듈화하여 각각 필요한 곳에 위빙해주기 위해 도입된 AOP 또한 로깅, 보안, 트랜잭션과 같은 부분을 하나의 모듈에 단일책임으로 부여하여 이를 사용하게 할 수 있도록 함으로써 SRP를 지키는 방법 중 하나입니다.

### OCP - 개방 폐쇄 원칙

`OCP`란 "확장에는 열려 있어야 하고, 변경에는 닫혀 있어야 한다."를 의미합니다. 즉 기존의 코드를 변경하지 않으면서 기능을 추가할 수 있도록 설계되어야 한다는 뜻입니다. `OCP`에서 중요한 것은 요구사항이 변경되었을 때 코드에서 **변경되어야 하는 부분과 변경되지 않아야하는 부분을 명확하게 구분**합니다. 또한 확장에 유연하게 반응하며 변경은 최소화가 되어야합니다. 아래 예제를 보며 `OCP`가 필요한 이유에 대해 알아보겠습니다.

```ts
class KakaoMessenger {
  boot(): void {
    console.log('Kakao Booting..');
  }
}

class Computer {
  boot(): void {
    console.log('Computer Booting..');
    const kakaoMessenger = new KakaoMessenger();
    kakaoMessenger.boot();
  }
}

const computer = new Computer();
computer.boot();
```

위의 코드에서 컴퓨터를 실행하면 카카오 메신저가 함께 부팅되는 코드를 작성하였습니다. 하지만 카카오톡을 사용하지 않고 라인을 사용한다는 `변경사항`이 생기면 어떻게 될까요? 위의 코드에서 카카오를 새로 생성하는 것이 아니라 라인을 생성하고 라인에게 `boot`를 실행하라는 메세지를 보내야 할 것입니다. 

즉, 아래와 같이 수정해야 합니다.

```ts
class LineMessenger {
  boot(): void {
    console.log('Line Booting..');
  }
}

class Computer {
  private line: LineMessenger;
  
  boot(): void {
    console.log('Computer Booting..');
    const lineMessenger = new LineMessenger();
    lineMessenger.boot();
  }
}

const computer = new Computer();
computer.boot();
```

이렇게 모든 클래스를 전부 다 수정하게 되었습니다. 즉, 외부의 변경사항에 의해서 내부의 `Production Code`에 변경사항이 발생하고, 모든 클래스의 메소드를 확인해가며 전부 수정해야합니다.

이러한 문제를 해경하기 위해서는 아래와 같이 추상화를 통해 메신저를 분리하는 것이 좋습니다.

```ts
class Messenger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  boot(): void {
    console.log(`${this.name} Booting..`);
  }
}

class LineMessenger extends Messenger {
  constructor() {
    super('Line');
  }
}

class Computer {
  private messenger: Messenger;

  boot(): void {
    console.log('Computer Booting..');
    this.messenger.boot();
  }

  setMessenger(messenger: Messenger): void {
    this.messenger = messenger;
  }
}

const computer = new Computer();
computer.setMessenger(new LineMessenger());
computer.boot();
// Computer Booting..
// Line Booting..
```

이렇게 작성하는 경우 어떠한 메신저로 변경되어도 하나의 클래스만 추가함으로써 외부의 변경에 유연하게 대응할 수 있습니다. 그리고 내부적으로 `Production Code`를 변경하지 않는 OCP원칙을 지키는 코드를 완성할 수 있습니다.

하지만 클래스를 추가하는 것 또한 결국 `Production Code`의 변경을 의미한다고 생각할 수 있습니다. 하지만 아래의 설명으로 답할 수 있습니다.
 - 위 코드에서 메신저가 어떤 메신저인지 판별하는 `if`문을 통해 해결할 수도 있습니다. 하지만 이 방법은 기존 코드의 전체 작동방식을 이해하고 있어야합니다. 즉 `Computer`와 `Messenger` 클래스의 내부 구현사항을 전부 명확히 알고있어야 메신저 변경 작업이 가능합니다.
 - 하나의 추상클래스로 분리하게 됨으로써 새로운 카카오톡 메신저를 추가해도 기존 `Computer`클래스의 수정없이 `KakaoMessenger` 클래스 하나만 추가한다면 내부 동작원리를 알지 못해도 메신저의 종류를 증가시킬 수 있습니다.
`OCP`의 관점은 클래스를 변경하지 않고도 대상 클래스의 환경을 변경할 수 있는 설계가 되어야합니다.

### LSP - 리스코프 치환 원칙

`LSP`란 일반화 관계에 대한 이야기이며 자식 클래스는 최소한 부모 클래스에서 행위를 수행할 수 있어야 한다는 의미입니다. 즉 `LSP`를 만족하면 프로그램에서 부모 클래스의 인스턴스 대신에 자식 클래스의 인스턴스로 대체해도 프로그램의 의미는 변화되지 않습니다. 이를 위해 부모 클래스와 자식 클래스의 행위는 일관되어야 합니다.

```ts
class Bag {
  private price: number;
  
  getPrice() {
    return this.price;
  }
  
  setPrice(price: number) {
    this.price = price;
  }
}

class DiscountedBag extends Bag {
  private discountRate: number;
  
  setDiscountRate(discountRate: number) {
    this.discountRate = discountRate;
  }
  
  applyDiscount(price: number) {
    super.setPrice( price - (this.discountRate * price));
  }
}
```

위와 같은 클래스들이 선언되어 있고 다른 로직에서 `Bag` 클래스를 사용하고 있는 부분을 `DiscountedBag` 클래스로 대체해도 `LSP`에 위반되지 않습니다. 부모의 기능을 오버라이딩하지 않고 그대로 사용하고 있기 때문에 일반화 관계가 성립되기 때문입니다. 하지만 `DiscountedBag` 클래스에는 `applyDiscount`의 기능을 가지고 있습니다. 이 기능을 사용하게 되면 부모와 자식은 대체관계가 성립하지 않습니다. 즉 자식클래스가 부모클래스를 오버라이딩하거나 추가적인 기능을 총해 부모의 상태를 변경시키는 것은 `LSP`원칙을 위반하는 것입니다.

정리하면 `LSP`는 서브 클래스가 슈퍼 클래스의 책임을 무시하거나 재정의하지 않고 확장만 수행한다는 것을 의미합니다. **부모가 수행하고 있는 책임을 그대로 수행하면서 추가적인 필드나 기능을 제공하려는 경우에만 상속을 하는 것이 바람직하며** 부모 클래스의 책임을 변화시키는 기능은 `LSP`법칙에 위배 된다고 볼 수 있습니다.

### ISP - 인터페이스 분리 원칙

`ISP`란 클라이언트에서는 클라이언트 자신이 이용하지 않는 기능에는 영향을 받지 않아야 하는 뜻을 의미합니다. 예를 들어 복합기를 이용하는 다양한 사람이 있습니다. 복사를 하고 싶은 사람, 팩스를 보내고 싶은 사람 등 복합기는 다양한 기능을 제공하지만 사용자가 필요한 기능만 수행해야 합니다. 즉 범용의 인터페이스를 만드는 것이 아닌 클라이언트에 특화된 인터페이스를 이용하는 설계 원칙입니다.

`ISP`와 `SRP`는 동일한 문제에 대해 다른 해결책을 제시하고 있습니다. 하나의 클래스가 기능이 비대하다면 책임을 분할하여 이를 갖게하는 것이 `SRP`이고 비대한 기능을 인터페이스로 분할하여 사용하는 것이 `ISP`를 의미합니다. 물론 책임을 적절히 분할하여 각각의 인터페이스를 사용한다면 둘 다 충족할 수 있지만 그렇지 않은 경우도 존재합니다.

예를 들어 게시판을 CRUD하는 클래스가 있을 때, 클라이언트에 따라서 게시판 CRUD 기능 중 일부분만 사용할 수 있고 관리자는 모든 기능을 사용할 수 있다고 가정하겠습니다. 이 경우 게시판은 관련된 책임을 수행하므로 `SRP`를 충족하지만 이 클래스의 모든 메소드가 들어 있는 인터페이스가 클라이언트와 관리자 모두가 사용한다면 `ISP`에는 위배됩니다. 이 경우 관리자용 인터페이스와 일반 인터페이스를 분리함으로써 `ISP` 위반 또한 함께 해결 할 수 있습니다.

### DIP - 의존 역전 원칙

객체지향 프로그래밍에서 객체는 서로 도움을 주고 받으며 의존 관계를 발생시킵니다. `DIP`란 의존 관계를 맺을 때 **변화하기 쉬운 것 또는 자주 변화하는 것보다는 변화하기 어려운 것, 거의 변화가 없는 것에 의존하라**는 가이드라인을 제공하는 원칙입니다.

그렇다면 `OCP`에서도 언급했던 변화하기 쉬운 것과 변화하지 않는 것은 무엇을 기준으로 구분하면 될까요?

정책이나 전략과 같은 어떤 큰 흐름이나 개념 같은 추상적인 것은 변하기 어려운 것에 해당하고 구체적인 방식, 사물 등과 같은 것은 변화가 잦은 것으로 구분하면 좋습니다. 

예를 들어 아이가 장난감을 가지고 논다. 라는 개념에서 아이와 장난감은 자주 변화되지 않는 개념적인 것이지만 장난감은 종류에 따라 다양해 질 수 있습니다. 따라서 장난감이라는 부분을 추상화하여 의존하는 것이 바람직합니다.

`DIP`를 만족하려면 어떤 클래스가 도움을 받을 때 혹은 의존할 때 구체적인 클래스는 변화할 확률이 높기 때문에 이를 추상화한 인터페이스나 추상 클래스와 의존관계를 맺도록 설계해야 합니다.

컴퓨터와 메신저의 예제에서도 단순히 하나의 메신저가 아닌 전체 메신저 인터페이스와 의존관계를 맺음으로써 `DIP` 원칙을 준수한 것 입니다. `DIP`를 만족하면 의존성 주입(DI)을 쉽게 적용할 수 있는 코드가 됩니다. 

```ts
abstract class Toy {
  abstract toString(): string;
}

class Kid {
  toy: Toy;
  
  setToy(toy: Toy): void {
    this.toy = toy;
  }
  
  play(): void {
    console.log(`play ${this.toy.toString()}`)
  }
}

class Lego extends Toy {
  toString(): string {
    return 'Lego';
  }
}

const kid = new Kid();

kid.setToy(new Lego());
kid.play(); // Lego
```
위와 같이 자주 변경될 수 있는 장난감은 `abstract class` 또는 `interface`를 통해 관리함으로써 변경사항에 대해 유연하게 대처할 수 있고 변화하는 부분을 추상화하여 변화되지 않는 형태로 만든 추상클래스를 의존하기 때문에 `DIP`원칙과 `OCP` 둘 다 만족하는 형태를 갖습니다.
