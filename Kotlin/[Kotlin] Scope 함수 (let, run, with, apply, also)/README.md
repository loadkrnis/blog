## Scope 함수

코틀린 표준 라이브러리는 객체의 컨텍스트 내에서 코드 블럭(익명 함수)을 실행하기 위한 목적을 가진 여러가지 함수를 제공합니다.  
이런 함수들은 람다식으로 호출 할 수 있고, 이는 임시로 범위(scope)를 형성합니다.  
해당 범위 내에서는 객체의 이름이 없어도 객체에 접근할 수 있습니다.  
이러한 함수를 _**Scope funtions**_라고 합니다. 스코프 함수의 종류는 아래와 같습니다.

-   let
-   run
-   with
-   apply
-   also

기본적으로, 이 함수들은 동일한 역할을 수행합니다.  
다른점이 있다면, scope 내에서 객체를 어떤 방식으로 호출하는지, 리턴 값을 어떻게 처리하는지입니다.

아래는 Person class가 있을 때 scope function의 사용법입니다.

#### Person.kt

```
data class Person(
  var name: String,
  var age: Int = 0,
  var address: String = ""
) {
  fun moveTo(address: String) {
    this.address = address
  }

  fun incrementAge() {
    this.age += 1
  }
}
```

```
Person("Charming", 20, "Seoul").let {
  println(it) // Person(name=Charming, age=20, address=Seoul)
  it.moveTo("Pangyo")
  it.incrementAge()
  println(it) // Person(name=Charming, age=21, address=Pangyo)
}
```

만약 _**let**_ 없이 동일한 내용의 코드를 작성한다면, 아래의 코드처럼 작성해야할 것입니다.

```
val person = Person("Charming", 20, "Seoul")
println(person) // Person(name=Charming, age=20, address=Seoul)
person.moveTo("Pangyo")
person.incrementAge()
println(person) // Person(name=Charming, age=21, address=Pangyo)
```

**Person** 객체를 사용할때마다 변수의 이름을 반복해서 작성하게 됩니다.  
scope 함수는 코틀린만의 새로운 기술이 적용된 것이 아닌,  
**코드를 좀 더 간결하고 읽기 쉽게 만들어주는 것입니다.**

scope 함수들의 비슷한 점들로 인해,  
특정 상황에 딱 맞아 떨어지는 함수를 사용하는 것이 모호할 수 있습니다.  
  
**이 때 작성하고자 하는 코드의 의도와 프로젝트의 컨벤션으로 사용할 함수를 쉽게 결정할 수 있습니다.  
**  
아래에서 scope 함수와 각각의 차이점에 대해 상세히 살펴보겠습니다.

## Scope 함수 간 차이점

scope 함수는 본질이 비슷하기 때문에, 각각의 차이점을 잘 아는 것이 중요합니다.  
각 scope 함수에는 두 가지 큰 차이점이 있습니다.

>  - 객체의 컨텍스트를 참조하는 방식  
>  - 리턴 값

### 컨텍스트를 참조하는 방식 : this 혹은 it

scope 함수의 익명 함수(람다식) 내에서 객체는 실제 이름 대신 짧은 참조 이름으로 사용할 수 있습니다.  
각각의 scope 함수에서 객체에 접근하기 위해 다음 두 가지 방법 중 하나를 사용합니다.

-   람다 수신자 (_**this**_)
-   람다 인자 (_**it**_)

둘 다 동일한 역할을 하는데,  
상황 별로 각각의 장점과 단점에 대해 알아보고 권장하는 방식을 알아보겠습니다.

```
// this
"Hello".run {
  println("The receiver string length: $length")
  println("The receiver string length: ${this.length}")
  // 위 두 줄의 코드는 동일한 역할을 합니다.
}

// it
"Hello".let { println("The receiver string's length is ${it.length}") }
```

#### this

_**run**_, _**with**_, _**apply**_ 는 _**this**_ 키워드로 람다 수신자로서 컨텍스트 객체를 참조합니다.  
그러므로, 이 람다에서 객체는 일반 객체 함수로도 사용이 가능합니다.  
대부분의 경우, 수신 객체의 멤버에 접근할 때 _**this**_ 를 생략함으로써 코드를 간략하게 작성할 수 있습니다.  
  
반면, _**this**_ 가 생략되면, 수신 객체 멤버와 외부 변수를 구분하기 어려울 수 있습니다.  
따라서 수신자(_**this**_)로 컨텍스트 객체를 받는 scope 함수는 주로 객체의 함수를 호출하거나,   
프로퍼티를 할당하는 것과 같이 객체 멤버를 처리할 때 사용하는 것을 권장합니다.

```
val charming =
  Person("Charming").apply {
    age = 20 // this.age = 20 과 charming.age = 20 전부 동일한 역할을 합니다.
    address = "Seoul"
  }
```

#### it

_**let**_, _**also**_ 는 객체를익명 함수 매개변수로 가집니다.  
만약 인자의 이름을 정하지 않았다면, 묵시적으로 기본 이름인 _**it**_ 으로 접근할 수 있습니다.  
_**it**_ 은 _**this**_ 보다 짧으며, 주로 _**it**_ 을 사용한 표현식은 읽기 쉽습니다.

