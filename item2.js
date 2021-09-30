let request = require("./utils/request");
let fs = require("fs");
class Statistics {
  constructor(times) {
    this.times = times;
    // 要查询的货币品种
    this.queryCoinIdList = [
      "Bitcoin",
      "Ethereum",
      "Zilliqa",
      "Litecoin",
      "Bytom",
      "UNIVERSE Token",
      "Aave",
      "Flow",
    ];
    this.timeList = ["2020-3-14","2020-3-15","2020-3-16","2020-3-17","2020-3-1"];
    this.coinIdList = [];
    this.data = {};
  }
  sleep(millisecond) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, millisecond);
    });
  }
  // 获取筛选的数据
  async getData() {
    try {
      this.coinIdList = await this.queryCoinId();
      for (let index = 0; index < this.coinIdList.length; index++) {
        try {
          await this.sleep(2000)
          await this.queryCoinHistory(this.coinIdList[index]);
          if (index >= this.coinIdList.length - 1) {
            // fs.readFile("./db/data.js",function(err,data){
            //   console.log(data.toString())
            // })
            fs.writeFile(
              "./db/data.js",
              ` let data = ${JSON.stringify(this.data)}`,
              (error) => {
                if (!error) console.log("写入成功");
              }
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 获取查询币的ID
  async queryCoinId() {
    try {
      let result = await request.get(
        "https://api.coingecko.com/api/v3/coins/list?include_platform=false"
      );
      return result.data.filter((item) => {
        let result2 = this.queryCoinIdList.some((item2) => item2 === item.name);
        return result2;
      });
    } catch (error) {
      return Promise.reject(error.message);
    }
  }
  // 查看货币历史价格
  async queryCoinHistory(coinId) {
    let promiseList = [];
    this.timeList.forEach((time) => {
      let dateArr = time.split("-");
      let result = request.get(
        `https://api.coingecko.com/api/v3/coins/${coinId.id}/history`,
        {
          params: {
            date: `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`,
          },
        }
      );
      promiseList.push(result);
    });
    try {
      let result = await Promise.all(promiseList);
      let arr = result.map((response) => {
        console.log("q3qweqweqw",response)
        if (!response.data.hasOwnProperty("market_data")) {
          return {
            name: response.config.params.date,
            price: 0,
          };
        }
        return {
          name: response.config.params.date,
          price: response.data.market_data.current_price.usd,
        };
      });
      this.data[coinId.name] = arr;
      return "ok";
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }
}

let a = new Statistics();
a.getData();
