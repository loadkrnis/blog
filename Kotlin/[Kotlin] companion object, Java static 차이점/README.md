이 글은 코틀린의 companion object와 Java의 static 키워드의 차이점에 대해 학습한 것을 정리하였습니다.

### **object class**

코틀린은 자바에 없는 독특한 싱글톤(Singleton) 선언 방법이 있습니다.  
아래처럼 **class** 키워드 대신 **object** 키워드를 사용하면 됩니다. 

```kotlin
object Singleton {
  val name = "singleton"
  fun print() = println("hello")
}

fun main() {
  println(Singleton.name) // "singleton"
  Singleton.print() // "hello"
  
  val singleton = Singleton() // 에러!
}
```

**object** 키워드로 선언한 속성과 메소드는 **static** 키워드로 선언한 것과 사용법이 같습니다.  
어떻게보면 유사하다고 생각이 들 수 있습니다. 하지만 **static** 키워드와 다른 점은 해당 클래스의 인스턴스 생성은 불가능합니다.

> 싱글톤에 대해 추가로 설명을 붙이자면 시스템 전체에서 사용할 기능을 수행할 때 큰 도움이 될 수 있지만 여러곳에서 동시에 접근해서 생길 수 있는 동기화 문제 등으로 위험할 수 있으니 잘 파악하고 설계해야합니다.

언어 수준에서 안전한 싱글톤을 제공한다는 점에서 **object**는 유용합니다.  
**companion object** 키워드는 위에서 설명드린 **object**의 특수한 형태입니다.

### **companion object**

코틀린의 **companion object**는 **static(정적)**이 아닙니다.  
다만 사용하는 입장에서 **static**으로 동작하는 것처럼 보일 뿐입니다.

```kotlin
class Calculator {
  companion object {
    val name = "계산기"
    fun add(a: Int, b: Int) = a + b
  }
}

fun main() {
  println(Calculator.name) // "계산기"
  println(Calculator.add(1, 2)) // 3

  println(Calculator.Companion.name) // "계산기"
  println(Calculator.Companion.add(1, 2)) // 3

  val calculatorCompanion = Calculator.Companion
  println(calculatorCompanion.name) // "계산기"
  println(calculatorCompanion.add(1, 2)) // 3
}
```

Calculator에 선언되어 있는 companion object는 객체이므로 변수로도 할당할 수 있습니다.  
이렇게 변수에 할당하는 것은 자바의 static 키워드를 사용하는 방법으로는 불가능한 방법입니다.

위 코드를 보시면 Calculator.Companion을 변수로 할당이 가능한 점을 보았을 때  
**클래스에 정의된 companion object는 객체라고 유추할 수 있습니다.  
**또한 companion object에 이름을 부여할 수 있습니다.  
아래부터 작성하는 예제코드는 kotest를 이용한 학습 테스트를 함께 작성하겠습니다.

```kotlin
class Calculator {
  companion object MyCompanion {
    val name = "계산기"
    fun add(a: Int, b: Int) = a + b
  }
}

class CalculatorTest : DescribeSpec({
  it("클래스에 정의된 companion object는 부여된 새로운 이름으로 접근이 가능하다.") {
    Calculator.MyCompanion.name shouldBe "계산기"
    Calculator.MyCompanion.add(1, 3) shouldBe 4
  }

  it("클래스에 정의된 companion object는 변수로 할당이 가능하다.") {
    val calculatorMyCompanion = Calculator.MyCompanion

    calculatorMyCompanion.name shouldBe "계산기"
    calculatorMyCompanion.add(1, 3) shouldBe 4
  }

  it("새로운 이름으로 companion object를 정의해도 이름 명시 없이 사용할 수 있다.") {
    Calculator.name shouldBe "계산기"
    Calculator.add(1, 3) shouldBe 4
  }

  it("companion object에 새로운 이름을 부여하면, Companion 이라는 속성은 접근할 수 없다.") {
    val exception = shouldThrow<UnresolvedReferenceException> {
      Calculator.Companion
    }

    exception.message shouldBe "Unresolved reference: Companion"
  }
})
```

위 테스트를 보시면  
companion obejct 이름을 **MyCompanion**으로 선언 후부터는 **Companion** 이라는 키워드는 사용할 수 없게됩니다. 여기서 유추해볼 수 있는 점은 **클래스에 companion object는 한개만 선언할 수 있다는 점입니다.** (가장 마지막 테스트는 컴파일시점에 에러가 발생하기 때문에 테스트가 실행되지 않습니다.)

추가적으로 인터페이스에서도 companion object를 정의할 수 있습니다.

```kotlin
interface ICalculator {
  companion object MyCompanion {
    val name = "계산기"
    fun add(a: Int, b: Int) = a + b
  }
}

class ICalculatorTest : DescribeSpec({
  it("인터페이스에 정의된 companion object는 부여된 새로운 이름으로 접근이 가능하다.") {
    ICalculator.MyCompanion.name shouldBe "계산기"
    ICalculator.MyCompanion.add(1, 3) shouldBe 4
  }

  it("인터페이스에 정의된 companion object는 변수로 할당이 가능하다.") {
    val calculatorMyCompanion = ICalculator.MyCompanion

    calculatorMyCompanion.name shouldBe "계산기"
    calculatorMyCompanion.add(1, 3) shouldBe 4
  }

  it("새로운 이름으로 companion object를 정의해도 이름 명시 없이 사용할 수 있다.") {
    Calculator.name shouldBe "계산기"
    Calculator.add(1, 3) shouldBe 4
  }
})
```

