// 의존성 설정
const express = require('express');
const redis = require('redis');
const axios = require('axios');
const bodyParser = require('body-parser');

// 서비스 포트 선언
const port_redis = 6379;
const port = 3005;

// Redis 포트를 6379로 설정
const redis_client = redis.createClient(port_redis);

// express 서버 설정
const app = express();

// Body Parser 미들웨어
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// 캐시 체크를 위한 미들웨어
checkCache = (req, res, next) => {
  redis_client.get(req.url, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    // Redis에 저장된게 존재한다.
    if (data != null) {
      res.send(data);
    } else {
      // Redis에 저장된게 없기 때문에 다음 로직 실행
      next();
    }
  });
};

//  [GET] /university/turkey
//  미들웨어 추가
app.get('/university/turkey', checkCache, async (req, res) => {
  try {
    console.log(req.url)
    const universityInfo = await axios.get('http://universities.hipolabs.com/search?name=university&country=turkey');

    // response에서 data 가져오기
    const universityData = universityInfo.data;
    await redis_client.setex(req.url, 3600, JSON.stringify(universityData));

    return res.json(universityData);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

// express 서버를 3005번 포트로 실행;
app.listen(port, () => console.log(`Server running on Port ${port}`));
