사용자 인증/인가는 모든 웹 애플리케이션에서 가장 중요한 부분입니다.  
이전 포스트에서는 Node.js를 이용하여 JWT로그인을 구현하였는데요.

 [\[node.js\] JWT 구현 예제

Intro 웹 / 앱 개발을 하면 로그인 과정에서 반드시 만나게 되는 개념이 쿠키-세션이다. 최근 들어 IT 인프라 구성에는 많은 변화가 생겼다. 웹 기반의 서비스들은 웹과 앱을 함께 서비스하

charming-kyu.tistory.com](https://charming-kyu.tistory.com/4)

이번에는 NPM 라이브러리에서 가장 많이 사용되는 **Passport**를 이용하여 NestJS 애플리케이션에 로그인을 구현해보겠습니다.  
또한 **해싱(Hashing)**을 통해 사용자를 등록하고 비밀번호를 안전하게 암호화하여 보호하겠습니다.

## User Entity

인증을 고려할 때 가장 먼저 해야 할 일은 사용자 Entity를 정의하는 것입니다.

**users/user.entity.ts**

```
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  public password: string;
}

export default User;
```

email을 **unique**로 지정하여 동일한 이메일을 사용하는 두 명의 사용자가 존재하는 것을 방지합니다.   
이제 선언한 User 엔티티에 대해 몇 가지 작업을 수행하기 위해 **Service**를 생성하겠습니다.

**users/users.service.ts**

```
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
```

**users/dto/createUser.dto.ts**

```
export class CreateUserDto {
  email: string;
  name: string;
  password: string;
}
export default CreateUserDto;
```

**users/users.module.ts**

```
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## 비밀번호 암호화

사용자 회원가입에서 중요한 점은 비밀번호를 일반 텍스트로 저장하면 안된다는 것입니다.  
언제든지 데이터베이스가 공격받아 노출될 수 있습니다.

비밀번호를 더 안전하게 만들기 위해 암호를 **해싱**합니다.  
해싱 알고리즘은 단반향 암호화에 포함되는데요. 무조건 암호화만 수행할 수 있습니다.  
즉, 복호화는 불가능 하다는 것입니다.  
  
단방향 암호화의 자세한 내용은  
Django 단방향 암호화 패스워드 저장 방식을 Node.js를 이용하여 구현한 해당 글을 참조하시면 좋을 것 같습니다.

 [\[node.js\] crypto를 이용한 Django 패스워드 저장방식 PBKDF2 알고리즘 구현하기

구현하게 된 이유 현재 API서버는 Django로 만들어진 서버를 이용해 사용자의 아이디와 패드워드를 저장하고 있었다. 하지만 Django API서버의 기능 전부를 Node.js로 전환을 하고 있었다. 그러기 위해

charming-kyu.tistory.com](https://charming-kyu.tistory.com/10?category=993927)

### bcrypt

우리는 [bcrypt](https://www.npmjs.com/package/bcrypt) 에서 구현된 bcrypt 해싱 알고리즘을 사용합니다. 문자열을 해싱하고 솔트(salt)를 추가하는 작업을 처리합니다.

bcrypt를 사용하면 CPU에 집중적인 작업이 될 수 있습니다.  
다행히 bcrypt는 추가 스레드에서 실행할 수 있는 스레드 풀을 사용합니다.  
덕분에 우리 애플리케이션은 해싱을 하는 동안 다른 작업을 수행할 수 있습니다.

```
npm install @types/bcrypt bcrypt
```

bcrypt를 사용할 때 소금을 뿌릴 횟수를 정해야합니다.  
salt는 1씩 증가할 때마다 시간은 2배씩 증가합니다. 즉, 많이 뿌릴수록 비용으로 직결됩니다.  
그래서 저희 애플리케이션은 10번의 salt만 적용하겠습니다.

```
const passwordInPlaintext = '12345678';
const hash = await bcrypt.hash(passwordInPlaintext, 10);

const isPasswordMatching = await bcrypt.compare(
  passwordInPlaintext,
  hashedPassword,
);

console.log(isPasswordMatching); // true
```

## AuthenticationService

위의 모든 지식을 바탕으로 기본 등록 및 로그인 기능 구현을 시작할 수 있습니다.   
그러기 위해서는 먼저 Authentication Service를 정의해야 합니다.

**authentication/authentication.service.ts**

```
import { HttpException } from '@nestjs/common';

export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // (…)
}
```

> createdUser.password = undefined는 응답으로 암호를 보내지 않는 좋은 방법은 아닙니다.  
> 뒤에서 해당 로직을 깔끔하게 처리하게 도와주는 로직을 알아보겠습니다.

해시를 만들어 나머지 데이터와 함께 **usersService.create** 메서드에 전달합니다.   
실패할 수 있는 경우가 있기 때문에 여기 에서 try ... catch 문으로 묶었습니다.  
해당 이메일을 가진 사용자가 이미 존재하는 경우 **usersService.create** 메소드에서 오류가 발생합니다.  
고유한 열의 경우 Postgres에서 오류가 발생합니다.

[PostgreSQL 오류 코드 문서 페이지](https://www.postgresql.org/docs/9.2/errcodes-appendix.html)에서 **unique\_violation**의 코드는 **23505**입니다.  
깔끔하게 처리하기 위해 enum을 선언하겠습니다.

**database/postgresErrorCodes.enum.ts**

```
enum PostgresErrorCode {
  UniqueViolation = '23505'
}
```

> Service에서 이 이메일을 가진 사용자가 이미 존재한다고 명시하지만  
> 공격자가 등록된 이메일 목록을 얻기 위해 API를 무차별 대입할 수 있기 때문에  
> 그것을 방지하는 메커니즘을 구현하는 것이 좋습니다.

이제 로그인 구현만 남았습니다.

**authentication/authentication.service.ts**

```
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}
  // (…)
  public async getAuthenticatedUser(email: string, hashedPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      const isPasswordMatching = await bcrypt.compare(
        hashedPassword,
        user.password,
      );
      if (!isPasswordMatching) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      user.password = undefined;

      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
```

위의 중요한 점은 이메일이나 비밀번호가 틀리더라도 동일한 오류를 반환한다는 것입니다.   
그렇게 하면 데이터베이스에 등록된 이메일 목록을 가져오는 것을 목표로 하는 일부 공격을 방지할 수 있습니다.

위의 코드에 대해 개선하고 싶은 한 가지 작은 것이 있습니다.   
logIn 메서드 내에서 예외를 throw한 다음 로컬에서 catch합니다.  
혼란스럽게 여겨질 수 있습니다.  
비밀번호를 확인하는 별도의 방법을 만들어 보겠습니다.

```
public async getAuthenticatedUser(email: string, plainTextPassword: string) {
  try {
    const user = await this.usersService.getByEmail(email);
    await this.verifyPassword(plainTextPassword, user.password);
    user.password = undefined;
    return user;
  } catch (error) {
    throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
  }
}

private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
  const isPasswordMatching = await bcrypt.compare(
    plainTextPassword,
    hashedPassword
  );
  if (!isPasswordMatching) {
    throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
  }
}
```

## Passport

우리는 수동으로 전체 인증 프로세스를 처리했습니다.  
[NestJS 공식문서](https://docs.nestjs.com/techniques/authentication)는 Passport 라이브러리 사용을 제안하고 그렇게 하는 수단을 제공합니다.  
Passport는 인증에 대한 추상화를 제공하여 무거운 짐을 덜어줍니다.  
또한 많은 개발자에 의해 프로덕션 환경에서 사용되고 있습니다.