코틀린은 인터페이스 내에서 companion object를 선언할 수 있습니다. 덕분에 인터페이스 수준에서 상수항을 정의할 수 있고, 관련된 중요 로직을 작성할 수 있습니다.

### **Shadowing**

부모 클래스를 상속한 자식 클래스에 모두 companion object를 만들고 같은 이름의 멤버를 정의했을 때, 자식 클래스에서 이 멤버를 참조하면 부모의 멤버는 가려지고 자식 자신의 멤버만 참조할 수 있습니다.

```kotlin
open class Parent {
  companion object {
    val name = "부모"
  }

  fun parentMethod() = name
}

class Child : Parent() {
  companion object {
    val name = "자식"
  }

  fun childMethod() = name
}

class ShadowingTest : DescribeSpec({
  it("부모 클래스에서 companion object를 호출하면 부모 클래스의 값이 반환된다.") {
    Parent.name shouldBe "부모"
  }

  it("자식 클래스에서 companion object를 호출하면 자식 클래스의 값이 반환된다.") {
    Child.name shouldBe "자식"
  }

  it("부모 클래스에서 사용하는 부모 메소드는 부모 클래스의 값이 반환된다.") {
    val parent = Parent()

    parent.parentMethod() shouldBe "부모"
  }

  it("자식 클래스에서 사용하는 자식 메소드는 자식 클래스의 값이 반환된다.") {
    val child = Child()

    child.childMethod() shouldBe "자식"
  }

  it("자식 클래스에서 사용하는 부모 메소드는 부모 클래스의 값이 반환된다.") {
    val child = Child()

    child.parentMethod() shouldBe "부모"
  }
})
```

위 처럼 상속 관계에서 companion object 멤버는 같은 이름일 경우 가려집니다. 이를 **shadowing** 이라고 합니다.

여기서 조금 헷갈릴 수 있는 부분은 child.parentMethod() 의 결과가 "부모"인 점입니다.  
위 코드에서 자식클래스의 companion object에 이름을 부여하여 테스트 코드를 작성해보겠습니다.

```kotlin
open class Parent {
  companion object {
    val name = "부모"
  }
}

class Child : Parent() {
  companion object ChildCompanion {
    val name = "자식"
  }

  fun name() = name
  fun childCompanionName() = ChildCompanion.name
  fun companionName() = Companion.name
}

class ShadowingTest : DescribeSpec({
  it("자식 클래스의 name 메소드는 자식을 반환한다.") {
    Child().name() shouldBe "자식"
  }

  it("자식 클래스의 childCompanionName 메소드는 자식을 반환한다.") {
    Child().childCompanionName() shouldBe "자식"
  }

  it("자식 클래스의 companionName 메소드는 부모를 반환한다.") {
    Child().companionName() shouldBe "부모"
  }
})
```

위 코드를 보시면 **자식이 부모의 companion object에 직접 접근이 가능합니다.** companionName() 메소드에 선언되어 있는 Companion은 자식 것이 아닙니다. 왜냐하면 자식은 ChildCompanion로 이름을 변경했기 때문입니다. 그래서 여기서 **Companion은 부모가 됩니다.**

위 테스트들을 통해 부모/자식의 companion object에 정의된 멤버는 자식 입장에서 접근할 수 있습니다. 하지만 **부모와 자식이 같은 이름을 쓰면 shadowing 되어 감춰진다는 점입니다.**

### **다형성**

만약 아래와 같이 다형성과 companion object를 곁들이게 된다면 어떻게 될지 알아보겠습니다.

```kotlin
open class Parent {
  companion object {
    val name = "부모"
  }

  open fun method() = name
}

class Child : Parent() {
  companion object {
    val name = "자식"
  }

  override fun method() = name
}

class PolymorphismTest : DescribeSpec({
  it("다형성 테스트") {
    Parent.name shouldBe "부모"
    Child.name shouldBe "자식"

    val parent: Parent = Child()
    parent.method() shouldBe "???"
  }
})
```

분명 Child 클래스의 객체를 생성했으나 Parent 클래스로 형 변환을 했습니다.  
그럼 이때 호출한 method() 의 결과는 어떻게 될까요?

먼저 이 문제는 companion object 문제가 아닙니다.  
사실 다형성에 대한 질문입니다.  
이 질문에 답하기 위해 먼저 다형성에 대해 간략히 숙지할 필요가 있습니다.

> 다형성의 조건   
>   
> 1\. **대체 가능성(substitution)**  
> 어떤 형을 요구한다면 그 형의 자식형으로 그 자리를 대신할 수 있다.  
>   
> 2\. **내적 동질성(internal identity)  
> **객체는 그 객체를 참조하는 방식에 따라 변화하지 않는다. 즉 객체를 업캐스팅, 다운캐스팅해도 여전히 최초 생성한 그 객체라는 뜻입니다.

위 두 가지 조건을 만족해야 다형성을 만족하는 객체지향 언어라고 할 수 있습니다.  
다형성의 1번 조건으로 타입 캐스팅이 가능했고,  
2번 조건인 내적 동질성으로 자식을 부모형으로 캐스팅해도 그 객체는 자식이라는 것입니다.  
그러므로 결과는 **"자식"** 입니다.