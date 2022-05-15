import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe

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
