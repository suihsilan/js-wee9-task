//dom
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCart = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const totalAmount = document.querySelector(".totalAmount");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
//變數資料區
let productList = [];
let shopCartList = [];
let order = [];

//執行區
init();
//init初始化
function init() {
  getProductList();
  getCartList();
}

//取的產品資料
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then((res) => {
      productList = res.data.products;
      console.log(productList);
      //組字串
      let str = "";
      productList.forEach((product) => {
        str += combinationHtmlStr(product);
      });
      productWrap.innerHTML = str;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

//篩選功能
productSelect.addEventListener("change", (e) => {
  if (e.target.value === "全部") {
    getProductList();
    return;
  }

  const category = e.target.value;
  let str = "";
  productList.forEach((product) => {
    if (category === product.category) {
      str += combinationHtmlStr(product);
    }
  });
  productWrap.innerHTML = str;
});

//重構組字串
function combinationHtmlStr(product) {
  return `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${product.images}" alt="">
            <a href="#" data-id="${
              product.id
            }" class="addCardBtn">加入購物車</a>
            <h3>${product.title}</h3>
            <del class="originPrice">NT$${new Intl.NumberFormat("zh-TW").format(
              product.origin_price
            )}</del>
            <p class="nowPrice">NT$${new Intl.NumberFormat("zh-TW").format(
              product.price
            )}</p>
          </li>
      `;
}

//new Intl.NumberFormat("zh-TW").format(total)
//new Intl.NumberFormat('zh-TW').format(product.price)
//new Intl.NumberFormat('zh-TW').format(product.origin_price)

//加入購物車監聽
productWrap.addEventListener("click", (e) => {
  e.preventDefault();

  let addCardClass = e.target.getAttribute("class");

  //排除不想要的
  if (addCardClass !== "addCardBtn") {
    return;
  }

  //取得點選的品項要加入到購物車列表 e.target的id
  let productId = e.target.getAttribute("data-id");
  console.log(productId);

  //加入購物車邏輯
  let numCheck = 1;
  shopCartList.forEach((item) => {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });
  //將使用者點擊的購物車清單資料回傳到資料庫
  //{
  //   "data": {
  //     "productId": "UukJPfALG3ziwlOIKITn",
  //     "quantity": 3
  //   }
  // }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then((res) => {
      alert("加入購物車");
      getCartList();
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

// 取的購物車資料
function getCartList() {
  //從伺服器取的使用者加入購物車的資料清單
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((res) => {
      let totalPaid = res.data.finalTotal;
      //購物車資料
      shopCartList = res.data.carts;

      let str = "";
      shopCartList.forEach((item) => {
        str += `
       <tr>
          <td>
            <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>NT$${new Intl.NumberFormat("zh-TW").format(
            item.product.price
          )}</td>
          <td>${item.quantity}</td>
          <td>NT$${new Intl.NumberFormat("zh-TW").format(
            item.product.price * item.quantity
          )}</td>
          <td class="discardBtn">
            <a href="#" data-id="${
              item.id
            }" class="material-icons" js-deleteItem>
                clear
            </a>
          </td>
        </tr>
      `;
      });
      shoppingCart.innerHTML = str;
      totalAmount.textContent = new Intl.NumberFormat("zh-TW").format(
        totalPaid
      );
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

//刪除單筆購物車
shoppingCart.addEventListener("click", (e) => {
  e.preventDefault();
  let cartId = e.target.dataset.id;
  if (cartId == null) return;
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then((res) => {
      alert("刪除單筆購物車成功");
      getCartList();
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

//刪除全部
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/`
    )
    .then((res) => {
      alert("已刪除全部產品");
      getCartList();
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (shopCartList.length === 0) {
    alert("請加入商品到購物車");
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;

  if (
    customerName === "" ||
    customerPhone === "" ||
    customerEmail === "" ||
    customerAddress === "" ||
    tradeWay === ""
  ) {
    alert("輸入資料不能為空，請重新輸入");
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      }
    )
    .then((res) => {
      order = res.data;
      console.log(order);
      document.querySelector(".orderInfo-form").reset();
      getCartList();
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});
