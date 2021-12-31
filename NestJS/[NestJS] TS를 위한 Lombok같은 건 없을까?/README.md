## 서론

최근 회사에서 NestJS로 개발하는 과정 중 Spring Boot와 비슷한 코드를 자주 보게됩니다.  
NestJS는 [공식문서](https://docs.nestjs.kr/) (최고) 이외에는 레퍼런스가 많이 없습니다.

물론 [Medium](https://medium.com/)을 유료 구독하여 주기적으로 글을 확인합니다.  
가끔 좋은 양질의 글이 나오긴 하지만,  
소수의 글만 설계적으로 좋은 내용이고 나머지는 너무 기초적인 글들이 많이 올라옵니다.  
그리고 대부분 영어로 된 글이 많기 때문에 한국어보다 읽는 속도가 조금 느립니다.

그래서 더 좋은 양질의 글을 보려면 문법이 비슷한 **Spring**으로 설명하는 글이나 코드를 보는게 좋습니다.  
"[자바 공화국](https://jojoldu.tistory.com/609)"이라는 말이 있듯이 역시 대한민국은 자바인가? 라는 생각을 하곤합니다.

하지만 단점만 존재하는 것은 아닙니다.

어떤 글을 작성하더라도Java 관련된 글은 이미 포화상태이기 때문에 오히려 제 글이 빛날 수 있습니다.

![1](./1.png)

제가 작성한 [NodeJS JWT 예제](https://charming-kyu.tistory.com/4)가 구글 검색시 상위권에 놓이게 된 것처럼  
조금만 노력한다면 NodeJS 관련된 내용은 상위권에 노출되게 됩니다.  
다시한번 말씀드리지만, JAVA 관련된 글은 모두 포화상태이기 때문에  
이런 결과를 만들기 쉽지 않을 것 같습니다.

## 본론

Nest와 Spring은 매우 비슷한 구조이고, Spring의 장점을 아주 잘 녹여준 덕에  
Java 코드를 보고 적용을 시키는 과정에서 여러움은 크게 없었으나 종종 불편함은 생길 때가 있습니다.

그 중에서 최근 겪었던 불편함은 **Lombok**때문에 TS에서 Lombok이 없나 찾아보다  
Stackoverflow에서 비슷한 질문 글을 발견했습니다.   
[Is there something like Lombok for TypeScript?](https://stackoverflow.com/questions/59136271/is-there-something-like-lombok-for-typescript)


질문의 답변을 요약하자면, TS에서도 tombok이라고 하는 lombok을 대신할 라이브러리가 있지만,  
거의 사용하지 않는 이유가 있다고 설명되어 있습니다.

```javascript
class A {
  constructor(private fieldA: string, private readonly fieldB = 0) {}
}
```

TS의 생성자는 class명이 아닌 것이 JAVA와는 다릅니다.  
게다가 TS는 실행 시 생성자와 함께 동적으로 인스턴스 필드에 값을 할당하게 되는데  
그 말은 즉슨, 저기 중괄호 안에는

```javascript
{
  this.fieldA = fieldA;
  this.fieldB = 0;
}
```

위와 같은 코드가 암시적으로 생략되었다는 것입니다.

TS는 메소드 오버로딩을 지원하지 않아서 생성자는 class당 하나만 만들 수 있습니다.  
그래서 이미 TS에서는 상용구를 줄이는 것에 있어서 Lombok으로 생성자를 주입하는 기능만큼이나  
**문법적으로 해결되었다고 볼 수 있습니다.**

또한 Lombok의 @Getter @Setter를 둘 다 사용하는 경우는 TS에서 일반적으로 클래스를 선언하는 것과 같습니다.  
하지만 외부에서 필드 값을 변경할 수 없게 막고, 에러를 컴파일 시점에 확인하기 위하여  
아래와 같이 @Getter만 선언하기도 합니다.

```java
@Getter
class Student {
  private String name;
  private Major major;
}
```

하지만 TS에서 필드를 **readonly**로 선언하는 것도똑같이 컴파일 시점에서 에러를 발생시킬 수 있습니다.

```javascript
class Student {
  private readonly name: string;
  private readonly major: Major;
}
```

따라서 이 경우에도 문법적으로 해결이 가능합니다.

## 정리

**Lombok이 Java에서 처리하는 문제들은 이미 TS에서 문법적으로 처리가 가능합니다.  
**그래서 TS에서 사용할 수 있는 tombok이라는 라이브러리는 사용되지 않습니다.

물론 lombok의 기능은 생성자 주입과 getter/setter를 제외하고도 굉장히 많은 기능들을 제공합니다.  
더 자세한 설명은 이 질문에 대한 [답변](https://stackoverflow.com/questions/59136271/is-there-something-like-lombok-for-typescript?answertab=active#tab-top)을 읽어 보시는 걸 추천드립니다.


[Is there something like Lombok for TypeScript?

I'm looking for a way to reduce the boilerplate code of my NodeJS backend. In Lombok there is e.g. the possibility to inject constructors and getter/setter by annotation for objects. Is there a wa...

stackoverflow.com](https://stackoverflow.com/questions/59136271/is-there-something-like-lombok-for-typescript?answertab=active#tab-top)