```
fun getRandomInt(): Int {
  return Random.nextInt(100).also { 
    println("getRandomInt() generated value $it") 
  }
}

val randomInt = getRandomInt()
```

또한, 익명 함수의 매개변수를 지정함으로써   
컨텍스트 객체의 커스텀한 이름을 설정할 수 있습니다.

```
fun getRandomInt(): Int {
  return Random.nextInt(100).also { value -> 
    println("getRandomInt() generated value $value") 
  }
}

val random = getRandomInt()
```

#### 리턴 값

scope 함수들은 리턴 값이 다릅니다.

-   _**apply**_ 와 _**also**_ 는 컨텍스트 객체(_**this**_)를 리턴합니다.
-   _**let**_, _**run**_, _**with**_ 는 익명 함수(람다식)의 결과를 리턴합니다.

이 옵션들은 다음에 어떤 코드를 작성할 것인지에 따라 적절한 함수를 선택할 수 있습니다.

#### 컨텍스트 객체(this)를 리턴하는 함수

_**apply**_ 와 _**also**_ 의 리턴 값은 컨텍스트 객체 그 자신(_**this**_)입니다.  
그러므로 _**apply**_ 와 _**also**_ 는 체이닝 함수로도 활용할 수 있습니다.

```
val numberList =
  mutableListOf(6, 5, 4, 3)
    .also { println("push the list") }
    .apply {
      add(7)
      add(8)
      add(9)
    }
    .also { println("sort the list") }
    .sort()
    .also { println(this) }
```

#### 익명 함수(람다식)의 결과를 리턴하는 함수

_**let**_, _**run**_, _**with**_ 는 익명 함수의 결과를 반환합니다.  
따라서 이 scope 함수들은 변수에 연산 결과를 할당할 때나,  
연산 결과에 연산을 연결할 때 등의 상황에서 사용할 수 있습니다.

```
val numbers = mutableListOf("one", "two", "three")
val countEndsWithE =
  numbers.run {
    add("four")
    add("five")
    count { it.endsWith("e") }
  }
println("There are $countEndsWithE elements that end with e.")
// There are 3 elements that end with e.
```

또한, 변수를 위한 임시 scope를 만들기 위해 리턴 값을 무시하고 scope 함수를 사용할 수 있습니다.

```
val numbers = mutableListOf("one", "two", "three")
with(numbers) {
  val firstItem = first()
  val lastItem = last()
  println("First item: $firstItem, last item: $lastItem")
  // First item: one, last item: three
}
```

## 적절한 scope 함수

상황에 맞는 scope 함수를 선택할 수 있도록 권장하는 방식의 사용 예시와 함께 설명드리겠습니다.  
사실 많은 상황에서 scope 함수는 교체될 수 있습니다.  
따라서 아래의 예시에서는 일반적인 사용 방식을 선정하였습니다.

### let

컨텍스트 객체는 인자(_**it**_)으로 사용 가능합니다.  
**이 컨텍스트 객체의 리턴 값은 람다의 결과입니다.  
**

_**let**_은 호출 체인의 결과로 하나 혹은 그 이상의 함수를 호출할 때 사용됩니다.  
예를 들어 다음의 코드는 컬렉션의 두 연산 결과를 출력합니다.

```
val numbers = mutableListOf("one", "two", "three", "four", "five")
val resultList = numbers.map { it.length }.filter { it > 3 }
println(resultList) // [5, 4, 4]
```

같은 기능을 _**let**_ 으로 아래와 같이 작성할 수 있습니다.

```
val numbers = mutableListOf("one", "two", "three", "four", "five")
numbers.map { it.length }.filter { it > 3 }.let {
  println(it) // [5, 4, 4]
  // 필요하다면 더 많은 함수를 호출할 수 있습니다.
}
```

만약 scope 함수 블록에 _**it**_ 을 인자로 가지는 단일 함수가 있다면  
람다 대신 참조(**::**)를 사용할 수 있습니다.

```
val numbers = mutableListOf("one", "two", "three", "four", "five")
numbers.map { it.length }.filter { it > 3 }.let(::println) // [5, 4, 4]
```

_**let**_ 은 종종 **null**이 아닌 상태에서만 코드 블럭을 실행시키는 데에 사용됩니다.  
**null**이 아닌 객체에 동작을 수행하기 위해서는, 해당 객체에 **safe call(?.)**을 사용하고 let을 호출하면 됩니다.

```
fun main(str: String?) {
  val length =
    str?.let {
      println("let() called on $it") // str이 존재할 때만 호출 됨
      println(it.isNullOrBlank()) // false '?.let { }' 안에서는 'it'이 null이 아님
      it.length
    }
  println(length) // length의 타입은 Int?
}
```

_**let**_ 을 사용하는 또 다른 방법은 코드 가독성을 높이기 위해 제한된 scope 내에서 지역 변수를 사용하는 것입니다.  
컨텍스트 객체를 이용해 새로운 변수를 선언할 때 주로 사용됩니다.

```
val numbers = listOf("one", "two", "three", "four")
val modifiedFirstItem =
  numbers
    .first()
    .let { firstItem ->
      println(firstItem) // one
      if (firstItem.length >= 5) firstItem else "!$firstItem!"
    }
    .uppercase(Locale.getDefault())
println(modifiedFirstItem) // !ONE!
```