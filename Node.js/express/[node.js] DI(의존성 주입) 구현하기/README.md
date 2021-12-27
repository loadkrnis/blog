![thumbnail](./1.png)

## DI (Dependency Injection)

의존성 주입(DI)는 잘 알려진 기술이다. IoC 컨테이너를 이용한 DI는 여러 모듈의 확장성과 독립성에 큰 도움을 준다. 특히 Spring에서 Java Bean을 이용하여 DI를 구현하는 것이 국내에서 가장 유명하다고 생각한다. 하지만 Node.js에서 DI는 그렇게 활발하게 쓰이고 있지 않는 것 같다. 왜냐하면 `require`로 모듈을 바로 불러오면 되기 때문에 굳이 필요성을 못 느끼기 때문이다. 하지만 이번에 공부를 하면서 node에서도 DI를 해야 하는 이유를 알게 되어서 예제 코드와 함께 설명하고자 한다.

## DI와 테스트 코드

의존성 주입은 하나의 패턴이다. 만약 의존되는 클래스를 매개변수로 전달해준다면, 모듈 안에서 클래스를 불러오거나 새로 만드는 것을 피할 수 있다. 아래 코드는 간단한 service 모듈이다.

```
//users-service.js
const User = require('./User');
const UsersRepository = require('./users-repository');

async function getUsers() {
  return UsersRepository.findAll();
}

async function addUser(userData) {
  const user = new User(userData);

  return UsersRepository.addUser(user);
}

module.exports = {
  getUsers,
  addUser
}
```

괜찮아 보이지만 `user-service.js` 는 비즈니스 로직을 책임지고 있고, `user-repository` 는 데이터들에 대해 책임지고 있다. 하지만 위 코드에서는 두 가지의 문제점이 있다.

1\. service 가 특정 repository 와 연결돼있다는 것. 만약 코드를 다른 repository로 바꾸고 싶다면, 위의 코드를 싹 다 바꿔야 할 것이다. 싹 다 바꾼다 라는 것은 확장성이 떨어진다는 것을 의미한다.

2\. 테스트 코드의 작성이 힘들다. getUser 메소드가 잘 작동하는지 확인하려면, 테스트 라이브러리 jest를 사용한다 했을 때 usersRepository에 Mocking 된 객체를 만들어줘야 한다. 하지만 기왕이면 외부 라이브러리를 사용하지 않는 것이 훨씬 좋은 테스트 방식이지 않을까?

아래는 기존에 작성한 테스트 코드이다.

```
const UsersRepository = require('./users-repository');
const UsersService = require('./users');
const sinon = require('sinon') ;
const assert = require('assert');

describe('Users service', () => {
  it('gets users', async () => {
    const users = [{
      id: 1,
      firstname: 'Joe',
      lastname: 'Doe'
    }];

    sinon.stub(UsersRepository, 'findAll', () => {
      return Promise.resolve(users)
    });

    assert.deepEqual(await UsersService.getUsers(), users);
  });
});
```

확실히 테스트 코드가 복잡하다. DI를 이용하여 위 코드를 고쳐보겠다. 해야 할 것은 오로지 usersRepository를 매개변수로 넘겨주는 게 끝이다.

```
const User = require('./User');

function UsersService(usersRepository) { // 매개 변수로 넘긴다.
  async function getUsers() {
    return usersRepository.findAll();
  }

  async function addUser(userData) {
    const user = new User(userData);

    return usersRepository.addUser(user);
  }

  return {
    getUsers,
    addUser
  };
}

module.exports = UsersService
```

이제 `UserService` 는 `repository` 와 결합되어 있지 않은 상태이다. 물론 `userRepository` 를 매개변수로 전달받아야만 실행할 수 있다. 이렇게 변경된 코드는 테스트에 큰 영향을 미치게 된다. 아래는 새로운 테스트 코드이다.

```
const UsersService = require('./users');
const assert = require('assert');

describe('Users service', () => {
  it('gets users', async () => {
    const users = [{
      id: 1,
      firstname: 'Joe',
      lastname: 'Doe'
    }];

    const usersRepository = {
      findAll: async () => {
        return users
      }
    };

    const usersService = new UsersService(usersRepository);

    assert.deepEqual(await usersService.getUsers(), users);
  });
});
```

위 코드를 보면 `Mocking` 없이 `userRepository` 를 이용했다. 굳이 복잡하게 외부 라이브러리를 쓸 필요가 없어졌다. 그리고 한 가지 더 이점이 생기게 되었다. `service` 와 `repository` 를 `약결합` 하게 되면서 원하는 repository로 언제든지 편하게 바꿀 수 있게 되었다.

## function vs class

의존성 주입이 특히 Node.js에서 유명하지 않은 또 다른 이유가 있다. 의존성 주입을 OOP(객체지향프로그래밍)만을 위한 컨셉이라고 생각하는 경향 때문이다. 클래스에는 생성자(constructor)가 있기 때문에 의존성 주입을 진행하는 것은 아주 명확하고 쉽다. 하지만 Node.js는 class를 지원하지만 정적 타입 언어가 아니기 때문에 의존성을 주입할 때 의존성들을 하나씩 인자로 전달하는 것보다 객체로 감싸서 한 번에 주는 것이 더 좋다. 아래 코드를 보자

```
class UsersService {
  constructor({ usersRepository, mailer, logger }) {
    this.usersRepository = usersRepository;
    this.mailer = mailer;
    this.logger = logger;
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async addUser(user) {
    await this.usersRepository.addUser(user);
    this.logger.info(`User created: ${user}`);
    await this.mailer.sendConfirmationLink(user);
    this.logger.info(`Confirmation link sent: ${user}`);
  }
}

module.exports = UsersService;

const usersService = new UsersService({
  usersRepository,
  mailer,
  logger
});
```

