> 본 포스트는 Netflix 기술 블로그에서 발췌한 [Ready for changes with Hexagonal Architecture](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749) 게시글을 번역한 것입니다.

Netflix Originals의 제작이 매년 증가함에 따라 컨텐츠 제작 과정에서 효율성을 증가시키는 앱을 구축해야 할 필요성도 커지고 있습니다. 우리의 `Winder Studio Engineering` 팀은 컨텐츠 스크립트 획득, 거래 협상 및 공급업체 관리, 제작 절차 간소화 등 컨텐츠의 각본부터 제생에 이르기까지 제작을 돕는 수많은 앱을 구축했습니다.

# 처음부터 엄청난 통합
약 1년 전, Studio Workflow 팀은 비즈니스의 여러 도메인을 넘나드는 새로운 앱을 개발하기 시작했습니다. 우리는 흥미있는 과제를 가지고 있었습니다. 처음부터 어플리케이션의 핵심(core)을 만들어야 했고, 각기 다른 시스템에 있는 데이터도 필요했습니다.

영화, 제작일, 직원, 촬영지 등 우리가 필요한 데이터는 여러 프로토콜들로 흩어져 있었습니다. (gRPC, JSON API, GraphQL 등) 흩어져 있는 기존 데이터들은 어플리케이션의 동작과 비즈니스 로직에 매우 중요한 영향을 끼치기 때문에 우리는 꼭 시작부터 `통합(integrate)`할 필요가 있었습니다.

# 스왑 가능한 데이터
생산량 향상을 위한 초기 어플리케이션 중 하나는 모노리스(monolith)로 구축되었습니다. docker와 같은 container space에 대한 지식이 없는 동안 모놀리스는 빠른 발전과 빠른 변화를 가능하게 했습니다. 한때는 30명 이상의 개발자가 하나의 모놀리스 어플리케이션을 개발했고 300개가 넘는 데이터베이스 테이블이 있었습니다.

시간이 지남에 따라 어플리케이션의 서비스의 `영역`이 넓어지기 보다 `전문성`이 깊어지는 것으로 발전했고, 그 결과 모놀리스를 특정 서비스와 도메인 단위로 분해하기로 결정했습니다. 이러한 결정은 컴퓨팅 성능 문제에 의해 고려된 것이 아닌 도메인별로 나눈 모든 서비스를 배정한 담당 팀이 서비스를 `독릭적`으로 `전문성` 있게 개발할 수 있기 때문입니다.

새로운 어플리케이션에 필요한 대용량의 데이터는 여전히 모놀리스를 통해 제공받았지만, 모놀리스가 언제가 전부 분해될 것을 예상했습니다. 그 시기는 특정지을 수 없었지만 `대비`는 필요했습니다. 

이렇게 하여 여전히 모놀리스의 데이터베이스 중 일부를 활용해야 했지만, 마이크로 서비스가 시작되는 즉시 기존 데이터베이스를 교체할 수 있도록 준비할 수 있었습니다. 

# 육각형 설계의 영향력
비즈니스 로직에 영향을 끼치지 않고 데이터베이스를 교체 할 수 있는 기능을 지원해야 했습니다. 그러기 위해서는 먼저 데이터베이스를 분리해야 했습니다. 그래서 우리는 육각형 설계의 원리를 기반으로 어플리케이션을 구축하기로 했습니다.  
```
src
│   app.js          # App entry point
└───api             # Express route controllers for all the endpoints of the app
└───config          # Environment variables and configuration related stuff
└───jobs            # Jobs definitions for agenda.js
└───loaders         # Split the startup process into modules
└───models          # Database models
└───services        # All the business logic is here
└───subscribers     # Event handlers for async task
└───types           # Type declaration files (d.ts) for Typescript
```
