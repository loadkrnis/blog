import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import jdk.jshell.UnresolvedReferenceException

class Calculator {
  companion object MyCompanion {
    val name = "계산기"
    fun add(a: Int, b: Int) = a + b
  }
}

class CalculatorTest : DescribeSpec({
  it("클래스에 정의된 companion object는 부여된 새로운 이름으로 접근이 가능하다.") {
    ICalculator.MyCompanion.name shouldBe "계산기"
    ICalculator.MyCompanion.add(1, 3) shouldBe 4
  }

  it("클래스에 정의된 companion object는 변수로 할당이 가능하다.") {
    val calculatorMyCompanion = ICalculator.MyCompanion

    calculatorMyCompanion.name shouldBe "계산기"
    calculatorMyCompanion.add(1, 3) shouldBe 4
  }

  it("새로운 이름으로 companion object를 정의해도 이름 명시 없이 사용할 수 있다.") {
    Calculator.name shouldBe "계산기"
    Calculator.add(1, 3) shouldBe 4
  }

  it("companion object에 새로운 이름을 부여하면, Companion 이라는 속성은 접근할 수 없다.") {
    val exception = shouldThrow<UnresolvedReferenceException> {
    }

    exception.message shouldBe "Unresolved reference: Companion"
  }
})