우리가 원하는 의존성을 선택, 주입하기 훨씬 쉬워졌다. 그리고 `Typescript` 를 사용한다면 더 편해진다. 아래 코드를 보자.

```
type UsersDependencies = {            // 여기에 모든 의존성을 작성한다.
  usersRepository: UserRepository
  mailer: Mailer
  logger: Logger
};

export class UserService {
  constructor( private dependencies: UsersDependenceis    ) { }     // 훨씬 보기 좋아보인다.

  async findAll() {
    return this.dependencies.usersRepository.findAll();
  }

  async addUser(user) {
    await this.dependencies.usersRepository.addUser(user);        // 더 쉬운 의존성 접근
    this.dependencies.logger.info(`User created: ${user}`);
    await this.dependencies.mailer.sendConfirmationLink(user);    // 더 쉬운 의존성 접근
    this.dependencies.logger.info(`Confirmation link sent: ${user}`);
  }
}

const usersService = new UserService({
  usersRepository,
  mailer,
  logger
});
```

지금까지는 class에 관해서만 살펴봤다. 이제 function에 관해서 파악해보자. 사실 function이라고 해서 특별한 것은 없다. parameter로 의존성을 주입한다. 그게 끝이다. JavaScript의 `closure`덕분에 function내에서 `this` 없이 의존성에 편히 접근할 수 있다.

```
type UsersDependencies = {
  usersRepository: UsersRepository
  mailer: Mailer
  logger: Logger
};

export const usersService = (dependencies: UsersDependencies) => {
  const findAll = () => dependencies.usersRepository.findAll();
  const addUser = user => {
    await dependencies.usersRepository.addUser(user)
    dependencies.logger.info(`User created: ${user}`)
    await dependencies.mailer.sendConfirmationLink(user)
    dependencies.logger.info(`Confirmation link sent: ${user}`)
  };

  return {
    findAll,
    addUser
  };
}

const service = usersService({
  usersRepository,
  mailer,
  logger
});
```

위 코드들 같이 DI는 Class만을 위한 것은 아니다.

## IoC 컨테이너 활용

의존성 주입(DI)의 눈에 띄는 단점은 이용하려는 의존성들을 모두 미리 세팅해야 한다는 것이다. 아래 코드의 예시를 봐보자. 만약에 `users service`를 만들고 싶다면, 미리 `repository`도 만들어놔야 하고, `mailer`도 디테일하게 세팅해둬야 하고 `logger`도 가져오든 세팅하든 다 해놔야 한다. 이용할 모든 의존성을 구조화해둬야 한다는 말이다.

```
const UsersRepository = require('./users-repository');
const Mailer = require('./mailer');
const Logger = require('./logger');
const UsersService = require('./users-service');
const InMemoryDataSource = require('./users-repository/data-source/in-memory');

const logger = new Logger({
  level: process.env || 'dev'
});
const dataSource = new InMemoryDataSource();
const mailer = new Mailer({
  templates: '/emails',
  logger
});
const usersRepository = new UsersRepository({
  logger,
  dataSource
});

const usersService = new UsersService({
  usersRepository,
  mailer,
  logger
});

module.exports = {
  usersService
}
```

usersService를 생성하기 전에 미리 의존성들을 준비해둬야 한다. 의존성들을 모아두는 곳을 흔히 `container`라고 부른다. 그 container를 세팅하는 게 여간 귀찮은 게 아니다. 허나 신경 쓰지 않아도 된다. 알아서 의존성을 찾고 가져와주는 IoC 컨테이너 라이브러리들이 여럿 존재한다.

대표적으로 `Awilix`와 `Inversify` 그리고 `TypeDI`.

`Awilix`와 `TypeDI`는 다소 비슷하고 JavaScript와 TypeScript에서 모두 작동한다.  
반면에 `Inversify`는 TypeScript에서만 작동한다.

`Awilix`를 사용하면 자체적으로 종속성을 해결하는 특수 컨테이너를 만들 수 있다. 우리가 해야 할 일은 Type 설정만 제공해주면 된다. (예를 들면 UsersService가 class이다 라는 것만 전달하면 됨.)

```
const UsersRepository = require('./users-repository');
const Mailer = require('./mailer');
const Logger = require('./logger');
const UsersService = require('./users-service');
const InMemoryDataSource = require('./users-repository/data-source/in-memory');
const { createContainer, asClass } = require('awilix');

const createAppContainer = async () => {
  const container = createContainer();

  container.register({
    logger: asClass(Logger).inject(
      () => ({ level: process.env || 'dev'})
    ),
    dataSource: asClass(InMemoryDataSource),
    mailer: asClass(Mailer).inject(() => ({ templates: '/emails'})),
    usersRepository: asClass(UsersRepository),
    usersService: asClass(UsersService)
  });

  return container
);

(async () => {
  const container = await createAppContaier();

  const usersService = container.resolve('usersService');
})()
```

Awilix container에서 `resolve` method를 실행시키면 모든 생성자/함수의 인자들을 거쳐가면서 container에 설정되어있는 의존성들을 찾아낸다. 이렇게 하면 우리는 일일이 의존성을 만들어놓을 필요가 없어진다. 알아서 다 찾아서 설정해주기 때문이다. 우리가 할 일은 `resolve` 메서드만 실행시키면 된다.
