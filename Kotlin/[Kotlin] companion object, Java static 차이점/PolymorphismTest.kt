import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe

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
